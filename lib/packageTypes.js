const packageTypeToFolderName = {
    ApexClass: {
        dir: 'classes',
        resourceInOwnSubdir: false,
    },
    AuraDefinitionBundle: {
        dir: 'aura',
        resourceInOwnSubdir: true,
    },
    CustomObject: {
        dir: 'objects',
        resourceInOwnSubdir: false,
    },
    Layout: {
        dir: 'layouts',
        resourceInOwnSubdir: false,
    },
    StaticResource:
    {
        dir: 'staticresources',
        resourceInOwnSubdir: false,
    },
};

module.exports.packageTypeToFolderName = packageTypeToFolderName;