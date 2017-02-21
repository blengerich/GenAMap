//
// Created by WangHaohan on 2/19/16.
//

#include "SocketClient.h"

SocketClient::SocketClient(char *hostname, int portno) {
    server = gethostbyname(hostname);
    this->portno = portno;
}

int SocketClient::connect_to_server() {
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0)
        throw std::runtime_error("Error in Openning Socket");
    bzero((char *) &serv_addr, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    bcopy((char *)server->h_addr,
          (char *)&serv_addr.sin_addr.s_addr,
          server->h_length);
    serv_addr.sin_port = htons(portno);
    if (connect(sockfd,(struct sockaddr *) &serv_addr,sizeof(serv_addr)) < 0)
        throw std::runtime_error("Error in Connecting");
    return 1;
}

void SocketClient::send_message(string message) {
    char * m = new char [message.length() + 1];
    strcpy(m, message.c_str());
    flag = write(sockfd,m,strlen(m));
    if (flag < 0) {
        throw std::runtime_error("Error in Writing Message");
    }
}

char* SocketClient::get_message() {
    char result[65535];
    bzero(result,65535);
    flag = read(sockfd,result,65535);
    if (flag < 0) {
        throw std::runtime_error("Error in reading message");
    }
    return result;
}