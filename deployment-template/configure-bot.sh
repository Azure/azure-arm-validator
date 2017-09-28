
#install azure cli
echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ wheezy main" | sudo tee /etc/apt/sources.list.d/azure-cli.list
sudo apt-key adv --keyserver packages.microsoft.com --recv-keys 417A0893
sudo apt-get install apt-transport-https
sudo apt-get update && sudo apt-get install azure-cli

#install git
sudo apt-get update
sudo apt-get install git

#install npm
sudo apt-get install npm --assume-yes
sudo apt-get install nodejs-legacy
sudo npm install forever -g
sudo npm install -g forever-service -g


#Import the public key used by the package management system.
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927

#Create a list file for MongoDB
echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

#Reload local package database.
sudo apt-get update
#Install the MongoDB packages.
sudo apt-get install -y mongodb-org

#Start MongoDB
sudo service mongod start

#Configure MongoDB to run on system startup automatically by running this command
sudo systemctl enable mongod.service

#install bits for the app
git clone https://github.com/Azure/azure-arm-validator

### don't think these will work from bash - need some other option
#Enter MongoDB shell by running command mongo. 
#mongo

#Create a database where ARM validator will store its information.
#use arm-validator

#We need to have at least one document inserted in the db. Use following command to insert document
#db.armvalidator.insert({"name":"arm-validator-db"})

#Database is now Ready. Update following value in your .config.json file
#  "MONGO_URL": "mongodb://localhost:27017/arm-validator",

#start the app
#Npm install - this requires .config.json to be copied
#If Application is successfully installed, move forward or look at the errors, install required dependencies and try again.
#Now Application is ready to use. We can test it first by running manually before configuring to run in production. 
#You might want to look at logs during first run to diagnose issues if any. To enable debug logs, display on console, run following command
#export DEBUG=*
#Run app manually by running following command
#npm start

#Application should start running now, if you enabled Debug before executing you should be able to see message like “listening on port 3000, logged in to subscription” etc.
#If Application failed, look at the error and troubleshoot further. Common reason of failure is syntax error in .config.json file, fix the file and try running again
#Application would stop running as soon as you press CTRL+C or exit terminal. We will use forever to configure this as service, which can run in background.
#Sudo forever-service install armvalidator –-script ./bin/www 
