package(default_visibility = ["//visibility:public"])

cc_library(
	name = "AdaMultiLasso",
	srcs = ["AdaMultiLasso.cpp"],
	hdrs = ["AdaMultiLasso.hpp"],
	copts = ["-DBAZEL"],
	deps = ["//Math:Math",
			"//Models:Model",]
)

cc_library(
	name = "GFlasso",
	srcs = ["GFlasso.cpp"],
	hdrs = ["GFlasso.h"],
	deps = ["//Models:Model"])


cc_library(
	name = "ICLasso",
	srcs = ["ICLasso.cpp"],
	hdrs = ["ICLasso.hpp"],
	copts = ["-DBAZEL"],
	deps = ["Model",
	        "ModelOptions"],
)


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
			"Model"]
)

cc_library(
	name = "LinearRegression",
	srcs = ["LinearRegression.cpp"],
	hdrs = ["LinearRegression.hpp"],
	copts = ["-DBAZEL"],
	deps = ["Model",
			"ModelOptions"],
)

cc_library(
	name = "Model",
	srcs = ["Model.cpp"],
	hdrs = ["Model.hpp"],
	copts = ["-DBAZEL"],
	deps = ["//JSON:JsonCoder",
                "//IO:DataBaseCommunicator"],
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
	deps = ["Model",
		"//Math:Math"]
)

cc_test(
	name = "Model_Tests",
	srcs = ["Model_Tests.cpp"],
    copts = ["-Iexternal/gtest/include",
            "-Itools/.node-gyp/5.9.1/include",
            "-DBAZEL"],
    linkopts = ["-lm",
    			"-luv",
                "-lv8",
                "-lpthread",
                "-lrt",
                "-ldl",
                "-lz"],
    deps = ["@gtest//:main",
    		"AdaMultiLasso",
    		"GFlasso",
    		"lasso",
    		"LinearMixedModel",
    		"LinearRegression",
    		"Model",
    		"ModelOptions",
    		"MultiPopLasso",
    		"TreeLasso",
    		"//Math:Math",
		"//JSON:JsonCoder",
 		"//IO:DataBaseCommunicator"],
	size = "small"
)

cc_library(
    name = "SparseLMM",
    srcs = ["SparseLMM.cpp"],
    hdrs = ["SparseLMM.h"],
    copts = ["-DBAZEL"],
    deps = ["LinearMixedModel",
            "Model"],
)

cc_library(
	name = "TreeLasso",
	srcs = ["TreeLasso.cpp"],
	hdrs = ["TreeLasso.hpp"],
	copts = ["-DBAZEL"],
	deps = ["Model", "//Math:Math"],
)
