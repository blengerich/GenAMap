# GenAMap Version 2

[![Build Status](http://ec2-52-90-30-47.compute-1.amazonaws.com/buildStatus/icon?job=GenAMap_Backend)](http://ec2-52-90-30-47.compute-1.amazonaws.com/job/GenAMap_Backend/) <-- Click here to check out the build process (you will need to make an account to do anything, go [here](http://ec2-52-90-30-47.compute-1.amazonaws.com/) to create one)

## Dependencies:

For now, put these dependencies in /usr/include NOT /usr/local/include. Bazel squashes includes with locations outside of the workspace directory, so we need to put them in the default C++ include directory. It may be possible to use bazel's new_local_directory command to customize location, but I haven't looked into it enough to recommend it.

* [Java (JDK) 1.8 or greater](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
* [Eigen C++](http://eigen.tuxfamily.org/index.php?title=Main_Page)
* [MySQL C++ connector](http://dev.mysql.com/downloads/connector/cpp/)
* [JsonCPP](https://github.com/open-source-parsers/jsoncpp)
* [Boost](http://www.boost.org/)
* [Bazel](https://github.com/bazelbuild/bazel) - This can be installed via the install_bazel.sh script in the depends folder. Just select your platform, run the script, and add the bazel_install/binary folder to your path. Check out my quick notes on Bazel to get started.
* [Google Testing Framework](https://github.com/google/googletest) - Bazel will install this for you, no need to do anything.


## Bazel Quick Notes
Bazel is Google's open source build tool. It can build and test any compiled language, and standardizes our builds so we don't have to rely on IDE-generated targets or hand-crafted Makefiles. Once you have installed the dependencies, you can try a few of the examples included in the src folder.

```bash
cd src
bazel build //:main
bazel test //:tests
```

### A few Syntax Notes
Bazel looks for "packages", which are folders containing a BUILD file. The build file describes the targets which can be built. For instance, the main executable is built with
```python
cc_binary(
    name = "main",
    srcs = ["main.cpp"],
    deps = ["//model:LinearRegression",
            "//algorithm:ProximalGradientDescent",
            "//:FileIO",
            "//json:JsonCoder",],
)
```
Targets are defined in the format "//package:target", where package gives the path from the src directory.

Read more [here](http://bazel.io/docs/getting-started.html).

## Google Test Quick Notes
Work in progress, a good introduction is [here](http://www.ibm.com/developerworks/aix/library/au-googletestingframework.html).
