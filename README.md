# mdapi-smart-deploy

Salesforce meta-data API smart deploy to **sandboxes** (don't use this for production)

## About

`mdapi:deploy`requires that all the code on your filesystem at the time of deploy, be defined in `package.xml`.  See details [here](https://salesforce.stackexchange.com/questions/227117/metadata-api-howto-deploy-only-what-specified-in-package-xml).


I wanted to track all my sfdc in one repo, and be able to only deploy the metadata files that I'm working on at the moment, via the sfdx [mdapi:deploy](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_mdapi.htm#cli_reference_deploy) CLI command.  `mdapi-smart-deploy` to the rescue..

## Overview

In a [`deploy-metadata.yaml`](./examples/deploy-metadata.yaml) specify what you want to deploy, and `mdapi-smart-deploy` will: 

1.  Create a zip file containing a dynamically generated `package.xml`, with only the files you want to deploy.
1.  Invokes `sfdx force:mdapi:deploy` against your sandbox.
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
1.  Before promoting changes from your sandbox (to prod for example), remember to modify your `src/package.xml` to include your changes (`--only-gen-package-xml` can help generate the additions you need to make).

## Example

Please see the [examples](./examples/deploy-metadata.yaml) directory

### Options

*  `--src-dir`: specify the directory your metata files (code) lives.  Relative to the root of your git repo.  Defaults to `src`.
*  `--only-gen-package-xml`: will ONLY generate and print `package.xml` contents to `stdout`.  Will not invoke `mdapi:deploy`
*  `--verbose`: for debugging the tool

## Known issues

Big one is, only a few metadata types are supported today.  See [this issue](https://github.com/rynop/mdapi-smart-deploy/issues/1)
