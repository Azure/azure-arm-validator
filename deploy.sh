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

chmod 600 ./dokku.key
ssh-add ./dokku.key

echo 'Private keys added. Starting Dokku Deployment'
git remote add $GIT_USERNAME $GIT_TARGET_URL

. ./dokku_git_push.exp

echo 'Deployed Latest Version of Arm Validator'
