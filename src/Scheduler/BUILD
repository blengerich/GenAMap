package(default_visibility = ["//visibility:public"])

cc_library(
    name = "Scheduler",
    srcs = ["Scheduler.cpp"],
    hdrs = ["Scheduler.hpp"],
    copts = ["-Iexternal/gtest/include",
            "-DBAZEL"],
    deps = ["@gtest//:main",
		"//algorithm:Algorithm",
        "//algorithm:AlgorithmOptions",
        "//algorithm:ProximalGradientDescent",
        "//model:lasso",
        "//model:Model",
        "//model:ModelOptions",
        "//Scheduler:Job"]
)

cc_library(
    name = "Job",
    hdrs = ["Job.hpp"],
    copts = ["-DBAZEL"],
    deps = ["//algorithm:Algorithm",
            "//model:Model"]
)


cc_test(
    name = "Scheduler_Tests",
    srcs = ["Scheduler_Tests.cpp"],
    copts = ["-Iexternal/gtest/include",
            "-Itools/.node-gyp/5.9.1",
            "-DBAZEL"],
    linkopts = ["-lm"],
    deps = ["@gtest//:main",
            "//Scheduler:Scheduler"],
    size = "small"
)
