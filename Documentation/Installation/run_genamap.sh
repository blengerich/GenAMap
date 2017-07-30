#!/bin/bash
set -e

function hr {
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
}

# Download the latest Genamap Server image
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
    hr
    echo -e "Download the latest GenAMap server..."
    hr
    docker login || { echo 'docker login failed'; exit 1; }
    docker pull haohanwang/genamap_server || { echo 'docker pull failed'; exit 1; }
    date +%s > last_docker_pull.start
fi


if [ ! -d ./mongodbpath ]; then
  mkdir mongodbpath
fi
if [ ! -d ./postgresdbpath ]; then
  mkdir postgresdbpath
fi

# Run Mongo DB Container
if ! docker ps --format "{{.Names}}"| grep -q mongo; then
    if ! docker ps -a --format "{{.Names}}"| grep -q mongo; then
        { docker run -v "$(pwd)/mongodbpath":/data -p 27017:27017 --name mongo -d mongo mongod --smallfiles || { docker stop mongo; docker rm mongo; docker run -v "$(pwd)/mongodbpath":/data -p 27017:27017 --name mongo -d mongo mongod --smallfiles;} }  1> /dev/null
    else
        docker start mongo 1>/dev/null
    fi
    hr
    echo "Mongo DB container has been successfully launched!"
    hr
fi

# Run PostgresSQL container

if ! docker ps --format "{{.Names}}"| grep -q postgres; then
    if ! docker ps -a --format "{{.Names}}"| grep -q postgres; then
        { docker run --name postgres -p 5432:5432  -v "$(pwd)/postgresdbpath":/var/lib/postgresql/data -e POSTGRES_PASSWORD='!!GeNaMaPnew00' -e POSTGRES_USER='postgres' -d postgres || { docker stop postgres; docker rm postgres; docker run --name postgres -p 5432:5432  -v "$(pwd)/postgresdbpath":/var/lib/postgresql/data -e POSTGRES_PASSWORD='!!GeNaMaPnew00' -e POSTGRES_USER='postgres' -d postgres;} } 1> /dev/null
    else
        docker start postgres 1>/dev/null
    fi
    hr
    echo "PostgreSQL container has been successfully launched!"
    hr
fi

# Run the GenAMap server
if ! docker ps | grep -q haohanwang/genamap_server; then
    if ! docker ps -a --format "{{.Image}}"| grep -q haohanwang/genamap_server; then
        docker run -d -p 49160:3000 --link mongo:mongo --link postgres:postgres haohanwang/genamap_server 1> /dev/null
    else
        line=$(docker ps -a --format "{{.Image}}" | grep -n haohanwang/genamap_server | cut -d':' -f1)
        docker start $(docker ps -a --format "{{.Names}}" | sed -n ${line}p)
    fi
    hr
    echo "GenAMap Server container has been successfully launched!"
    hr
fi
hr
echo "Server is running in the background successfully on port 49160..."
hr
