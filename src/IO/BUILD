package(default_visibility = ["//visibility:public"])

cc_library(
    name = "FileIO",
    srcs = ["FileIO.cpp"],
    hdrs = ["FileIO.hpp"],
    #deps = ["//model:TreeLasso",],
)

cc_library(
    name = "DataBaseCommunicator",
    srcs = ["DataBaseCommunicator.cpp"],
    hdrs = ["DataBaseCommunicator.hpp"],
)

cc_library(
    name = "MongoInterface",
    srcs = ["MongoInterface.cpp"],
    hdrs = ["MongoInterface.hpp"],
    copts = [
        "-I/usr/local/include/mongocxx/v_noabi",
        "-I/usr/local/include/libmongoc-1.0",
        "-I/usr/local/include/bsoncxx/v_noabi",
        "-I/usr/local/include/libbson-1.0",],
    linkopts = ["-lmongocxx","-lbsoncxx"],
)

