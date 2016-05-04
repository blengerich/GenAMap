#!/bin/bash

docker login || { echo 'docker login failed'; exit 1; }
docker pull blengerich/genamap || { echo 'docker pull failed'; exit 1; }
docker run -ti -p 8000:3000 -v ${PWD}/../:/usr/src/genamap blengerich/genamap || { echo 'docker run failed'; exit 1; }

