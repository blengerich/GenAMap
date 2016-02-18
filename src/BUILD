package(default_visibility = ["//visibility:public"])

cc_binary(
	name = "main",
	srcs = ["main.cpp"],
	deps = ["//model:LinearRegression",
		"//algorithm:ProximalGradientDescent",
		"//:FileIO",
		"//json:JsonCoder",],
)

cc_library(
	name = "FileIO",
	srcs = ["FileIO.cpp"],
	hdrs = ["FileIO.hpp"],
	deps = ["//model:TreeLasso",],
)

cc_library(
	name = "DataBaseCommunicator",
	srcs = ["DataBaseCommunicator.cpp"],
	hdrs = ["DataBaseCommunicator.hpp"],
)

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
