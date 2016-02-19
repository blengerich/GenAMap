package(default_visibility = ["//visibility:public"])

cc_library(
    name = "Scheduler",
    srcs = ["Scheduler.cpp"],
    hdrs = ["Scheduler.hpp"],
    deps = ["//algorithm:Algorithm"]
)

cc_test(
    name = "Scheduler_Tests",
    srcs = ["Scheduler_Tests.cpp"],
    copts = ["-Iexternal/gtest/include"],
    deps = ["@gtest//:main",
            "//Scheduler:Scheduler"],
    size = "small"
)