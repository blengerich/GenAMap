package(default_visibility = ["//visibility:public"])

cc_library(
    name = "Stats",
    srcs = ["Stats.cpp"],
    hdrs = ["Stats.hpp"],
    copts = ["-Iexternal/gtest/include",
            "-DBAZEL"],
    deps = ["//Models:Model"]
)

cc_library(
	name = "FisherTest",
	srcs = ["FisherTest.cpp"],
	hdrs = ["FisherTest.h"],
	copts = ["-DBAZEL"],
	deps = ["//Models:Model",
			"//Stats:Stats"]
)

cc_library(
	name = "Chi2Test",
	srcs = ["Chi2Test.cpp"],
	hdrs = ["Chi2Test.h"],
	copts = ["-DBAZEL"],
	deps = ["//Stats:Stats"]
)

cc_library(
	name = "WaldTest",
	srcs = ["WaldTest.cpp"],
	hdrs = ["WaldTest.h"],
	copts = ["-DBAZEL"],
	deps = ["//Math:Math",
			"//Stats:Stats"]
)

cc_test(
    name = "Stats_Tests",
    srcs = ["Stats_Tests.cpp"],
    copts = ["-Iexternal/gtest/include",
            "-DBAZEL"],
    linkopts = ["-lm"],
    deps = ["@gtest//:main",
            "//Stats:Stats"],
    size = "small"
)
