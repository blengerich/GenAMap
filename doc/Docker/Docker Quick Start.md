Why Docker?
=========
We are having issues with compatibility between machines, so we made a Docker container. Docker helps us make sure everyone is developing for the same workstation - an Ubuntu Linux machine set up with the libraries we need, located in the places we want them. There is a clone of our git repo inside the Docker container, so you can either develop inside the container (although graphical interaction is tricky) or push/pull from git. Let me know if there are any issues.


Docker Quick Start
-----------
* [Install Docker](https://docs.docker.com/engine/installation/)
* Restart your computer. Docker's weird like that.
* Create account for [DockerHub](https://hub.docker.com/)
* Send username to me (@blengerich). I will add you as a collaborator on the Docker image. Once you have been added:
* Start docker daemon (open Docker Quickstart Terminal for Mac). After you're done admiring the ASCII art, do the following:
*		> docker login
		> docker pull blengerich/genamap
		... (This will take a while)
* To make sure it worked, try
*		> docker run -ti blengerich/genamap
		> cd GenAMap_V2/src/
		> bazel test //Scheduler:Scehduler_Tests
		This should output something about the test passing. 


Running our Node App from a Docker container
---------
Because Docker containers mask the ports from the host machine, it can be a little tricky to get a Node app to respond from within our container. Here's how we do that. From this directory (we are using the Dockerfile included in this directory), type

* 		> docker build -t blengerich/genamap_node .
 		> docker images
 		> docker run -p 49160:3000 -d blengerich/genamap_node
 		> docker ps
This should ouptut your container_id
*		> docker logs $container_id
Should say it's listening on port 3000
*		> docker-machine ip default
This will give us $ip, the IP address of our container. We can now visit http://$ip:49160 in the browser.


If you want to add a dependency
-----------
*		> docker run -ti blengerich/genamap
		> root@[abc123deff]: install $dependency
 		> exit
		> docker commit -m 'added $dependency' -a '$my name' $abc123deff blengerich/genamap:$dependency
 		> docker push blengerich/genamap:$dependency'
