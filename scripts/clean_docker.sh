#!/bin/bash

set -e

echo 'Here are all of your Docker containers taking up space.'
docker ps -a
echo 'Now removing all containers that have not been used for a week.'
docker ps -a | grep 'weeks ago' | awk '{print $1}' | xargs docker rm
echo 'Done.'

echo 'Here are all of your Docker images. If there are multiple you probably want to remove some using docker rmi'.
docker images