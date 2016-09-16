# How to Build/Run GenAMap

Enter Docker. To install Docker, see [here](./Docker/Quick_Start.md)

	cd scripts	
	./launch_docker.sh

Build the backend as a Node addon

	cd /usr/src/genamap/src/Scheduler/node
	node-gyp rebuild
	
Build the frontend. Gulp watches all the source files and compiles them into `bundle.js` every time we change a JS file. So it won’t ever finish (that’s why we run it as a background process).

	cd ../../frontend
	npm install --no-bin-links
	gulp watch &
	
Run GenAMap

	nodemon -L webapp.js
	# listening on port 3000
	
Now navigate in a web browser to the port. On Linux, this is localhost:7000. On Mac, this is 192.168.99.100:7000. 
