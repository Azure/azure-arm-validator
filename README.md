# azure-arm-validator

A tiny server which will validate Azure Resource Manager scripts.

This will soon be used in CI automation validation for [Azure Quick-Start Templates](https://github.com/azure/azure-quickstart-templates) community contributions.

## Running the Server

In case you'd like to run this server, set the following environment variables:

```
AZURE_CLIENT_ID=AZURE_CLIENT_ID
AZURE_TENANT_ID=AZURE_TENANT_ID
AZURE_CLIENT_SECRET=AZURE_CLIENT_SECRET
AZURE_REGION=AZURE_REGION_NAME
TEST_RESOURCE_GROUP_NAME=azure_qst_ci
RESOURCE_GROUP_NAME_PREFIX=citest-
MONGO_URL=MongoDB_SERVER_CONNECTION_STRING
SSH_KEY_REPLACE_INDICATOR=SSH_PUB_KEY
SSH_PUBLIC_KEY=SSH_PUBLIC_KEY
PASSWORD_REPLACE_INDICATOR=GEN_PASSWORD
```

You'll need have a [mongodb](http://mongodb.org) server up and running for things to work properly. You can also set these variables in a JSON file called './config.json'.

Once you've got everything set, just execute:

```
npm start
```

You'll get two endpoints, which accept the same body schema:

`POST /validate` - Validates the Azure Resource Manager Template. Returns 200 OK for success or 400 Bad Request.

```
{
  "template": [the azure template json],
  "paramters": [the azure template parameters file]
}
```

`POST /deploy` - Momentarily Deploys the Azure Resource Manager Template, then deletes, returning 202 Accepted. The body for a successful deployment is:

```
{
  "template": [the azure template json],
  "paramters": [the azure template parameters file]
}
```

```
{ "result": "Deployment Successful" }

```