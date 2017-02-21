//
// Created by WangHaohan on 2/19/16.
//

#include "SocketServer.h"

SocketServer::SocketServer(int protno) { this->portno = protno; }

int SocketServer::serve(int times) {
    pthread_t thread;
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0)
        throw std::runtime_error("ERROR opening socket");
    bzero((char *) &serv_addr, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_addr.s_addr = INADDR_ANY;
    serv_addr.sin_port = htons(portno);
    if (::bind(sockfd, (struct sockaddr *) &serv_addr, // use ::bind for mac, use bind for linux
             sizeof(serv_addr)) < 0) {
        throw std::runtime_error("ERROR on binding");
    }
    listen(sockfd, 5);
    clilen = sizeof(cli_addr);

    int i = 0;
    while (i < times) {
        /* accept incoming connections */
        newsockfd = accept(sockfd,
                           (struct sockaddr *) &cli_addr,
                           &clilen);
        if (newsockfd < 0)
            throw std::runtime_error("ERROR on accept");
        else {
            /* start a new thread but do not wait for it */
            cout << "This is process # " << to_string(i+1) << endl;
            pthread_create(&thread, 0, SocketServer::process, &newsockfd);
            pthread_detach(thread);
        }
        i++;
    }
    close(sockfd);
}

void* SocketServer::process(void *ptr) {
    int len;
    int *conn;
    long addr = 0;
    char buffer[65535];
    if (!ptr) pthread_exit(0);

    conn = (int*) ptr;
    bzero(buffer, 65535);
    int flag;
    flag = read(*conn, buffer, 65535);
    if (flag < 0) throw std::runtime_error("ERROR reading from socket");
    string str(buffer);
    mainMessage mm = JsonCoder::getInstance().decodeMainMessage(str);
    string m = JsonCoder::getInstance().encodeMainMessage(mm);
    const char *r = m.c_str();
    flag = write(*conn, r, 65535);
    if (flag < 0) throw std::runtime_error("ERROR writing to socket");
    close(*conn);

    pthread_exit(0);
}

