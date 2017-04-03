package(default_visibility = ["//visibility:public"])

cc_library(
	name = "NeighborSelection",
	srcs = ["NeighborSelection.cpp"],
	hdrs = ["NeighborSelection.hpp"],
	copts = ["-DBAZEL"],
	deps = ["//Models:Model", 
	        "//Models:LinearRegression", 
	        "//Models:ModelOptions",
	        "//Algorithms:Algorithm"]
)
