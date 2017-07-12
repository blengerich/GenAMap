if [ ! -d ./postgresdbpath ]; then
  mkdir postgresdbpath
fi

docker run --name postgres -p 5432:5432 \
  -v "$(pwd)/postgresdbpath":/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD='!!GeNaMaPnew00' \
  -e POSTGRES_USER='postgres' \
  -d postgres
