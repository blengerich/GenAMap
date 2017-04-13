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

cc_library(
	name = "GraphicalLasso",
	srcs = ["GraphicalLasso.cpp"],
	hdrs = ["GraphicalLasso.hpp"],
	copts = ["-DBAZEL"],
	deps = ["//Math:Math", 
	        "//Models:Model", 
	        "//Models:LinearRegression", 
	        "//Models:ModelOptions",
	        "//Algorithms:Algorithm"]
)
