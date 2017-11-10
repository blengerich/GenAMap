//
// Created by WangHaohan on 2/19/16.
//

#ifndef GENAMAP_V2_SOCKETSERVER_H
#define GENAMAP_V2_SOCKETSERVER_H


#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <stdexcept>
#include <iostream>
#include <algorithm>
#include <pthread.h>
#include <vector>

#include "json/JsonCoder.hpp"

using namespace std;


class SocketServer {

private:
    int sockfd, newsockfd; //file descriptors
    int portno; //port number on which the server accepts connections
    socklen_t clilen; //size of the address of the client
//    char buffer[65535]; //server reads characters from the socket connection into this buffer.
    struct sockaddr_in serv_addr, cli_addr; //structures containing an internet address
    int flag;

public:
    SocketServer(int);
    int serve(int);

    static void *process(void *ptr);

};

#endif //GENAMAP_V2_SOCKETSERVER_H
