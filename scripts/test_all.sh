#!/bin/bash
set -e

docker run -i -v ${PWD}/../:/usr/src/genamap blengerich/genamap /bin/bash -c "cd /usr/src/genamap/scripts; ./test_all_docker.sh; exit"
