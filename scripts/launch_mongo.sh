if [ ! -d ./mongodbpath ]; then
  mkdir mongodbpath
fi
docker run -v "$(pwd)/mongodbpath":/data -p 27017:27017 --name mongo -d mongo mongod --smallfiles
