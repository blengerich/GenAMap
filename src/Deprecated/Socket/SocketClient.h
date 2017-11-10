//
// Created by WangHaohan on 2/19/16.
//

#ifndef GENAMAP_V2_SOCKETCLIENT_H
#define GENAMAP_V2_SOCKETCLIENT_H


#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h>
#include <stdexcept>
#include <string>
#include <iostream>
#include "json/json.h"

using namespace std;


class SocketClient {
private:
    int sockfd, portno, flag;
    struct sockaddr_in serv_addr;
    struct hostent *server;
public:

    SocketClient(char*, int);

    int connect_to_server();

    void send_message(string);

    char* get_message();
};



#endif //GENAMAP_V2_SOCKETCLIENT_H
