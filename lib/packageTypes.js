const packageTypeToFolderName = {
    ApexClass: {
        dir: 'classes',
    },
    AuraDefinitionBundle: {
        dir: 'aura',
        resourceInOwnSubdir: true,
    },
    CustomObject: {
        dir: 'objects',
    },
    Layout: {
        dir: 'layouts',
    },
    StaticResource:
    {
        dir: 'staticresources',
    },
    Role:
    {
        dir: 'roles',
    },
    ReportType:
    {
        dir: 'reportTypes',
    },
    PermissionSet:
    {
        dir: 'permissionsets',
    },
    Settings:
    {
        dir: 'settings',
    },

    Profile:
    {
        dir: 'profiles',
    },
    CustomObjectTranslation:
    {
        dir: 'roles',
    },
    DuplicateRule:
    {
        dir: 'duplicateRules',
    },
    MatchingRules:
    {
        dir: 'matchingRules',
    },
    Workflow:
    {
        dir: 'workflows',
    },
    QuickAction:
    {
        dir: 'quickActions',
    },
    ProfilePasswordPolicy:
    {
        dir: 'profilePasswordPolicies',
    },
    ProfileSessionSetting:
    {
        dir: 'profileSessionSettings',
    },
    FlexiPage:
    {
        dir: 'flexiPages',
    },
    ApexComponent:
    {
        dir: 'components',
    },
    StandardValueSet:
    {
        dir: 'standardValueSets',
    },
    ApexTrigger:
    {
        dir: 'triggers',
    },
    CustomTab:
    {
        dir: 'tabs',
    },
    Report:
    {
        dir: 'reports',
        resourceInOwnSubdir: true,
    },
    Dashboard:
    {
        dir: 'dashboards',
        resourceInOwnSubdir: true,
    },
    Group:
    {
        dir: 'groups',
    },
    DelegateGroup:
    {
        dir: 'delegateGroups',
    },
    EmailTemplate:  //TODO, do I also have to include the <name>-meta.xml file in the root of the `email` folder?
    {
        dir: 'email',
        resourceInOwnSubdir: true,
    },
    FlowDefinition:
    {
        dir: 'flowDefinitions',
    },
    Flow:
    {
        dir: 'flows',
    },
    NamedCredential:
    {
        dir: 'namedCredentials',
    },
    ApexPage:
    {
        dir: 'pages',
    },
    CustomMetadata:
    {
        dir: 'customMetadata',
    },
    CustomLabels:
    {
        dir: 'labels',
    },
    RemoteSiteSetting:
    {
        dir: 'remoteSiteSettings',
    },
    InstalledPackage:
    {
        dir: 'installedPackages',
    },
    CustomApplication:
    {
        dir: 'applications',
    },
    Queue:
    {
        dir: 'queues',
    },
    NetworkBranding:
    {
        dir: 'networkBranding',
    },
    PathAssistant:
    {
        dir: 'pathAssistants',
    },
    ConnectedApp:
    {
        dir: 'connectedApps',
    },
    ApexTestSuite:
    {
        dir: 'testSuites',
    },
    HomePageLayout:
    {
        dir: 'homePageLayouts',
    },
    CleanDataService:
    {
        dir: 'cleanDataServices',
    },
    Community:
    {
        dir: 'communities',
    },
    LeadConvertSettings:
    {
        dir: 'LeadConvertSettings',
    },
    CallCenter:
    {
        dir: 'callCenters',
    },
    Network:
    {
        dir: 'networks',
    },
    SiteDotCom:
    {
        dir: 'siteDotComSites',
    },
    Letterhead:
    {
        dir: 'letterhead',
    },
    AppMenu:
    {
        dir: 'appMenus',
    },
    //Dunno how this one works, you can specify folders and objects?
    //Ex: 
    // <members>SharedDocuments</members>
    // <members>SharedDocuments/user.jpg</members>
    // Document:
    // {
    //     dir: 'documents',
    //     resourceInOwnSubdir: true,
    // },
    GlobalValueSet:
    {
        dir: 'globalValueSets',
    },
};

module.exports.packageTypeToFolderName = packageTypeToFolderName;