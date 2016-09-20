# How to Run
This guide will show how to run an analysis (linear regression with the Lasso) on the included example data.

### Start GenAMap
Start Docker daemon. This will vary by OS. Then,
	
	cd GenAMap_V2/scripts
	./launch_docker.sh
	cd /usr/src/genamap/Scheduler/node
	node-gyp rebuild
	cd ../../frontend
	npm install	# only required once
	gulp watch &
	nodemon -L webapp.js

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