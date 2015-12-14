#!/bin/bash

git init
git config user.name "Travis CI"
git config user.email "sedouard@microsoft.com"

echo 'Adding files to local repo '
ls -ltr
git add .
git commit -m "Deploy"

GIT_USERNAME="dokku"
GIT_TARGET_URL="${GIT_USERNAME}@${AZURE_WA_GIT_TARGET}:${DOKKU_APPNAME}"

eval "$(ssh-agent -s)"
ssh-agent -s

echo 'Adding decrypted SSH private keys for deployment'
echo "$DOKKU_PRIVATE_KEY" > ./dokku.key

chmod 600 ./dokku.key
chmod 600 ~/.ssh/authorized_keys
. ./scripts/deploy_passphrase.exp

echo 'Private keys added. Starting Dokku Deployment'
git remote add $GIT_USERNAME $GIT_TARGET_URL

git push dokku master -f

echo 'Deployed Latest Version of Arm Validator'
