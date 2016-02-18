package(default_visibility = ["//visibility:public"])

cc_binary(
	name = "main",
	srcs = ["main.cpp"],
	deps = ["//model:LinearRegression",
		"//algorithm:ProximalGradientDescent",
		"//IO:FileIO",
		"//json:JsonCoder",],
)


cc_test(
	name = "my_test",
	srcs = ["my_test.cc"],
	copts = ["-Iexternal/gtest/include"],
	deps = ["@gtest//:main"],
	size = "small"
)

cc_test(
	name = "tests",
	srcs = ["tests.cpp", "my_test.cc"],
	copts = ["-Iexternal/gtest/include"],
	deps = ["@gtest//:main",
			"//Scheduler:Scheduler_Tests"],
	size = "small",
)
