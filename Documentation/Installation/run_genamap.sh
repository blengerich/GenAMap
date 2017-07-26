set -e

docker run -d -p 49160:3000 --link mongo:mongo --link postgres:postgres haohanwang/genamap_server

