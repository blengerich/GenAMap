#!/bin/bash
set -e

docker run -i -v /Users/xiejie/cmu/research/genamap:/usr/src/genamap blengerich/genamap /bin/bash -c "cd /usr/src/genamap/scripts; ./test_all_docker.sh; exit"
