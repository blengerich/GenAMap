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
