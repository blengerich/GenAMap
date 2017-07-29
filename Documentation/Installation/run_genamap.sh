set -e

# PULL THE LATEST GENAMAP SERVER
docker pull haohanwang/genamap_server 

docker run -d -p 49160:3000 --link mongo:mongo --link postgres:postgres haohanwang/genamap_server
