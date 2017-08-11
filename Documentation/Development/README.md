# How to Build/Run GenAMap

### Enter Docker.
Install [Docker](./Docker/Quick_Start.md)
```bash
cd scripts
./dev_genamap.sh
```
### Build the backend as a Node addon
```bash
cd /usr/src/genamap/Scheduler/node
node-gyp rebuild
```

### Install the Node dependencies
```bash
cd /usr/src/genamap/frontend
npm install
```

### Start the development server
```bash
cd /usr/src/genamap/frontend
npm run dev
```

### Open the application
Now navigate in a web browser to the port at localhost:3001.

### Login
Follow the prompts on the GUI to login and/or create an ID.
* There is already a demo user setup with the following credentials
    * *email*: demo@demo.com
    * *password*: demo

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

### Visualization
* In the project files navigator, click on *[Project Name]->Results->[Job Name]* to open the results visualization.

## Dependencies:
For informational purposes only, you don't need to install anything. We are now using [Docker](http://docker.com) to sync our environments. See [docs](https://github.com/blengerich/GenAMap_V2/blob/master/Documentation/Development/Docker/Quick_Start.md) for more information.

## Updating the GenAMap image:
```bash
./dev_genamap.sh -u
```

## Stopping the docker containers:
```bash
./stop-dev_genamap.sh
```

* [Java (JDK) 1.8 or greater](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
* [Eigen C++](http://eigen.tuxfamily.org/index.php?title=Main_Page)
* [MySQL C++ connector](http://dev.mysql.com/downloads/connector/cpp/)
* [JsonCPP](https://github.com/open-source-parsers/jsoncpp)
* [Boost](http://www.boost.org/)
* [Bazel](https://github.com/bazelbuild/bazel)
* [Google Testing Framework](https://github.com/google/googletest)
