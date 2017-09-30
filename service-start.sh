#
# this script is used to set the app up as a service to run in the bg
sudo forever-service install armvalidator –-script ./bin/www 

#After service installation, you can start service by running following command.
sudo service armvalidator start

#Check status if app is running or stopped
sudo service armvalidator status

#You can use other following commands for start/stop/ operations.
#sudo service armvalidator stop #to stop app
#sudo service armvalidator start #
