#!/bin/bash

docker login
docker pull blengerich/genamap
docker run -ti -p 8000:3000 -v ${PWD}/../:/usr/src/genamap blengerich/genamap
cd /usr/src/genamap
