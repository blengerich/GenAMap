#!/bin/bash

######################################################################
# CLI for running genamap docker image
# Author: Dylan Steele
######################################################################

#Set Script Name variable
SCRIPT=genamap

#Initialize variables to default values.
OPT_PORT=7000
OPT_IMAGE_TAG=latest
OPT_NAME=genamap

# Discover platform and set default IP depending on it.
if [[ "$OSTYPE" == "linux-gnu" ]]; then
  IP=localhost
elif [[ "$OSTYPE" == "darwin"* ]]; then
  # Mac OSX
  IP=`docker-machine ip default`  # for Mac  
elif [[ "$OSTYPE" == "cygwin" ]]; then
  # POSIX compatibility layer and Linux environment emulation for Windows
  IP="" # I don't know the Docker IP for Windows
else
  'echo "Running on unrecognized platform" '
fi

#Set fonts for Help.
NORM=`tput sgr0`
BOLD=`tput bold`
REV=`tput smso`

#Help function
function HELP {
  echo -e \\n"Help documentation for ${BOLD}${SCRIPT}.${NORM}"\\n
  echo -e "${REV}Basic usage:${NORM} ${BOLD}${SCRIPT} [command]${NORM}"\\n
  echo -e "[command] can be one of the following: run, gulp, docker."\\n
  echo -e "${BOLD}docker${NORM} will start the docker daemon, which needs to be running for node and gulp to work on Mac (and Windows?)."\\n
  echo -e "${BOLD}run${NORM} will start a docker container, rerun node-gyp if the module does not exist, and launch the node app in a new browser tap."\\n
  echo -e "${BOLD}gulp${NORM} will start gulp (which should not be expected to return). ${BOLD}gulp${NORM} can only be run if a container is already running (most likely from running genamap run)."\\n
  echo "Command line switches are optional. The following switches are recognized."
  echo "${REV}-p${NORM}  --Sets the value for the ${BOLD}port docker forwards to${NORM}. Default is ${BOLD}${OPT_PORT}${NORM}.Only used with node command."
  echo "${REV}-t${NORM}  --Sets the value for the ${BOLD}tag of the image${NORM}. Default is ${BOLD}${OPT_IMAGE_TAG}${NORM}. Only used with node command."
  echo "${REV}-n${NORM}  --Sets the value for the ${BOLD}name of the docker container${NORM}. Default is ${BOLD}${OPT_NAME}${NORM}. Name specified in gulp command needs to be the same as the name in the node command."
  echo -e "${REV}-h${NORM}  --Displays this help message. No further functions are performed."\\n
  echo -e "Example: ${BOLD}$SCRIPT -p 8000 -t tag1 -n foo node${NORM}"\\n
}

function DOCKER {
    bash --login '/Applications/Docker/Docker Quickstart Terminal.app/Contents/Resources/Scripts/start.sh'
}

function NODEGYP {
  docker run --name ${OPT_NAME} -ti --rm -p ${OPT_PORT}:3000 -v ${PWD}/../src:/usr/src/genamap blengerich/genamap:${OPT_IMAGE_TAG} /bin/bash -c "cd /usr/src/genamap/Scheduler/node && node-gyp rebuild"
}

function RUN {
  if [ ! -f ../src/Scheduler/node/build/Release/scheduler.node ]; then
    NODEGYP
  fi
  xdg-open "http://${IP}:${OPT_PORT}" && docker run --name ${OPT_NAME} -ti --rm -p ${OPT_PORT}:3000 -v ${PWD}/../src:/usr/src/genamap blengerich/genamap:${OPT_IMAGE_TAG} /bin/bash -c "cd /usr/src/genamap/frontend/ && nodemon -L webapp.js"
}

function GULP {
  docker exec ${OPT_NAME} /bin/bash -c "cd /usr/src/genamap/frontend; gulp watch" && docker attach ${OPT_NAME}
}

### Start getopts code ###

#Parse command line flags
#If an option should be followed by an argument, it should be followed by a ":".
#Notice there is no ":" after "h". The leading ":" suppresses error messages from
#getopts. This is required to get my unrecognized option code to work.

while getopts :p:t:n:h FLAG; do
  case $FLAG in
    p)  #set option "a"
      OPT_PORT=$OPTARG
      ;;
    t)  #set option "b"
      OPT_IMAGE_TAG=$OPTARG
      ;;
    n)  #set option "c"
      OPT_NAME=$OPTARG
      ;;
    h)  #show help
      HELP
      exit 0
      ;;
    \?) #unrecognized option - show help
      echo -e \\n"Option -${BOLD}$OPTARG${NORM} not allowed."
      # HELP
      #If you just want to display a simple error message instead of the full
      #help, remove the 2 lines above and uncomment the 2 lines below.
      echo -e "Use ${BOLD}$SCRIPT -h${NORM} to see the help documentation."\\n
      exit 2
      ;;
  esac
done

shift $((OPTIND-1))  #This tells getopts to move on to the next argument.
### End getopts code ###

#Check the number of arguments. If none are passed, print help and exit.
NUMARGS=$#
if [ $NUMARGS -eq 0 ]; then
  HELP
fi

### Main loop to process command ###
while [ $# -ne 0 ]; do
  COMMAND=$1
  if [ "$COMMAND" == "docker" ]; then
    DOCKER
    exit 1
  elif [ "$COMMAND" == "run" ]; then
    RUN
    exit 1
  elif [ "$COMMAND" == "nodegyp" ]; then
    NODEGYP
    exit 1
  elif [ "$COMMAND" == "gulp" ]; then
    GULP
    exit 1
  else
    HELP
    exit 1
  fi
  shift  #Move on to next command
done


### End main loop ###
exit 0
