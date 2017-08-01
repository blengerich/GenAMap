docker run -ti -p 3000:3000 -p 3001:3001 --link mongo:mongo --link postgres:postgres -w /usr/src/genamap -v ${PWD}/../src/:/usr/src/genamap blengerich/genamap || { echo 'docker run failed'; exit 1; }
