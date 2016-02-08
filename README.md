# GenAMap Version 2

[![Build Status](http://ec2-52-90-30-47.compute-1.amazonaws.com/buildStatus/icon?job=GenAMap_Backend)](http://ec2-52-90-30-47.compute-1.amazonaws.com/job/GenAMap_Backend/) <-- Click here to check out the build process (you will need to make an account to do anything)

Todo - Add test coverage here

Dependencies:

For now, put these dependencies in /usr/include NOT /usr/local/include. Bazel squashes includes with locations outside of the workspace directory, so we need to put them in the default C++ include directory. It may be possible to use bazel's new_local_directory command to customize location, but I haven't looked into it enough to recommend it.

* [Java (JDK) 1.8 or greater](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
* [Eigen C++](http://eigen.tuxfamily.org/index.php?title=Main_Page)
* [MySQL C++ connector](http://dev.mysql.com/downloads/connector/cpp/)
* [JsonCPP](https://github.com/open-source-parsers/jsoncpp)
* [Boost] (http://www.boost.org/)
* [Bazel](https://github.com/bazelbuild/bazel) - This can be installed via the install_bazel.sh script in the depends folder. Just select your platform, run the script, and add the bazel_install/binary folder to your path as directed by the bazel install script. Check out my quick notes on Bazel to get started.
* [Google Testing Framework](https://github.com/google/googletest) - Bazel will install this for you, no need to do anything.
