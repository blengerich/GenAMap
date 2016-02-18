package(default_visibility = ["//visibility:public"])

cc_library(
	name = "Model",
	srcs = ["Model.cpp"],
	hdrs = ["Model.hpp"],
	deps = [],
)


cc_library(
	name = "LinearRegression",
	srcs = ["LinearRegression.cpp"],
	hdrs = ["LinearRegression.hpp"],
	copts = [],
	deps = ["//model:Model",],
)

cc_library(
	name = "TreeLasso",
	srcs = ["TreeLasso.cpp"],
	hdrs = ["TreeLasso.hpp"],
	deps = ["//model:Model"],
)

cc_library(
	name = "MultiPopLasso",
	srcs = ["MultiPopLasso.cpp"],
	hdrs = ["MultiPopLasso.hpp"],
	deps = ["//model:Model",
		"//:Math"]
)
