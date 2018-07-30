# mdapi-smart-deploy

Salesforce meta-data API smart deploy for sandboxes

## About

The sfdc [mdapi:deploy](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_mdapi.htm#cli_reference_deploy) requires that you define ALL the code on your filesytem in a `package.xml` file.  

I want to keep ALL my code in git, and simply define the subset of files I want to delpoy.  `mdapi-smart-deploy` to the rescue...

In [`mdapi.yaml`](./examples/mdapi.yaml) specify what you want to deploy, and `mdapi-smart-deploy` will: 

1.  Create a zip file containing a dynamically generated `package.xml`, and ONLY the files referenced in it
1.  Invokes [mdapi:deploy](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_mdapi.htm#cli_reference_deploy)
1.  Checks status of the deploy and reports errors

## Usage

1.  Make sure the root of your git repo has a `src` dir (containing your SFDC source).  `src/package.xml` can exist, it will be ignored.
1.  Set the enviornment var `SFDC_SANDBOX_USERNAME` to your sandbox username.  Run `sfdx force:org:list` to view your usernames.
    *  bash: `export SFDC_SANDBOX_USERNAME=blah@youruser.blah`
    *  [fish shell](https://fishshell.com/): `set -x SFDC_SANDBOX_USERNAME blah@youruser.blah`
1.  Create a `deploy-metadata.yaml` in your root specifying entries you would normally put in `package.xml`.  [example](./example/deploy-metadata.yaml)
1.  Run the following from the root of your repo

    ```
    npx mdapi-smart-deploy
    ```
1.  Before promoting changes from your sandbox, remember to modify your `src/package.xml` to include your changes (`--only-gen-package-xml` can help generate the additions you need to make).
