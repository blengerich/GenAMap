#!/bin/bash
sudo docker run -i -v ${PWD}/../:/usr/src/genamap blengerich/genamap /bin/bash -c "cd /usr/src/genamap/depends; chmod +x install_bazel.sh; ./install_bazel.sh; cd ../src; ./test_all.sh"
