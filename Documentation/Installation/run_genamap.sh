set -e

# Install Mongo DB and PostgreSQL
if [ ! -d ./mongodbpath ]; then
  mkdir mongodbpath
fi
if [ ! -d ./postgresdbpath ]; then
  mkdir postgresdbpath
fi

echo "It will take a while to download the database in the first time..."

{ docker run -v "$(pwd)/mongodbpath":/data -p 27017:27017 --name mongo -d mongo mongod --smallfiles || { docker stop mongo; docker rm mongo; docker run -v "$(pwd)/mongodbpath":/data -p 27017:27017 --name mongo -d mongo mongod --smallfiles;} }  &> /dev/null
echo "mongo DB has been successfully launched!"

{ docker run --name postgres -p 5432:5432  -v "$(pwd)/postgresdbpath":/var/lib/postgresql/data -e POSTGRES_PASSWORD='!!GeNaMaPnew00' -e POSTGRES_USER='postgres' -d postgres || { docker stop postgres; docker rm postgres; docker run --name postgres -p 5432:5432  -v "$(pwd)/postgresdbpath":/var/lib/postgresql/data -e POSTGRES_PASSWORD='!!GeNaMaPnew00' -e POSTGRES_USER='postgres' -d postgres;} } &> /dev/null
echo "PostgreSQL has been successfully launched!"

# Run the latest GenAMap server
printf "\nDownload the latest GenAMap server...\n"
docker pull haohanwang/genamap_server

printf "\nStarting the server\n"
docker run -d -p 49160:3000 --link mongo:mongo --link postgres:postgres haohanwang/genamap_server
printf "\nServer is running in the background successfully..."
