Why Docker?
=========
We are having issues with compatibility between machines, so we made a Docker container. Docker helps us make sure everyone is developing for the same workstation - an Ubuntu Linux machine set up with the libraries we need, located in the places we want them. Let me know if there are any issues.


Docker Quick Start
-----------
* [Install Docker](https://docs.docker.com/engine/installation/)
* Restart your computer. Docker's weird like that.
* Create account for [DockerHub](https://hub.docker.com/)
* Send username to me (@blengerich). I will add you as a collaborator on the Docker image. Once you have been added:
* Start docker daemon (open Docker Quickstart Terminal for Mac). After you're done admiring the ASCII art, do the following (you may need root privileges) :

*       > docker login
        > docker pull blengerich/genamap
        ... (This will take a while)

* To make sure it worked, try

*       > docker run -ti blengerich/genamap
 This should output something about the test passing. 


Running our Node App/Editing files from a Docker container
---------
Because Docker containers mask the ports from the host machine, it can be a little tricky to get a Node app to respond from within our container. We're going to [mount the source directory into the container as a volume](https://docs.docker.com/engine/userguide/containers/dockervolumes/). This means that when we change the files in this directory, they change in the Docker container immediately. Finally, nodemon restarts our app whenever it detects a change in the source code.

*       > cd ..
        > docker run -ti -p 49160:3000 -v ${PWD}:/usr/src/genamap blengerich/genamap
        > cd /usr/src/genamap/src/Scheduler/node
        > node-gyp rebuild
        > cd /usr/src/genamap/frontend/genamapApp
        > nodemon -L webapp.js
        
* Then we can see our app running at localhost:49160


If you want to add a dependency
-----------

*       > docker run -ti blengerich/genamap
        > root@[abc123deff]: install $dependency
        > exit
        > docker commit -m 'added $dependency' -a '$my name' $abc123deff blengerich/genamap:$dependency
        > docker push blengerich/genamap:$dependency'
