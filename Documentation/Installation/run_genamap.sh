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

# Run MongoDB Container
m_name="genamap_mongo"
if ! docker ps --format "{{.Names}}"| grep -q ${m_name}; then
    if ! docker ps -a --format "{{.Names}}"| grep -q ${m_name}; then
        docker run -v "$(pwd)/mongodbpath":/data -p 27017:27017 --name ${m_name} -d mongo mongod --smallfiles 1> /dev/null
    else
        docker start ${m_name} 1>/dev/null
    fi
    hr
    echo "MongoDB production container has been successfully launched!"
    hr
else
    hr
    echo "MongoDB production container is already running..."
    hr
fi

# Run PostgresSQL container
p_name="genamap_postgres"
if ! docker ps --format "{{.Names}}"| grep -q ${p_name}; then
    if ! docker ps -a --format "{{.Names}}"| grep -q ${p_name}; then
        docker run --name ${p_name} -p 5432:5432  -v "$(pwd)/postgresdbpath":/var/lib/postgresql/data -e POSTGRES_PASSWORD='!!GeNaMaPnew00' -e POSTGRES_USER='postgres' -d postgres 1> /dev/null
    else
        docker start ${p_name} 1>/dev/null
    fi
    hr
    echo "PostgreSQL production container has been successfully launched!"
    hr
else
    hr
    echo "PostgreSQL production container is already running..."
    hr
fi

# Run the GenAMap server
g_name="genamap_production_server"
if ! docker ps --format "{{.Names}}"| grep -q ${g_name}; then
    if ! docker ps -a --format "{{.Names}}"| grep -q ${g_name}; then
        docker run -d -p 49160:3000 --name ${g_name} --link ${m_name}:mongo --link ${p_name}:postgres haohanwang/genamap_server 1> /dev/null
    else
        docker start ${g_name} 1>/dev/null
    fi
    hr
    echo "GenAMap Prouction Server container has been successfully launched!"
    hr
else
    hr
    echo "GenAMap Production Server container is already running..."
    hr
fi
hr
echo "Server is running in the background successfully on port 49160..."
hr
