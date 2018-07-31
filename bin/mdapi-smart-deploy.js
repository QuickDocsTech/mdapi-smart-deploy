#! /usr/bin/env node
const promisify = require('util').promisify,
    exec = promisify(require('child_process').exec),
    path = require('path'),
    yaml = require('js-yaml'),
    xml2js = require('xml2js'),
    xmlBuilder = new xml2js.Builder(),
    tmp = require('tmp-promise'),
    archiver = require('archiver'),
    fs = require('fs');

const packageTypeToFolderName = require('../lib/packageTypes').packageTypeToFolderName;

const metadataYamlName = 'deploy-metadata.yaml';
const cwd = process.cwd();

const colors = {
    white: '\x1b[37m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    default: '\x1b[0m'
}

const commands = {
    deploy(config, zipFilePath) {
        return `sfdx force:mdapi:deploy -u ${config.sfdxUsername} --zipfile ${zipFilePath} --json`;
    },
    status(config, deployId) {
        return `sfdx force:mdapi:deploy:report -i ${deployId} -u ${config.sfdxUsername} --json`;
    },
}

function getSrcDirPath(cfg) {
    const sfdcSrcDir = path.join(cwd, cfg['src-dir']);
    if (!fs.existsSync(sfdcSrcDir)) {
        throw new Error(`Source dir ${sfdcSrcDir} does not exist.  Are you running this cmd from your repo root?`);
    }

    return sfdcSrcDir;
}

function logAndAbort(error) {
    console.error(error);
    process.exit(1);
}

function abort(message) {
    console.error(colors.red + `Error: ${message}`);
    process.exit(2);
}

async function generagePackageXML(config) {
    let packageData = {
        Package: {
            '$': { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
            types: [],
            version: ['43.0']
        }
    };

    for (let type in config.deployMetadata) {
        packageData.Package.types.push({
            name: [type],
            members: config.deployMetadata[type],
        });
    }

    return xmlBuilder.buildObject(packageData);
}

async function createZip(config) {
    let tmpZipPath = await tmp.tmpName({ postfix: '.zip' });
    if ('verbose' in config) {
        console.log(`zipping to ${tmpZipPath}`);
    }

    let output = fs.createWriteStream(tmpZipPath);
    let archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    return new Promise((resolve, reject) => {
        output.on('close', () => resolve(tmpZipPath));
        output.on('error', (e) => reject(e));
        output.on('warning', (e) => reject(e));

        archive.pipe(output);

        for (let type in config.deployMetadata) {
            if (!packageTypeToFolderName[type]) {
                throw new Error(`metadata type ${type} not supported`);
            }

            const typeSrcDir = path.join(config['src-dir'], packageTypeToFolderName[type].dir);

            if (packageTypeToFolderName[type].resourceInOwnSubdir) {
                for (let srcFolder of config.deployMetadata[type]) {
                    if ('verbose' in config) {
                        console.log(`+ DIR ${typeSrcDir}/${srcFolder}/`);
                    }
                    archive.directory(`${typeSrcDir}/${srcFolder}/`);
                }
            } else {
                for (let filePrefix of config.deployMetadata[type]) {
                    if ('verbose' in config) {
                        console.log(`+ FILES ${typeSrcDir}/${filePrefix}.*`);
                    }
                    archive.glob(`${typeSrcDir}/${filePrefix}.*`);
                }
            }
        }

        archive.append(config.packageXml, { name: config['src-dir'] + '/package.xml' });
        archive.finalize();
    });
}

async function doExec(config, cmd) {
    try {
        const { stdout, stderr } = await exec(cmd);
        if (stderr) {
            return JSON.parse(stderr);
        }
        return JSON.parse(stdout);
    } catch (error) {
        if ('verbose' in config) {
            console.log('caught exec error', error);
        }
        return JSON.parse(error.stderr);
    }
}

(async () => {
    let defaultConfig = {
        'src-dir': 'src',
        srcDirPath: '',
        deployMetadata: {},
        packageXml: '',
        sfdxUsername: process.env.SFDC_SANDBOX_USERNAME
    };

    const validCliOpts = [
        'verbose',
        'src-dir',
        'only-gen-package-xml'
    ];

    let config = process.argv.reduce((currentConfig, val, index, array) => {
        const optPieces = val.split('--'),
            opt = optPieces[1];

        if (-1 !== validCliOpts.indexOf(opt)) {
            currentConfig[opt] = array[index + 1];
        }
        return currentConfig;
    }, defaultConfig);

    if (!process.env.SFDC_SANDBOX_USERNAME) {
        abort(`Must define SFDC_SANDBOX_USERNAME enviornment variable`);
    }

    try {
        config.srcDirPath = getSrcDirPath(config);
        config.deployMetadata = yaml.safeLoad(fs.readFileSync(path.join(cwd, metadataYamlName), 'utf8'));

        if ('verbose' in config) {
            console.log('config:', config);
        }

        config.packageXml = await generagePackageXML(config);

        if ('only-gen-package-xml' in config) {
            console.log(config.packageXml);
            process.exit(0);
        }

        const zipPath = await createZip(config);

        console.log(`Deploying ${zipPath} under username ${config.sfdxUsername}`);

        let res = await doExec(config, commands.deploy(config, zipPath));

        console.log(`=== Deploy ${res.result.status} ===`);

        //TODO; replace exec with execFileSync and parse json
        while (-1 == ['Succeeded', 'Canceled', 'Failed'].indexOf(res.result.status)) {
            res = await doExec(config, commands.status(config, res.result.id));
            if ('InProgress' === res.result.status) {
                console.log(`  ${res.result.status}: (${res.result.numberComponentsDeployed}/${res.result.numberComponentsTotal})`);
            } else {
                console.log(`=== Deploy ${res.result.status} ===`);
            }
        }

        if ('Failed' === res.result.status) {
            if (res.result.details.componentFailures) {
                let failureDetails = [];
                if (Array.isArray(res.result.details.componentFailures)) {
                    failureDetails = res.result.details.componentFailures;
                }
                else {
                    failureDetails.push(res.result.details.componentFailures);
                }

                for (let failure of failureDetails) {
                    abort(`${failure.fileName}: Line ${failure.lineNumber}, col ${failure.columnNumber} : ${failure.problem}`);
                }
            }
        }
    } catch (e) {
        logAndAbort(e);
    }
})();
