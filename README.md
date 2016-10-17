![GenAMap Logo](http://daniellehu.com/photos/flat/genamap.png)

[![Build Status](http://ec2-52-201-224-46.compute-1.amazonaws.com:8080/buildStatus/icon?job=GenAMap_Master)](http://ec2-52-201-224-46.compute-1.amazonaws.com:8080/job/GenAMap_Master/)

## Website:
[GenAMap](http://www.sailing.cs.cmu.edu/main/genamap/) is an open-source platform for visual machine learning of genomics.

The proliferation of genomic data has increased the usefulness of complex machine learning algorithms for structured association mapping. Such methods can effectively relate genetic polymorphisms with phenotypes, but correct use requires algorithmic expertise to run code and domain expertise to analyze results. To overcome these challenges, the GenAMap software platform was developed and released in 2010. Since then, the sizes of available biological data have continued to increase exponentially. To address these challenges, GenAMap is redesigned for scalability and updated with state-of-the-art methods for efficient calculations on human genome-scale data. The user experience is overhauled as an intuitive web application with a focus on simplicity and ease of use. GenAMap is available to use through [sailing.cs.cmu.edu/main/genamap](sailing.cs.cmu.edu/main/genamap) or on your own cluster.


## Documentation:
To get started, see the [docs](https://github.com/blengerich/GenAMap/tree/master/Documentation), which include [usage examples](https://github.com/blengerich/GenAMap/tree/master/Documentation/) and [development information](https://github.com/blengerich/GenAMap/tree/master/Documentation/Development).

Have a question about GenAMap? Email us at genamap-team@gmail.com. To help us to get to know you better, please provide your name and affiliation when requesting support. We also have a [Google group](https://groups.google.com/forum/#!forum/genamap-users).


## Dependencies:
For informational purposes only, you don't need to install anything. We are now using [Docker](http://docker.com) to sync our environments. See [docs](https://github.com/blengerich/GenAMap_V2/blob/master/Documentation/Development/Docker/Quick_Start.md) for more information.

* [Java (JDK) 1.8 or greater](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
* [Eigen C++](http://eigen.tuxfamily.org/index.php?title=Main_Page)
* [MySQL C++ connector](http://dev.mysql.com/downloads/connector/cpp/)
* [JsonCPP](https://github.com/open-source-parsers/jsoncpp)
* [Boost](http://www.boost.org/)
* [Bazel](https://github.com/bazelbuild/bazel)
* [Google Testing Framework](https://github.com/google/googletest)
