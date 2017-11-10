{
	"targets": [
	{
		"target_name": "scheduler",
		"sources": ["../Scheduler.cpp", "Scheduler_node.cpp", "../../IO/PlinkReader.cpp",
			"../../Algorithms/Algorithm.cpp", "../../Algorithms/BrentSearch.cpp",
			"../../Algorithms/GridSearch.cpp", "../../Algorithms/IterativeUpdate.cpp",
			"../../Algorithms/ProximalGradientDescent.cpp",
			"../../Algorithms/HypoTestPlaceHolder.cpp",
			"../../JSON/JsonCoder.cpp", "../../JSON/jsoncpp.cpp",
			"../../IO/FileIO.cpp",
			"../../IO/MongoInterface.cpp",
			"../../Math/Math.cpp",
			"../../Models/AdaMultiLasso.cpp", "../../Models/GFlasso.cpp",
			"../../Models/LinearMixedModel.cpp", "../../Models/LinearRegression.cpp",
			"../../Models/Model.cpp", "../../Models/MultiPopLasso.cpp",
			"../../Models/SparseLMM.cpp", "../../Models/TreeLasso.cpp",
			"../../Stats/Stats.cpp", "../../Stats/Chi2Test.cpp", "../../Stats/FisherTest.cpp", "../../Stats/WaldTest.cpp",
			"../../Models/LinearMixedModel.cpp",
 			"../../Graph/NeighborSelection.cpp",
			"../../Graph/GraphicalLasso.cpp"],
		'cflags': [
			'-Wall',
			'-std=c++11',
			'-fexceptions',
			'-fext-numeric-literals'],
		'cflags!' : ['-fno-exceptions'],
		'cflags_cc!': ['-fno-rtti', '-fno-exceptions'],
		"include_dirs": ["../../Algorithms", "../../Models", "../../Graph",
		    "/usr/local/include/mongocxx/v_noabi",
            "/usr/local/include/libmongoc-1.0",
            "/usr/local/include/bsoncxx/v_noabi",
            "/usr/local/include/libbson-1.0",],
		"libraries": ["-lmongocxx","-lbsoncxx", "-lplinkio"],
	}
	]
}
