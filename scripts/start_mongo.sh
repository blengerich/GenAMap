docker run -v "$(pwd)/dbpath":/data -p 27017:27017 --name mongo -d mongo mongod --smallfiles
