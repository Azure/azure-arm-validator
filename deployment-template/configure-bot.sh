# this scripts expects the following args
userName="$1" #user name which will be used as the directory to clone the repo - usually the admin
artifactsLocation="$2"
artifactsLocationSasToken="$3"

appPath='var/www/azure-arm-validator'

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
#git clone https://github.com/Azure/azure-arm-validator "/home/$userName/azure-arm-validator" #should probably pass this in, instead of hardcoding it
git clone https://github.com/Azure/azure-arm-validator $appPath #should probably pass this in, instead of hardcoding it

# copy the service file
cp "$appPath/azure-arm-validator.service" 'etc/systemd/system'

#Create a database where ARM validator will store its information.
#We need to have at least one document inserted in the db. Use following command to insert document
mongo 'arm-validator' --eval 'db["arm-validator"].armvalidator.insert({"name":"arm-validator-db"})'

#enable monog service
sudo systemctl enable mongod.service

#try to download the config file if it was staged.
curl -f -o "$appPath/.config.json" "$artifactsLocation/.config.json$artifactsLocationSasToken"
rc=$?
if test "$rc" != "0"; then
    echo "curl failed with: $rc"
else #start the app if the config file was staged
    echo "start the service if the config file was installed"
    sudo systemctl daemon-reload
    sudo systemctl start azure-arm-validator
    
    #cd "$appPath"
    #npm install
    #sudo forever-service install armvalidator –-script ./bin/www
    #sudo service armvalidator start
fi

#change ownership on the app, just to make life easier
sudo chown -hR $userName "$appPath"



