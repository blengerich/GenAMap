package(default_visibility = ["//visibility:public"])


cc_library(
	name = "json",
	srcs = ["json.h"],
)


cc_library(
	name = "JsonCoder",
	srcs = ["JsonCoder.cpp"],
	hdrs = ["JsonCoder.hpp"],
	deps = ["//json:json",
		"//:DataBaseCommunicator"],
)
