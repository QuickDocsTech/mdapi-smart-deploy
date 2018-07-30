//this is SUPER gross.  If I get time, want to break out logic into reusable libs that are require'able and testable

const fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    readFileAsync = util.promisify(fs.readFile),
    yaml = require('js-yaml'),
    parser = new xml2js.Parser(),
    xmlBuilder = new xml2js.Builder();

const xml2jsOpts = {  // options passed to xml2js parser
    explicitCharkey: false, // undocumented
    trim: true,            // trim the leading/trailing whitespace from text nodes
    normalize: false,       // trim interior whitespace inside text nodes
    explicitRoot: false,    // return the root node in the resulting object?
    emptyTag: null,         // the default value for empty nodes
    explicitArray: true,    // set everything to array
    ignoreAttrs: false,     // ignore attributes, only create text nodes
    mergeAttrs: false,      // merge attributes and child elements
    validator: null         // a callable validator
};

async function generagePackageXML(deployMetadata) {
    let packageData = {
        Package: {
            '$': { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
            types: [],
            version: ['43.0']
        }
    };

    for (let type in deployMetadata) {
        packageData.Package.types.push({
            name: [type],
            members: deployMetadata[type],
        });
    }

    return xmlBuilder.buildObject(packageData);
}

(async () => {
    const xml = await readFileAsync('../example/src/package.xml');
    parser.parseString(xml, (e, r) => {
        console.log('package.xml as json', e, r);
        console.log('package.xml:Package.types as json', r.Package.types);

        const genXml = xmlBuilder.buildObject(r);
        console.log('package.xml to json', genXml);
    });

    const deployMetadata = yaml.safeLoad(fs.readFileSync('../example/deploy-metadata.yaml', 'utf8'));
    console.log('deployMetadata yaml', deployMetadata);

    const genPackageXML = await generagePackageXML(deployMetadata);
    console.log('GENERATED package.xml', genPackageXML);

})();