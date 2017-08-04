# Setting Up the GenAMap Server

### Install Docker
[Docker](https://docs.docker.com/engine/installation/)
### Get the run script
```bash
curl https://raw.githubusercontent.com/blengerich/GenAMap/master/Documentation/Installation/run_genamap.sh > run_genamap.sh
```
### Give executable permissions to the run script
```bash
chmod +x run_genamap.sh
```
### Run the run script
* When running the script for the first time, it may need to pull the images, which will take a while and require internet connection. 
```bash
./run_genamap.sh
```
* Run  ```docker ps```, the output should indicate that three containers are running
    * genamap_production_server
    * genamap_mongo
    * genamap_postgres
* If this isn't true, run ```./run_genamap.sh``` again.

    
### Enjoy next generation GWAS
* Once the script has setup the server, visit __localhost:49160__
    * The site will be ready a few minutes after run_genamap.sh completes. The server has to load SNP data which will take a couple of minutes.
* There is already a demo user setup with the following credentials
    * *email*: demo@demo.com
    * *passw*: demo
    
    
# Stopping the GenAMap Server
### Get the stop script
```bash
curl https://raw.githubusercontent.com/blengerich/GenAMap/master/Documentation/Installation/stop_genamap.sh > stop_genamap.sh
```

### Give executable permissions to the stop script
```bash
chmod +x stop_genamap.sh
```

### Run the stop script
```bash
./stop_genamap.sh
```