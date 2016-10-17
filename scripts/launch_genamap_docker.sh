#!/bin/bash
set -e
# Should be run from INSIDE a Docker container

cd /usr/src/genamap/Scheduler/node
eval "node-gyp rebuild"

cd /usr/src/genamap/frontend
eval "npm install"
eval "nodemon"