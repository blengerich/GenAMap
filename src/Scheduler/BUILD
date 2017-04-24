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
		"//Algorithms:Algorithm",
        "//Algorithms:AlgorithmOptions",
        "//Algorithms:BrentSearch",
        "//Algorithms:GridSearch",
        "//Algorithms:HypoTestPlaceholder",
        "//Algorithms:IterativeUpdate",
        "//Algorithms:ProximalGradientDescent",
        "//Models:AdaMultiLasso",
        "//Models:GFlasso",
        "//Models:lasso",
        "//Models:LinearRegression",
        "//Models:Model",
        "//Models:ModelOptions",
        "//Models:TreeLasso",
        "//Scheduler:Job",
        "//Stats:FisherTest",
        "//Stats:Chi2Test",
        "//Stats:WaldTest",
        "//Graph:NeighborSelection",
        "//Graph:GraphicalLasso"]
)


cc_library(
    name = "Job",
    hdrs = ["Job.hpp"],
    copts = ["-DBAZEL"],
    linkopts = ["-lv8"],
    deps = ["//Algorithms:Algorithm",
            "//Models:Model"]
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
