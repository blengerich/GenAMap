# Install and start Mongo DB
if [ ! -d ./mongodbpath ]; then
  mkdir mongodbpath
fi
docker run -v "$(pwd)/mongodbpath":/data -p 27017:27017 --name mongo -d mongo mongod --smallfiles

# Install and start Postgres DB
if [ ! -d ./postgresdbpath ]; then
  mkdir postgresdbpath
fi

docker run --name postgres -p 5432:5432 \
  -v "$(pwd)/postgresdbpath":/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD='' \
  -d postgres

# Install the main GenAMap Server
docker pull haohanwang/genamap_server
