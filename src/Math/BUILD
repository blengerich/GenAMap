package(default_visibility = ["//visibility:public"])

cc_library(
	name = "Math",
	srcs = ["Math.cpp"],
	hdrs = ["Math.hpp"],
	deps = []
)


cc_test(
    name = "Math_Tests",
    srcs = ["Math_Tests.cpp"],
    copts = ["-Iexternal/gtest/include"],
    deps = ["Math","@gtest//:main"],
    size = "small"
)


