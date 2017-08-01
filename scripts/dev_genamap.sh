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

# Run MongoDB Container
m_name="genamap_mongo"
if ! docker ps --format "{{.Names}}"| grep -q ${m_name}; then
    if ! docker ps -a --format "{{.Names}}"| grep -q ${m_name}; then
        docker run -v "$(pwd)/mongodbpath":/data -p 27017:27017 --name ${m_name} -d mongo mongod --smallfiles 1> /dev/null
    else
        docker start ${m_name} 1>/dev/null
    fi
    hr
    echo "MongoDB development container has been successfully launched!"
    hr
else
    hr
    echo "MongoDB development container is already running..."
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
    echo "PostgreSQL development container has been successfully launched!"
    hr
else
    hr
    echo "PostgreSQL development container is already running..."
    hr
fi

# Enter the GenAMap container
g_name="genamap_development_server"
hr
echo "Entering the GenAMap development server container..."
hr
if ! docker ps --format "{{.Names}}" | grep -q ${g_name}; then
    if docker ps -a --format "{{.Names}}"| grep -q ${g_name}; then
        docker start ${g_name} 1>/dev/null
        docker exec -it ${g_name} bash
    else
        docker run -ti -p 7000:3000 --name ${g_name} --link ${m_name}:mongo --link ${p_name}:postgres -w /usr/src/genamap -v ${PWD}/../src/:/usr/src/genamap blengerich/genamap
    fi
else
    docker exec -it ${g_name} bash
fi
