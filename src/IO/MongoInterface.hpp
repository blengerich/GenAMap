#ifndef MONGO_INTERFACE_HPP
#define MONGO_INTERFACE_HPP

#include <iostream>
#include <string>
#include <Eigen/Dense>

#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>

using namespace std;
using namespace Eigen;

class MongoInterface {
private:
    MongoInterface();
    MongoInterface(MongoInterface const &);
    void operator=(MongoInterface const &);

    mongocxx::instance instance;
    mongocxx::uri uri;
    mongocxx::client client;
    mongocxx::database db;
public:
    static MongoInterface &getInstance() {
        static MongoInterface instance;
        return instance;
    }

    void useDB(string dbName);
    mongocxx::collection getCollection(string collectionName);

    int storeResults(const MatrixXf& results, unsigned int job_id);
};

#endif
