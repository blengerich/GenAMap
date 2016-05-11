#!/bin/bash
set -e

docker run -ti -v ${PWD}/../../:/usr/src/genamap blengerich/genamap /bin/bash -c "cd /usr/src/genamap/depends; ./install_bazel.sh; cd /usr/src/genamap/src/scripts; ./test_all_docker.sh; exit"
