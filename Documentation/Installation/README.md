# User's guidance

* [Install Docker](https://docs.docker.com/engine/installation/)
* Make sure that your docker containers have __memory more than 8GB__ (default is 2GB), you can check the setting in "Docker icon -> Preference -> Advanced" in macOS


* Run ***run_genamap.sh*** 
   * For the first time, it needs to download the database and program, which will take a while and need Internet connection
   * The server is runing in the backend
   * Enjoy the next-generation GWAS by visiting __localhost:49160__ on Linux. On Mac, this is __192.168.99.100:49160__, or __0.0.0.0:49160__ if your docker version > 1.2.x
