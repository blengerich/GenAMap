#!/bin/bash
sudo docker run -i -v ${PWD}/../:/usr/src/genamap blengerich/genamap /bin/bash -c "cd /usr/src/genamap/src; ./test_all.sh"
exit $?
