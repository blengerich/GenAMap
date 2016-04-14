package(default_visibility = ["//visibility:public"])

cc_library(
    name = "Stats",
    srcs = ["Stats.cpp"],
    hdrs = ["Stats.hpp"],
    copts = ["-Iexternal/gtest/include",
            "-DBAZEL"],
    deps = []
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
