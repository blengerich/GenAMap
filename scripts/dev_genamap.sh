#!/usr/bin/env bash

set -e

function hr {
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
}

while getopts ":u" opt; do
    case $opt in
        u)
            docker pull blengerich/genamap || { echo "failed to pull the image" >&2; exit 1; }
            hr
            echo 'Pulled the GenAMap docker image'
            hr
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            exit 1
            ;;
    esac
done

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
        docker run -v "$(pwd)/mongodbpath":/data -p 27017:27017 --name ${m_name} -d mongo mongod --smallfiles \
            || { echo 'starting mongo failed' >&2; exit 1; }
    else
        docker start ${m_name} || { echo "starting mongo failed" >&2; exit 1; }
    fi
    hr
    echo "MongoDB container has been successfully launched!"
    hr
else
    hr
    echo "MongoDB container is already running..."
    hr
fi

# Run PostgresSQL container
p_name="genamap_postgres"
if ! docker ps --format "{{.Names}}"| grep -q ${p_name}; then
    if ! docker ps -a --format "{{.Names}}"| grep -q ${p_name}; then
        docker run --name ${p_name} -p 5432:5432  -v "$(pwd)/postgresdbpath":/var/lib/postgresql/data \
            -e POSTGRES_PASSWORD='!!GeNaMaPnew00' -e POSTGRES_USER='postgres' -d postgres \
            || { echo "starting postgres failed" >&2; exit 1; }
    else
        docker start ${p_name} || { echo "starting postgres failed" >&2; exit 1; }
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

g_name="genamap_development_server"
hr
echo "Entering the GenAMap development server container..."
hr
echo $1
echo $2
#docker run -ti -p 3000:3000 -p 3001:3001 --name ${g_name} --link ${m_name}:mongo --link ${p_name}:postgres \
#            -w /usr/src/genamap \-v ${PWD}/../src/:/usr/src/genamap -v $1:/usr/src/genamap2  -v  $2:/usr/src/genamap3  blengerich/genamap
if ! docker ps --format "{{.Names}}" | grep -q ${g_name}; then
    if docker ps -a --format "{{.Names}}"| grep -q ${g_name}; then
        docker start ${g_name} \
            || { echo "starting genamap failed" >&2; exit 1; }
        docker exec -it ${g_name} bash \
            || { echo "starting genamap failed" >&2; exit 1; }
    else
        docker run -ti -p 3000:3000 -p 3001:3001 --name ${g_name} --link ${m_name}:mongo --link ${p_name}:postgres \
            -w /usr/src/genamap \-v ${PWD}/../src/:/usr/src/genamap -v $1:/usr/src/genamap_data  -v  $2:/usr/src/genamap_config  blengerich/genamap \
            || { echo "starting genamap failed" >&2; exit 1; }

    fi
else
    docker exec -it ${g_name} bash
fi
