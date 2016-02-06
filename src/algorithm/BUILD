package(default_visibility = ["//visibility:public"])

cc_library(
	name = "Algorithm",
	srcs = ["Algorithm.cpp"],
	hdrs = ["Algorithm.hpp"],
	deps = ["//model:Model"],
)

cc_library(
	name = "ProximalGradientDescent",
	srcs = ["ProximalGradientDescent.cpp"],
	hdrs = ["ProximalGradientDescent.hpp"],
	deps = ["//algorithm:Algorithm",
		"//model:LinearRegression",
		"//model:TreeLasso"],
)
