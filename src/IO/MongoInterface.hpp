#ifndef MONGO_INTERFACE_HPP
#define MONGO_INTERFACE_HPP

#include <iostream>
#include <string>
#include <Eigen/Dense>
#include <vector>

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

    bool storeResults(const MatrixXf& results, const string& filename, const vector<string>& marker_ids);
    // takes in identifying filename to store with results, as well as ids of markers
    // the size of marker_ids must be equal to the number of rows in results
};

#endif
