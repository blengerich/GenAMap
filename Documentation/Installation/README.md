# Installation of GenAMap

* [Install Docker](https://docs.docker.com/engine/installation/)
* Run install_genamap.sh

    * It starts the mongoDB and postgreDB, and pull GenAMap server to local
    * Before Run the server, __make sure the database has been employed__
    * Internet access needed
    * Takes a while to install (if nessesary)

# Use GenAMap

* Make sure that your docker containers have __memory more than 8GB__ (default is 2GB), you can check the setting in "Docker icon -> Preference -> Advanced" in macOS
* Run run_genamap.sh 
   * It takes a few minutes to get ready
   * Enjoy the next-generation GWAS by visiting __localhost:49160__ on Linux. On Mac, this is __192.168.99.100:49160__, or __0.0.0.0:49160__ if your docker version > 1.2.x

