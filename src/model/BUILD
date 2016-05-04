package(default_visibility = ["//visibility:public"])

cc_library(
	name = "AdaMultiLasso",
	srcs = ["AdaMultiLasso.cpp"],
	hdrs = ["AdaMultiLasso.hpp"],
	copts = ["-DBAZEL"],
	deps = ["//Math:Math",
			"//model:Model",]
)



cc_library(
	name = "GFlasso",
	srcs = ["GFlasso.cpp"],
	hdrs = ["GFlasso.h"],
	deps = ["//model:Model"])


cc_library(
	name = "lasso",
	hdrs = ["lasso.hpp"],
	copts = ["-DBAZEL"]
)


cc_library(
	name = "LinearMixedModel",
	srcs = ["LinearMixedModel.cpp"],
	hdrs = ["LinearMixedModel.hpp"],
	copts = ["-DBAZEL"],
	deps = ["//Math:Math",
			"//model:Model"]
)

cc_library(
	name = "LinearRegression",
	srcs = ["LinearRegression.cpp"],
	hdrs = ["LinearRegression.hpp"],
	copts = ["-DBAZEL"],
	deps = ["//model:Model",
			"//model:ModelOptions"],
)

cc_library(
	name = "Model",
	srcs = ["Model.cpp"],
	hdrs = ["Model.hpp"],
	copts = ["-DBAZEL"],
	deps = [],
)

cc_library(
	name = "ModelOptions",
	hdrs = ["ModelOptions.hpp"],
	copts = ["-DBAZEL"],
	deps = []
)

cc_library(
	name = "MultiPopLasso",
	srcs = ["MultiPopLasso.cpp"],
	hdrs = ["MultiPopLasso.hpp"],
	copts = ["-DBAZEL"],
	deps = ["//model:Model",
		"//Math:Math"]
)

cc_test(
	name = "Model_Tests",
	srcs = ["Model_Tests.cpp"],
	copts = ["-Iexternal/gtest/include",
			"-DBAZEL"],
	deps = ["@gtest//:main",
			"Model",
			"LinearRegression",
			"TreeLasso",
			"MultiPopLasso", 
			"AdaMultiLasso"],
	size = "small"
)

cc_library(
	name = "TreeLasso",
	srcs = ["TreeLasso.cpp"],
	hdrs = ["TreeLasso.hpp"],
	copts = ["-DBAZEL"],
	deps = ["//model:Model"],
)

