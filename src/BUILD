package(default_visibility = ["//visibility:public"])

cc_binary(
	name = "main",
	srcs = [], #["main.cpp"],
	deps = ["//Models:LinearRegression",
	        "//Models:Model",
	        "//Models:MultiPopLasso",
	        "//Models:TreeLasso",
                "//Algorithms:ProximalGradientDescent",
                "//Algorithms:Algorithm",
                "//Algorithms:IterativeUpdate",
                "//Graph:NeighborSelection",
                "//Graph:GraphicalLasso",
                #"//:FileIO",
                "//Math:Math",
                "//JSON:JsonCoder",
                #"//:DataBaseCommunication",
	],
)

#cc_library(
#	name = "FileIO",
#	srcs = ["FileIO.cpp"],
#	hdrs = ["FileIO.hpp"],
#	deps = ["//Models:TreeLasso",],
#)

#cc_library(
#	name = "DataBaseCommunicator",
#	srcs = ["DataBaseCommunicator.cpp"],
#	hdrs = ["DataBaseCommunicator.hpp"],
#)

cc_test(
	name = "my_test",
	srcs = ["my_test.cc"],
	copts = ["-Iexternal/gtest/include"],
	deps = ["@gtest//:main"],
	size = "small"
)

cc_test(
	name = "tests",
	srcs = ["tests.cpp", "my_test.cc"],
	copts = ["-Iexternal/gtest/include"],
	deps = ["@gtest//:main",
	"//Scheduler:Scheduler_Tests"],
	size = "small",
)

#cc_library(
#	name = "Math",
#	srcs = ["Math.cpp"],
#	hdrs = ["Math.hpp"],
#	deps = ["@gtest//:main"]
#)

#cc_test(
#    name = "Math_Tests",
#    srcs = ["Math_Tests.cpp"],
#    copts = ["-Iexternal/gtest/include"],
#    deps = ["@gtest//:main",
#    "Math"],
#    size = "small"
#)
