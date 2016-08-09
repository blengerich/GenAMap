#!/bin/bash
set -e

try_pull_every_n_secs=$((24*3600))	# Only try pulling the Docker once/day

last_time=0
if [ -e "last_docker_pull.start" ]
then
	last_time=$(cat last_docker_pull.start)
fi
cur_time=$(date +%s)
let diff_time=$(($cur_time - $last_time))
if [ "$diff_time" -ge "$try_pull_every_n_secs" ]
then
	docker login || { echo 'docker login failed'; exit 1; }
	docker pull blengerich/genamap || { echo 'docker pull failed'; exit 1; }
	date +%s > last_docker_pull.start
fi
docker run -ti -p 7000:3000 -v ${PWD}/../src/:/usr/src/genamap blengerich/genamap || { echo 'docker run failed'; exit 1; }
