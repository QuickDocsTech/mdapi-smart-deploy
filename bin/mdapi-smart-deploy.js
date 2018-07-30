#! /usr/bin/env node
const promisify = require('util').promisify,
    exec = promisify(require('child_process').exec),
    path = require('path'),
    yaml = require('js-yaml'),
    xml2js = require('xml2js'),
    xmlBuilder = new xml2js.Builder(),
    tmp = require('tmp-promise'),
    EasyZip = require('easy-zip2').EasyZip,
    fs = require('fs');

const metadataYamlName = 'deploy-metadata.yaml';
const cwd = process.cwd();

const colors = {
    white: '\x1b[37m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    default: '\x1b[0m'
}

const packageTypeToFolderName = {
    ApexClass: {
        dir: 'classes',
        resourceInOwnSubdir: false,
        suffixes: ['.cls', '.cls-meta.xml']
    },
    AuraDefinitionBundle: {
        dir: 'aura',
        resourceInOwnSubdir: true,
    },
    CustomObject: {
        dir: 'objects',
        resourceInOwnSubdir: false,
        suffixes: ['.object']
    },
    Layout: {
        dir: 'layouts',
        resourceInOwnSubdir: false,
        suffixes: ['.layout']
    },
    StaticResource:
    {
        dir: 'staticresources',
        resourceInOwnSubdir: false,
        suffixes: ['.resource', '.resource-meta.xml']
    },
};

const commands = {
    deploy(config, zipFilePath) {
        return `sfdx force:mdapi:deploy -u ${config.username} --zipfile ${zipFilePath} --json`;
    },
    status(config, deployId) {
        return `sfdx force:mdapi:deploy:report -i ${deployId} -u ${config.username} --json`;
    },
}

function run(...commands) {
    return Promise.all(commands.map(cmd => exec(cmd)));
}
function runSeries(...commands) {
    return commands.reduce((p, cmd) => p.then(() => exec(cmd)), Promise.resolve());
}

function getSrcDirPath(cfg) {
    const sfdcSrcDir = path.join(cwd, cfg.srcDir);
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

    let zip = new EasyZip();

    let files = [];
    // {
    //     source: 'easy-zip.js',
    //     target: 'easy-zip.js'
    // }, {
    //     target: 'img'
    // }, // if source is null, means make a folder
    // {
    //     source: 'jszip.js',
    //     target: 'lib/tmp.js'
    // }  // ignore missing source files

    //TODO: use https://github.com/archiverjs/node-archiver

    for (let type in config.deployMetadata) {
        if (!packageTypeToFolderName[type]) {
            throw new Exception(`type ${type} not supported`);
        }

        const typeSrcDir = config.srcDirPath + `/${packageTypeToFolderName[type].dir}`;

        if (packageTypeToFolderName[type].resourceInOwnSubdir) {
            for (let srcFolder in config.deployMetadata[type]) {
                zip.zipFolder(`${typeSrcDir}/${srcFolder}`, { rootFolder: `${packageTypeToFolderName[type].dir}/${srcFolder}` });
            }
        } else {
            for (let filePrefix in config.deployMetadata[type]) {
                for (let suffix of packageTypeToFolderName[type].suffixes) {
                    files.push({
                        source: typeSrcDir + `/${filePrefix}${suffix}`,
                        target: `${packageTypeToFolderName[type].dir}/${filePrefix}${suffix}`
                    });
                }
            }
        }
    }

    return new Promise((resolve, reject) => {
        zip.batchAdd(files, { ignore_missing: true }, () => {
            zip.writeToFile(tmpZipPath);
            resolve(tmpZipPath);
        });
    });
}

(async () => {
    let defaultConfig = {
        srcDir: 'src',
        srcDirPath: '',
        deployMetadata: {},
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
        const packageXml = await generagePackageXML(config);

        if ('verbose' in config) {
            console.log('config', config);
        }

        if ('only-gen-package-xml' in config) {
            console.log(packageXml);
            process.exit(0);
        }


    } catch (e) {
        logAndAbort(e);
    }

    // runSeries(
    //     commands.config(config),
    //     commands.ssl,
    //     commands.clean
    // )
    //     .then(() => {
    //         console.log(`
    // ${colors.green}✔ ${colors.white}Certificate for ${colors.green}*.${config.hostname}.${config.domain} ${colors.white}created successfully!
    // ${colors.cyan}Press any key ${colors.white}to open Keychain Access, then:
    //   1. Double click added certificate and expand the "Trust" section
    //   2. Change to "Always trust" on first dropdown
    //   3. If your certificate is not there you can drag and drop "ssl.crt" from this folder into Keychain Access
    // ${colors.cyan}Note! ${colors.white}Make sure the domain is routed to localhost. More info: ${colors.cyan}https://github.com/christianalfoni/create-ssl-certificate
    // `);
    //     })
    //     .then(() => run(
    //         commands.keychain
    //     ))
    //     .then(() => process.exit(0))
    //     .catch(logAndAbort)

})();
