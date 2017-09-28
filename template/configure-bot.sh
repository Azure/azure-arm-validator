
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


### don't think these will work from bash - need some other option
#Enter MongoDB shell by running command mongo. 
#mongo

#Create a database where ARM validator will store its information.
#use arm-validator

#We need to have at least one document inserted in the db. Use following command to insert document
#db.armvalidator.insert({"name":"arm-validator-db"})

#Database is now Ready. Update following value in your .config.json file
#  "MONGO_URL": "mongodb://localhost:27017/arm-validator",
