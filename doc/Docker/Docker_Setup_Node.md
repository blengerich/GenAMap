* [Install Docker](https://docs.docker.com/engine/installation/mac/)
* Create account for [DockerHub](https://hub.docker.com/)
* Send username to me (@blengerich)
Once you have been added to the project:
* Open Docker Quickstart Terminal for Mac
* Pull the docker image:
   $ docker login
   $ docker pull blengerich/genamap
* To check that it worked:
   $ docker run -ti blengerich/genamap
To get the genamap CLI:
* Create an executable genamap file in /usr/local/bin with the contents from doc/Docker/genamap.sh
  $ nano /usr/local/bin/genamap
  [copy and paste code; control-o + enter to write out (save); control-x to exit]
  $ chmod +x genamap
To run the node app (with CLI):
* Open a terminal window
* Go to the GenAMap_V2 folder and run genamap commands (to view help for the genamap command run genamap -h)
  $ cd GenAMap_V2
  $ genamap docker            (starts the Docker daemon)
  $ genamap node              (runs the Node app in the image)
* If the webpage is showing an error, wait a few seconds and refresh the page. The node command takes a few seconds to run the site so it is not available instantly.
If you also need to gulp (update the source files) (with CLI):
* Open another terminal window
* Go to the GenAMap_V2 folder and run the genamap gulp command
  $ cd GenAMap_V2
  $ genamap docker            (starts the Docker daemon)
  $ genamap gulp              (runs gulp in the image)

To run the node app (without CLI):
* Open Docker Quickstart Terminal
* From the root directory (Genamap_V2), run:
   $ docker run -ti -p 49160:3000 -v ${PWD}:/usr/src/genamap blengerich/genamap
* This will create a local image of the docker container. Now we will need to run the node app:
  $ cd /usr/src/genamap/src/frontend/genamapApp
  $ nodemon -L webapp.js
* To view the website, from a different terminal window, run:
  $ docker-machine ip default
* Since we are running on a Mac, Docker binds localhost to the VM that the image is running on. This means that we need the VM's ip to see the actual site. Now, with the ip address, go to <ip>:49160, where <ip> is probably something like '192.168.99.100/' in your browser
If you are changing files in genamapApp/src (i.e., editing the node source code), you will need to open another instance of the same docker container.
* From the same terminal window as the docker-machine command, run:
  $ docker ps -a
* This will show you a list of your active containers. The first one should be the currently running one. Note the name of this container (last column). In a third terminal window, run:
  $ docker exec -ti <container_name> /bin/bash
* This will open another interactive terminal for that container. Now go to the main node directory:
  $ cd /usr/src/genamap/src/frontend/genamapApp
* Now we will 'gulp' the files (i.e., update them), by running:
  $ gulp watch