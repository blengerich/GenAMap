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
