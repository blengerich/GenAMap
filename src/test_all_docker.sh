#!/bin/bash
sudo docker run -ti -p 8000:3000 -v ${PWD}/../:/usr/src/genamap blengerich/genamap /bin/bash -c "cd /usr/src/genamap/src; ./test_all.sh"
