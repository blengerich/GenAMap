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
                #"-L/home/ben/GenAMap_Screw_Dropbox/GenAMap_V2/src/tools/v8/out/x64.release/obj.target/tools/gyp",
                #"-L/usr/src/genamap/src/_bad_scm/v8B0V4SR/v8/out/native/obj.target/tools/gyp/",
                #"-L/usr/src/genamap/src/tools/v8/out/tools/gyp/",
                #"-lv8_base",
                #"-lv8_libbase",
                #"-lv8_libplatform",
                #"-lv8_snapshot",
                #"-L//tools/v8/out/x64.release/obj.target/tools/gyp",
                #"-Ltools/v8/out/x64.release/obj.target/tools/gyp/",
                #"-Ltools/v8/out/x64.release/obj.target/tools/gyp/libv8fooo_base.a",
                #"-Ltools/v8/out/x64.release/obj.target/tools/gyp/libv8_external_snapshot.a",
                #"-Ltools/v8/out/x64.release/obj.target/tools/gyp/libv8_libplatform.a",
                #"-Ltools/v8/out/x64.release/obj.target/tools/gyp/libv8_nosnapshot.a",
                #"-Ltools/v8/out/x64.release/obj.target/tools/gyp/libv8_libbase.a",
                "-luv"],
    deps = ["@gtest//:main",
		"//algorithm:Algorithm",
        "//algorithm:AlgorithmOptions",
        "//algorithm:IterativeUpdate",
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
    linkopts = ["-lv8",
                "-lpthread",
                "-lrt",
                "-ldl",
                #"-L/usr/src/genamap/src/tools/v8/out/third_party/icu",
                #"-L/usr/src/genamap/src/tools/v8/out/x64.release/obj.target/tools/gyp",
                #"-L/usr/src/genamap/src/tools/v8/out/tools/gyp/",
                #"-L/usr/src/genamap/src/tools/v8/third_party/icu/source/lib/",
                #"-L/usr/src/genamap/src/_bad_scm/v8B0V4SR/v8/out/native/obj.target/tools/gyp/",
                #"-lv8_base",
                #"-lv8_libbase",
                #"-lv8_libplatform",
                #"-lv8_nosnapshot",
                #"-licui18n",
                #"-licuuc",
                "-luv"],
    deps = ["@gtest//:main",
            "//Scheduler:Scheduler",],
            #"//tools/v8/out/x64.release/obj.target/tools/gyp:v8"],
    size = "small"
)
