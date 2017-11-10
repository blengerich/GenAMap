#!/usr/bin/env bash
set -e

function hr {
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
}

while getopts ":u" opt; do
    case $opt in
        u)
            docker pull haohanwang/genamap_server || { echo "failed to pull the image" >&2; exit 1; }
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
            || { echo "starting mongo failed" >&2; exit 1; }
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
        docker start ${p_name} \
            || { echo "starting mongo failed" >&2; exit 1; }
    fi
    hr
    echo "PostgreSQL container has been successfully launched!"
    hr
else
    hr
    echo "PostgreSQL container is already running..."
    hr
fi

# Run the GenAMap server
g_name="genamap_production_server"
if ! docker ps --format "{{.Names}}"| grep -q ${g_name}; then
    if ! docker ps -a --format "{{.Names}}"| grep -q ${g_name}; then
        docker run -d -p 80:3000 --name ${g_name} --link ${m_name}:mongo --link ${p_name}:postgres -v $1:/usr/src/genamap/genamap_data -v $2:/usr/src/genamap/genamap_config haohanwang/genamap_server \
            || { echo "starting genamap failed" >&2; exit 1; }
    else
        docker start ${g_name} \
            || { echo "starting genamap failed' >&2" exit 1; }
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
echo "Server is running in the background successfully on port 80..."
hr
