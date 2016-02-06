package(default_visibility = ["//visibility:public"])

cc_test(
	name = "my_test",
	srcs = ["my_test.cc"],
	copts = ["-Iexternal/gtest/include"],
	deps = ["@gtest//:main"],
	size = "small"
)
