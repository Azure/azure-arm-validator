# azure-arm-validator 

[![Build Status](https://travis-ci.org/Azure/azure-arm-validator.svg?branch=master)](https://travis-ci.org/Azure/azure-arm-validator)
[![Code Climate](https://codeclimate.com/github/sedouard/azure-arm-validator/badges/gpa.svg)](https://codeclimate.com/github/sedouard/azure-arm-validator)

A tiny server which will validate Azure Resource Manager scripts.

# What does it Do?

You probably won't need this server. It's a glorified wrapper around the [azure-cli2](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest) but is used by the [Azure Quickstart Templates](https://github.com/azure/azure-quickstart-templates) project for automated template deployments.

# Pre-requisite
- You must have Azure CLI V2 installed on server before deploying this server.

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

- `GEN-UNIQUE` - Replaces this with a generated unique value suitable for domain names, storage accounts and usernames. The length of the generated paramter will be 18 characters long.
- `GEN-UNIQUE-[N]` - Replaces this with a generated unique value suitable for domain names, sotrage accounts and usernames. The length is specified by `[N]` where it can be any number between 3 to 32 inclusive. For example, `GEN_UNIQUE_22`.
- `GEN-PASSWORD` - Replaces this with a generated azure-compatible password, useful for virtual machine names.
- `GEN-SSH-PUB-KEY` - Replaces this with a generated SSH public key

You can pre-create few azure components which can be used by templates for automated validation. This includes a key vault with sample SSL certificate stored, specialized and generalized Windows Server VHD's, a custom domain and SSL cert data for Azure App Service templates.

**Key Vault Related placeholders:**
+ **GEN-KEYVAULT-NAME** - use this placeholder to leverage an existing test keyvault in your templates
+ **GEN-KEYVAULT-FQDN-URI** - use this placeholder to get FQDN URI of existing test keyvault.
+ **GEN-KEYVAULT-RESOURCE-ID** - use this placeholder to get Resource ID of existing test keyvault.
+ **GEN-KEYVAULT-SSL-SECRET-NAME** - use this placeholder to use the sample SSL cert stored in the test keyvault
+ **GEN-KEYVAULT-SSL-SECRET-URI** - use this placeholder to use the sample SSL cert stored in the test keyvault

** Existing VHD related placeholders:**
+ **GEN-SPECIALIZED-WINVHD-URI** - URI of a specialized Windows VHD stored in an existing storage account.
+ **GEN-GENERALIZED-WINVHD-URI** - URI of a generalized Windows VHD stored in an existing storage account.
+ **GEN-DATAVHD-URI** - URI of a sample data disk VHD stored in an existing storage account.
+ **GEN-VHDSTORAGEACCOUNT-NAME** - Name of storage account in which the VHD's are stored.
+ **GEN-VHDRESOURCEGROUP-NAME** - Name of resource group in which the existing storage account having VHD's resides.

** Custom Domain & SSL Cert related placeholders:**
+ **GEN-CUSTOMFQDN-WEBAPP-NAME** - Placeholder for the name of azure app service where you'd want to attach custom domain.
+ **GEN-CUSTOM-FQDN-NAME** - Sample Custom domain which can be added to App Service created above.
+ **GEN-CUSTOM-DOMAIN-SSLCERT-THUMBPRINT** - SSL cert thumbpring for the custom domain used in above placeholder
+ **GEN-CUSTOM-DOMAIN-SSLCERT-PASSWORD** - Password of the SSL certificate used in above placeholder.

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
  "GITHUB_REPO": "Azure/azure-quickstart-templates"
}
```

You can set any of these values as environment variables, or placing it in a file called `.config.json` at the root of this repo making it easy to deploy.

## Mongodb

The server uses MongoDB to record created resource groups to persistenence. On restart, it will attempt to delete any resource group listed in the database. This helps ensure the unlikely possibility of a resource group hanging around after a template deployment. Be sure to set `MONGO_URL` to an accessible MongoDB instance.

## Service Prinicpal

You'll also need to [setup a service principal](https://github.com/cloudfoundry-incubator/bosh-azure-cpi-release/blob/master/docs/create-service-principal.md) for the server to access your azure subscription.

# Contributing

See the [contributing guide](./CONTRIBUTING.md) file for details on how to contribute.
