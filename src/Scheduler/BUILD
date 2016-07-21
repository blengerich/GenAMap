package(default_visibility = ["//visibility:public"])

cc_library(
    name = "Scheduler",
    srcs = ["Scheduler.cpp"],
    hdrs = ["Scheduler.hpp"],
    copts = ["-Iexternal/gtest/include",
            "-DBAZEL"],
    linkopts = ["-lv8",
                "-lpthread",
                "-lrt",
                "-ldl",
                "-luv",
                "-lz",
                "-lm"],
    deps = ["@gtest//:main",
		"//algorithm:Algorithm",
        "//algorithm:AlgorithmOptions",
        "//algorithm:BrentSearch",
        "//algorithm:GridSearch",
        "//algorithm:IterativeUpdate",
        "//algorithm:ProximalGradientDescent",
        "//model:AdaMultiLasso",
	"//model:GFlasso",
	"//model:lasso",
	"//model:LinearRegression",
        "//model:Model",
        "//model:ModelOptions",
	"//model:TreeLasso",
        "//Scheduler:Job"]
)


cc_library(
    name = "Job",
    hdrs = ["Job.hpp"],
    copts = ["-DBAZEL"],
    linkopts = ["-lv8"],
    deps = ["//algorithm:Algorithm",
            "//model:Model"]
)


cc_test(
    name = "Scheduler_Tests",
    srcs = ["Scheduler_Tests.cpp"],
    copts = ["-Iexternal/gtest/include",
            "-Itools/.node-gyp/5.9.1/include",
            "-DBAZEL"],
    linkopts = ["-luv",
                "-lv8",
                "-lpthread",
                "-lrt",
                "-ldl",
                "-lz"],
    deps = ["@gtest//:main",
            "//Scheduler:Scheduler",],
    size = "medium"
)
