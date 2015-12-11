# azure-arm-validator

[![Build Status](https://travis-ci.org/sedouard/azure-arm-validator.svg)](https://travis-ci.org/sedouard/azure-arm-validator)
[![Code Climate](https://codeclimate.com/github/sedouard/azure-arm-validator/badges/gpa.svg)](https://codeclimate.com/github/sedouard/azure-arm-validator)

A tiny server which will validate Azure Resource Manager scripts.

# What does it Do?

You probably won't need this server. It's a glorified wrapper around the [azure-cli](https://npmjs.org/azure-cli) but is used by the [Azure Quickstart Templates](https://github.com/azure/azure-quickstart-templates) project for automated template deployments.

## Endpoints

The server has two simple endpoints `/validate` and `/deploy`. 

### POST - /validate

Body:

```json
{
  "template": { 
  },
  "parameters": {
  },
  "pull_request": 44
}
```

Response:

Upon success you will recieve:

Status: 200
```json
{ "result": "Template Valid" }
```

Upon failure you will recieve:

```json
{ "result": "[azure cli error message]", "command": "[the cli command used]", "template": "[the exact template file contents used]", "parameters": "[the exact template paramters provided]"}
```

### POST - /deploy

The deploy endpoint interface is the same as `/validate` except it will deploy the template. It will keep the HTTP connection as long as required to deploy the template, but will always respond with a 202 'Accepted' status, regardless of the outcome. It is the responsibility of the client to inspect the response body for sucess, or failure.

Body:

```json
{
  "template": { 
  },
  "parameters": {
  },
  "pull_request": 44
}
```

Response:

Upon success you will recieve:

Status: 202
```json
{ "result": "Deployment Successful" }
```

Upon failure you will recieve:

```json
{ "result": "[azure cli error message]", "command": "[the cli command used]", "template": "[the exact template file contents used]", "parameters": "[the exact template parameters provided]"}
```

## Parameters File Special Values

The server by default configuration will replace several special value type fields in the parameters file:

- `GEN_UNIQUE` - Replaces this with a generated unique value suitable for domain names, storage accounts and usernames
- `GEN_PASSWORD` - Replaces this with a generated azure-compatible password, useful for virtual machine names.
- `GEN_SSH_PUB_KEY` - Replaces this with a generated SSH public key

In a typical `azuredeploy.parameters.json` your template file would look like:

```json
{
  "$schema": "http://schema.management.azure.com/schemas/2015-01-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "newStorageAccountName":{
      "value": "GEN_UNIQUE"
    },
    "location": {
      "value": "West US"
    },
    "adminUsername": {
      "value": "sedouard"
    },
    "sshKeyData": {
      "value": "GEN_SSH_PUB_KEY"
    },
    "dnsNameForPublicIP": {
      "value": "GEN_UNIQUE"
    }
  }
}

```
# Running the Server

There are a couple things to do before you can run the server.

## Configuration

A configuration file example is provided at [`./.example-config.json`](./.example-config.json):

```json
{
  "comment": "You can either set these values as environment variables or to a file called '.config.json' at the root of the repo",
  "AZURE_CLIENT_ID": "00000000-0000-0000-0000-000000000000",
  "AZURE_TENANT_ID": "00000000-0000-0000-0000-000000000000",
  "AZURE_CLIENT_SECRET": "00000000-0000-0000-0000-000000000000",
  "AZURE_REGION": "westus",
  "TEST_RESOURCE_GROUP_NAME": "azure_test_rg",
  "RESOURCE_GROUP_NAME_PREFIX": "qstci-",
  "MONGO_URL": "mongodb://localhost:27017/arm-validator",
  "PARAM_REPLACE_INDICATOR": "GEN_UNIQUE",
  "SSH_KEY_REPLACE_INDICATOR": "GEN_SSH_PUB_KEY",
  "SSH_PUBLIC_KEY": "ssh-rsa create an ssh public key using ssh-keygen",
  "PASSWORD_REPLACE_INDICATOR": "GEN_PASSWORD",
  "GITHUB_REPO": "Azure/azure-quickstart-templates",
  "AAD_CLIENT_ID_INDICATOR": "GEN_AAD"
}
```

You can set any of these values as environment variables, or placing it in a file called `.config.json` at the root of this repo making it easy to deploy.

## Mongodb

The server uses MongoDB to record created resource groups to persistenence. On restart, it will attempt to delete any resource group listed in the database. This helps ensure the unlikely possibility of a resource group hanging around after a template deployment. Be sure to set `MONGO_URL` to an accessible MongoDB instance.

## Service Prinicpal

You'll also need to [setup a service principal](https://github.com/cloudfoundry-incubator/bosh-azure-cpi-release/blob/master/docs/create-service-principal.md) for the server to access your azure subscription.

# Contributing

See the [contributin guide](./CONTRIBUTING.md) file for details on how to contribute.
