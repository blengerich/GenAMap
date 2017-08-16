![GenAMap Logo](http://www.cs.cmu.edu/~blengeri/img/genamap_logo.png)

[![Build Status](http://ec2-52-201-224-46.compute-1.amazonaws.com:8080/buildStatus/icon?job=GenAMap_Master)](http://ec2-52-201-224-46.compute-1.amazonaws.com:8080/job/GenAMap_Master/)  [![Website](https://img.shields.io/website-up-down-green-red/http/genamap.org.svg)](http://genamap.org)
[![license](https://img.shields.io/github/license/blengerich/genamap.svg)](https://github.com/blengerich/GenAMap/blob/master/License.md) [![GitHub closed pull requests](https://img.shields.io/github/issues-pr-closed/blengerich/genamap.svg)](https://github.com/blengerich/GenAMap/pulls) [![GitHub closed issues](https://img.shields.io/github/issues-closed/blengerich/genamap.svg)](https://github.com/blengerich/GenAMap/issues)

[GenAMap](http://genamap.org) is an open-source platform for visual machine learning of genome-phenome associations.

The proliferation of genomic data has increased the usefulness of complex machine learning algorithms for the next generation of genome-wide association studies (GWAS). These methods effectively relate genetic polymorphisms with phenotypes, but they require algorithmic expertise to run code and domain expertise to analyze results. To overcome these challenges, the GenAMap software platform has been developed to provide an intuitive, visual interface for next-generation GWAS. The user experience is an intuitive web application with a focus on simplicity and ease of use. GenAMap is available to use at [genamap.org](http://genamap.org). For use with private or large data, it is easy to set up on your own server with a simple [Docker image](http://hub.docker.com/r/blengerich/genamap) for all dependencies. Please contact us with any questions.


## Documentation:
To get started, see the [docs](https://github.com/blengerich/GenAMap/tree/master/Documentation), which include [usage examples](https://github.com/blengerich/GenAMap/tree/master/Documentation/ExampleData) and [development information](https://github.com/blengerich/GenAMap/tree/master/Documentation/Development).

## Installation:
To install GenAMap locally, first you need to [Install Docker](https://docs.docker.com/engine/installation/), and then execute the following script in your terminal:

```shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/blengerich/GenAMap/master/Documentation/Installation/run_genamap.sh)"
```

After that, you can enjoy the next-generation GWAS by visiting __localhost__ on Linux. On Mac, this is __192.168.99.100__, or __0.0.0.0__ if your docker version > 1.2.x

## Contact:
Have a question about GenAMap? Email us at genamap.team@gmail.com. To help us to get to know you better, please provide your name and affiliation when requesting support. We also have a [Google group](https://groups.google.com/forum/#!forum/genamap-users) for users.
