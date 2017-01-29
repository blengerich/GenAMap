//
// Created by haohanwang on 1/26/16.
//

#ifndef ALGORITHMS_JSONCODER_HPP
#define ALGORITHMS_JSONCODER_HPP

#include <string>
#include <Eigen/Dense>
#include <unordered_map>

#ifdef BAZEL
#include "json.h"
#include "../IO/DataBaseCommunicator.hpp"
#include "../Math/Math.hpp"
#include <queue>
#include <sstream>
#else
#include "json.h"
#include "../IO/DataBaseCommunicator.hpp"
#include "../Math/Math.hpp"
#include <queue>
#include <sstream>
#endif

using namespace std;
using namespace Eigen;

struct mainMessage{
    int command;
    string detailedMessage;
};

struct jobOrder{
    int jobID;
    unordered_map<string, float> parameters;
};

class JsonCoder {
private:
    Json::StyledWriter writer;
    JsonCoder() {};
    JsonCoder(JsonCoder const &);  // don't implement
    void operator=(JsonCoder const &); // don't implement

    Json::Value decodeStr(string);
    string long2string(long);
    Json::Value node2json(vector<treeNode*>, int, MatrixXd);
    Json::Value node2json(vector<treeNode*>, int);

public:
    static JsonCoder &getInstance() {
        static JsonCoder instance;
        return instance;
    }

    string encodeMainMessage(mainMessage);
    string encodeMatrix(MatrixXd);
    string encodeResultPack(result_pack);
    string encodeProgressPack(progress_pack);
    string encodeTraitTreeEffectsizes(Tree*, MatrixXd);
    string encodeTraitTree(Tree*);
    Json::Value encodeVector(MatrixXd);

    mainMessage decodeMainMessage(string);
    jobOrder decodeJobOrder(string);
    job_pack decodeJobPack(string);
    data_pack decodeDataPack(string);
    user_info decodeUserInfo(string);
    organization_info decodeOrganizationInfo(string);
};


#endif //ALGORITHMS_JSONCODER_HPP
