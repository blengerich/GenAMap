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
    docker pull blengerich/genamap || { echo 'docker pull failed'; exit 1; }
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
    if docker ps -a --format "{{.Names}}"| grep -q mongo; then
        docker start mongo 1>/dev/null
    else
        { docker run -v "$(pwd)/mongodbpath":/data -p 27017:27017 --name mongo -d mongo mongod --smallfiles || { docker stop mongo; docker rm mongo; docker run -v "$(pwd)/mongodbpath":/data -p 27017:27017 --name mongo -d mongo mongod --smallfiles;} }  1> /dev/null
    fi
    hr
    echo "Mongo DB container has been successfully launched!"
    hr
else
    hr
    echo "Mongo DB container is already running..."
    hr
fi

# Run PostgreSQL container

if ! docker ps --format "{{.Names}}"| grep -q postgres; then
    if docker ps -a --format "{{.Names}}"| grep -q postgres; then
        docker start postgres 1>/dev/null
    else
        { docker run --name postgres -p 5432:5432  -v "$(pwd)/postgresdbpath":/var/lib/postgresql/data -e POSTGRES_PASSWORD='!!GeNaMaPnew00' -e POSTGRES_USER='postgres' -d postgres || { docker stop postgres; docker rm postgres; docker run --name postgres -p 5432:5432  -v "$(pwd)/postgresdbpath":/var/lib/postgresql/data -e POSTGRES_PASSWORD='!!GeNaMaPnew00' -e POSTGRES_USER='postgres' -d postgres;} } 1> /dev/null
    fi
    hr
    echo "PostgreSQL container has been successfully launched!"
    hr
else
    hr
    echo "PostgreSQL container is already running..."
    hr
fi

# Enter the GenAMap container
hr
echo "Entering the GenAMap container..."
hr
if ! docker ps --format "{{.Image}}" | grep -q blengerich/genamap; then
    if docker ps -a --format "{{.Image}}"| grep -q blengerich/genamap; then
        line=$(docker ps -a --format "{{.Image}}" | grep -n blengerich/genamap | cut -d':' -f1 | sed -n '1p')
        container=$(docker ps -a --format "{{.Names}}" | sed -n "${line}p")
        docker start ${container} 1>/dev/null
        docker exec -it ${container} bash
    else
        docker run -ti -p 3000:3000 -p 3001:3001 --link mongo:mongo --link postgres:postgres -w /usr/src/genamap -v ${PWD}/../src/:/usr/src/genamap blengerich/genamap 1>/dev/null
    fi
else
    line=$(docker ps -a --format "{{.Image}}" | grep -n blengerich/genamap | cut -d':' -f1 | sed -n '1p')
    container=$(docker ps -a --format "{{.Names}}" | sed -n "${line}p")
    echo ${container}
    docker exec -it ${container} bash
fi
