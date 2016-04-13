{
	"targets": [
	{
		"target_name": "scheduler",
		"sources": ["../Scheduler.cpp", "Scheduler_node.cpp",
			"../../algorithm/Algorithm.cpp", "../../algorithm/IterativeUpdate.cpp", "../../algorithm/ProximalGradientDescent.cpp",
			"../../json/JsonCoder.cpp", "../../json/jsoncpp.cpp",
			"../../Math/Math.cpp",
			"../../model/AdaMultiLasso.cpp", "../../model/GFlasso.cpp",
			"../../model/LinearMixedModel.cpp", "../../model/LinearRegression.cpp",
			"../../model/Model.cpp", "../../model/MultiPopLasso.cpp", "../../model/TreeLasso.cpp",],
		'cflags': [
			'-Wall',
			'-std=c++11',
			'-fexceptions'],
		'cflags!' : ['-fno-exceptions'],
		'cflags_cc!': ['-fno-rtti', '-fno-exceptions'],
	}
	]
}
