{
	"targets": [
	{
		"target_name": "scheduler",
		"sources": ["../Scheduler.cpp", "Scheduler_node.cpp",
			"../../Algorithms/Algorithm.cpp", "../../Algorithms/BrentSearch.cpp",
			"../../Algorithms/GridSearch.cpp", "../../Algorithms/IterativeUpdate.cpp",
			"../../Algorithms/ProximalGradientDescent.cpp",
			"../../Algorithms/HypoTestPlaceHolder.cpp",
			"../../Algorithms/BoostBrent.cpp",
			"../../JSON/JsonCoder.cpp", "../../JSON/jsoncpp.cpp",
			"../../Math/Math.cpp",
			"../../Models/AdaMultiLasso.cpp", "../../Models/GFlasso.cpp",
			"../../Models/LinearMixedModel.cpp", "../../Models/LinearRegression.cpp",
			"../../Models/Model.cpp", "../../Models/MultiPopLasso.cpp",
			"../../Models/SparseLMM.cpp", "../../Models/TreeLasso.cpp",
			"../../Stats/Stats.cpp", "../../Stats/Chi2Test.cpp", "../../Stats/FisherTest.cpp", "../../Stats/WaldTest.cpp",
			"../../Models/LinearMixedModel.cpp",
			"../../Models/lmm.cpp",
 			"../../Graph/NeighborSelection.cpp"],
		'cflags': [
			'-Wall',
			'-std=c++11',
			'-fexceptions',
			'-fext-numeric-literals'],
		'cflags!' : ['-fno-exceptions'],
		'cflags_cc!': ['-fno-rtti', '-fno-exceptions'],
		"include_dirs": ["../../Algorithms", "../../Models", "../../Graph"],
		"libraries": [],
	}
	]
}
