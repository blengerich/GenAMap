# How to Build/Run GenAMap

### Enter Docker.
To install Docker, see [here](./Docker/Quick_Start.md)

	cd scripts	
	./launch_docker.sh

### Build the backend as a Node addon

	cd /usr/src/genamap/Scheduler/node
	node-gyp rebuild
	
Build the frontend. Gulp watches all the source files and compiles them into `bundle.js` every time we change a JS file. So it won’t ever finish (that’s why we run it as a background process).

	cd ../../frontend
	npm install --no-bin-links	# This may need sudo privileges on Windows
	gulp watch &
	
### Run GenAMap

	nodemon -L webapp.js
	# listening on port 3000
	
Now navigate in a web browser to the port. On Linux, this is localhost:7000. On Mac, this is 192.168.99.100:7000, or 0.0.0.0:7000 if your docker version > 1.2.x.

### Login
Follow the prompts on the GUI to login and/or create an ID.

### Import Data
* From the menu on the left, select "Import Local Data".
* Create a new project, select "human" for species.
	* For data type, select "CSV".
	* Marker file: Documentation/ExampleData/Alzheimers/LR/marker_values.csv
	* Marker Labels: Documentation/ExampleData/Alzheimers/LR/marker_labels.csv
	* Trait file: Documentation/ExampleData/Alzheimers/LR/trait_values.csv
	* Trait Labels: Documentation/ExampleData/Alzheimers/LR/trait_labels.csv
	* As we are running linear regression, we don't need to add population or SNPs features. If you want to run other analysis types, the files are included in the relevant folder under the Alzheimers directory.

### Run Analysis

Select "Run Analysis".

* Our method type is "Structured Association Mapping"
* Our model type is "Linear Regression"
* Choose the project name you entered earlier.
* All other fields should auto-complete.

Click "Run Analysis". We can track the progress of this job by looking at the "Activity" tab. When this job is finished, a new folder called "Results"  will be created under our project.

### Matrix View
Click on the file named "Matrix View" and the visualization should appear in the main window.

### Manhattan Plot
TODO: Jingkang, what is the status of Manhattan plot?


## Dependencies:
For informational purposes only, you don't need to install anything. We are now using [Docker](http://docker.com) to sync our environments. See [docs](https://github.com/blengerich/GenAMap_V2/blob/master/Documentation/Development/Docker/Quick_Start.md) for more information.

* [Java (JDK) 1.8 or greater](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
* [Eigen C++](http://eigen.tuxfamily.org/index.php?title=Main_Page)
* [MySQL C++ connector](http://dev.mysql.com/downloads/connector/cpp/)
* [JsonCPP](https://github.com/open-source-parsers/jsoncpp)
* [Boost](http://www.boost.org/)
* [Bazel](https://github.com/bazelbuild/bazel)
* [Google Testing Framework](https://github.com/google/googletest)
