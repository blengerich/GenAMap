package(default_visibility = ["//visibility:public"])

cc_library(
	name = "Algorithm",
	srcs = ["Algorithm.cpp"],
	hdrs = ["Algorithm.hpp"],
	deps = ["//model:Model"],
	copts = ["-DBAZEL"]
)

cc_library(
	name = "AlgorithmOptions",
	hdrs = ["AlgorithmOptions.hpp"], 
	deps = [],
	copts = ["-DBAZEL"]
)

cc_library(
	name = "BrentSearch",
	srcs = ["BrentSearch.cpp"],
	hdrs = ["BrentSearch.hpp"],
	deps = ["//algorithm:Algorithm",
			"//algorithm:AlgorithmOptions",
			"//algorithm:GridSearch",
			"//model:LinearMixedModel"],
	copts = ["-DBAZEL"]
)

cc_library(
	name = "GridSearch",
	srcs = ["GridSearch.cpp"],
	hdrs = ["GridSearch.hpp"],
	deps = ["//algorithm:Algorithm",
			"//model:LinearMixedModel"],
	copts = ["-DBAZEL"])

cc_library(
	name = "ProximalGradientDescent",
	srcs = ["ProximalGradientDescent.cpp"],
	hdrs = ["ProximalGradientDescent.hpp"],
	deps = ["//algorithm:Algorithm",
		"//algorithm:AlgorithmOptions",
		"//algorithm:BrentSearch",
		"//model:AdaMultiLasso",
		"//model:GFlasso",
		"//model:LinearMixedModel",
		"//model:LinearRegression",
		"//model:TreeLasso",
		"//model:MultiPopLasso",
		"//model:SparseLMM",
		"//Math:Math"],
	copts = ["-DBAZEL"]
)

cc_library(
	name = "IterativeUpdate",
	srcs = ["IterativeUpdate.cpp"],
	hdrs = ["IterativeUpdate.hpp"],
	deps = ["//algorithm:Algorithm",
		"//algorithm:AlgorithmOptions",
		"//model:LinearRegression",
		"//model:TreeLasso",
		"//model:MultiPopLasso",
		"//Math:Math"],
	copts = ["-DBAZEL"]
)
