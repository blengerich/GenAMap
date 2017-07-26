#include "MongoInterface.hpp"

#include <cstdint>
#include <iostream>
#include <vector>
#include <Eigen/Dense>
#include <cstdlib>
#include <string>

#include <bsoncxx/json.hpp>
#include <mongocxx/client.hpp>
#include <mongocxx/stdx.hpp>
#include <mongocxx/uri.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/collection.hpp>

using bsoncxx::builder::stream::close_array;
using bsoncxx::builder::stream::close_document;
using bsoncxx::builder::stream::document;
using bsoncxx::builder::stream::finalize;
using bsoncxx::builder::stream::open_array;
using bsoncxx::builder::stream::open_document;

using namespace std;
using namespace Eigen;

MongoInterface::MongoInterface()
: instance{}
{
    char* addr = getenv("MONGO_PORT_27017_TCP_ADDR");
    char* port = getenv("MONGO_PORT_27017_TCP_PORT");
    cout << addr << "\n" << port << "\n";
    string path = "mongodb://";
    path += addr;
    path += ":";
    path += port;
    uri = mongocxx::uri(path);
    client = mongocxx::client(uri);
    useDB("test");
    cout << "instance made!\n";
}

void MongoInterface::useDB(string dbName) {
    db = client[dbName];
    cout << "connected to " << dbName << "!\n";
}

mongocxx::collection MongoInterface::getCollection(string collectionName) {
    return db[collectionName];
}

int MongoInterface::storeResults(const MatrixXf& results, unsigned int job_id) {
    vector<bsoncxx::document::value> docs;
    mongocxx::collection datas =  getCollection("datas");
    for (int i = 0; i < results.rows(); i++) {
        if (docs.size() >= 1000) {
            datas.insert_many(docs);
            docs.clear();
        }
        auto builder = document{};
        auto insertedRow = builder << "row_id" << i;
        auto insertedJob = insertedRow << "job_id" << (int)job_id;
        auto inArray = insertedJob << "data" << open_array;
        for (int j = 0; j < results.cols(); j++) {
            inArray = inArray << results(i,j);
        }
        auto afterArray = inArray << close_array;
        bsoncxx::document::value doc = afterArray << finalize;
        docs.push_back(doc);
    }
    datas.insert_many(docs);
    cout << "loaded job " << job_id << "\n";

    return (int)job_id;
}