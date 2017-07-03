docker run -ti -p 7000:3000 --link mongo:mongo --link postgres:postgres -w /usr/src/genamap -v ${PWD}/../src/:/usr/src/genamap blengerich/genamap || { echo 'docker run failed'; exit 1; }
