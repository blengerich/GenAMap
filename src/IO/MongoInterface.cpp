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
    string path = "mongodb://";
    path += addr;
    path += ":";
    path += port;
    uri = mongocxx::uri(path);
    client = mongocxx::client(uri);
    useDB("test");
}

void MongoInterface::useDB(string dbName) {
    db = client[dbName];
    cout << "mongocxx connected to " << dbName << "!\n";
}

mongocxx::collection MongoInterface::getCollection(string collectionName) {
    return db[collectionName];
}

bool MongoInterface::storeResults(const MatrixXf& results, const string& filename, const vector<string>& marker_ids) {
    vector<bsoncxx::document::value> docs;
    mongocxx::collection datas =  getCollection("datas");
    mongocxx::collection snps = getCollection("snps");
    if ((int)marker_ids.size() != (int)results.rows()) {
        std::cout << "INVALID marker_ids and results" << std::endl;
        return false;
    }
    for (int i = 0; i < results.rows(); ++i) {
        if (docs.size() >= 2000) {
            datas.insert_many(docs);
            docs.clear();
        }
        bsoncxx::stdx::optional<bsoncxx::document::value> snp_value{snps.find_one(document{} << "name" << marker_ids[i] << finalize)};
        if (snp_value) {
            bsoncxx::document::view snp_view{snp_value->view()};
            bsoncxx::document::element index_element{snp_view["index"]};
            if (index_element) {
                double index;
                if (index_element.type() == bsoncxx::type::k_double) {
                    index = index_element.get_double();
                }  else if (index_element.type() == bsoncxx::type::k_int32) {
                    index = (double)index_element.get_int32();
                }  else {
                    index = 0;
                    cout << "this element was not classified: \n";
                    cout << "\tsnp\t- " << marker_ids[i] << "\n";
                    cout << "\tbsoncxx::type\t- " << (int)index_element.type() << endl;
                }

                auto builder = document{};
                auto insertedIndex = builder << "index" << index;
                auto insertedFilename = insertedIndex << "fileName" << filename;
                auto inArray = insertedFilename << "data" << open_array;
                for (int j = 0; j < results.cols(); j++) {
                    inArray = inArray << results(i,j);
                }
                auto afterArray = inArray << close_array;
                bsoncxx::document::value doc = afterArray << finalize;
                docs.push_back(doc);
             } else {
                std::cout << marker_ids[i] << " has an unspecified index in db!\n";
             }
         } else {
            std::cout << marker_ids[i] << " not found in SNP db!\n";
         }
    }
    datas.insert_many(docs);
    datas.create_index(document{} << "fileName" << 1 << "index" << 1 << finalize);
    return true;
}