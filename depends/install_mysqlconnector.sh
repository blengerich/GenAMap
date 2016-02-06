if [-e mysql-connector.tar.gz ]
then
	exit
fi
wget http://dev.mysql.com/downloads/file/?id=460941 > mysql-connector.tar.gz
tar xvfz mysql-connector.tar.gz

