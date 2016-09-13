package(default_visibility = ["//visibility:public"])

cc_library(
	name = "Algorithm",
	srcs = ["Algorithm.cpp"],
	hdrs = ["Algorithm.hpp"],
	deps = ["//Models:Model"],
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
	deps = ["//Algorithms:Algorithm",
			"//Algorithms:AlgorithmOptions",
			"//Algorithms:GridSearch",
			"//Models:LinearMixedModel"],
	copts = ["-DBAZEL"]
)

cc_library(
	name = "GridSearch",
	srcs = ["GridSearch.cpp"],
	hdrs = ["GridSearch.hpp"],
	deps = ["//Algorithms:Algorithm",
			"//Models:LinearMixedModel"],
	copts = ["-DBAZEL"])

cc_library(
	name = "HypoTestPlaceholder",
	srcs = ["HypoTestPlaceHolder.cpp"],
	hdrs = ["HypoTestPlaceHolder.h"],
	deps = ["//Algorithms:Algorithm",
			"//Stats:Stats"],
	copts = ["-DBAZEL"])

cc_library(
	name = "ProximalGradientDescent",
	srcs = ["ProximalGradientDescent.cpp"],
	hdrs = ["ProximalGradientDescent.hpp"],
	deps = ["//Algorithms:Algorithm",
		"//Algorithms:AlgorithmOptions",
		"//Algorithms:BrentSearch",
		"//Models:AdaMultiLasso",
		"//Models:GFlasso",
		"//Models:LinearMixedModel",
		"//Models:LinearRegression",
		"//Models:TreeLasso",
		"//Models:MultiPopLasso",
		"//Models:SparseLMM",
		"//Math:Math"],
	copts = ["-DBAZEL"]
)

cc_library(
	name = "IterativeUpdate",
	srcs = ["IterativeUpdate.cpp"],
	hdrs = ["IterativeUpdate.hpp"],
	deps = ["//Algorithms:Algorithm",
		"//Algorithms:AlgorithmOptions",
		"//Models:LinearRegression",
		"//Models:TreeLasso",
		"//Models:MultiPopLasso",
		"//Math:Math"],
	copts = ["-DBAZEL"]
)
