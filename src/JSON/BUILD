package(default_visibility = ["//visibility:public"])


cc_library(
	name = "json",
	srcs = ["json.h", "jsoncpp.cpp"],
)


cc_library(
	name = "JsonCoder",
	srcs = ["JsonCoder.cpp"],
	hdrs = ["JsonCoder.hpp"],
	deps = ["json",
		"//IO:DataBaseCommunicator",
		"//Math:Math"],

)
