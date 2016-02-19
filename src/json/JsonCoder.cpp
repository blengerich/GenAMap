//
// Created by haohanwang on 1/26/16.
//

#include "json/JsonCoder.hpp"

string JsonCoder::encodeMainMessage(mainMessage m) {
    Json::Value root;
    root["c"] = m.command;
    root["d"] = m.detailedMessage;
    return writer.write(root);
}

string JsonCoder::encodeMatrix(MatrixXd X) {
    Json::Value root;
    double r = X.rows();
    double c = X.cols();
    root["r"] = r;
    root["c"] = c;
    string v = "";
    for (int i=0; i<r; i++){
        for (int j=0; j<c-1;j++){
            v+=to_string(X(i,j))+",";
        }
        v+=to_string(X(i,c-1))+";";
    }
    root["v"]=v;
    return writer.write(root);
}

string JsonCoder::encodeResultPack(result_pack rp) {
    Json::Value root;
    root["id"] = rp.result_id;
    root["job"] = rp.job_id;
    root["path"] = rp.path;
    return writer.write(root);
}

string JsonCoder::encodeProgressPack(progress_pack pp) {
    Json::Value root;
    root["job"] = pp.job_id;
    root["prog"] = pp.progress;
    return writer.write(root);
}

Json::Value JsonCoder::decodeStr(string str) {
    char * m = new char[str.size() + 1];
    copy(str.begin(), str.end(), m);
    m[str.size()] = '\0';

    Json::Value root;
    Json::Reader reader;
    bool parsedSuccess = reader.parse(m, root, false);
    if (parsedSuccess < 0) throw std::runtime_error( "Parsing Json String Error" );
    return root;
}

mainMessage JsonCoder::decodeMainMessage(string str) {
    Json::Value root = decodeStr(str);
    mainMessage mm;
    mm.command = stoi(root["c"].asString());
    mm.detailedMessage = root["d"].asString();
    return mm;
}

jobOrder JsonCoder::decodeJobOrder(string str) {
    Json::Value root = decodeStr(str);
    jobOrder jo;
    jo.jobID = -1;
    unordered_map<string, float> um;
    string key;
    for (Json::ValueIterator itr = root.begin() ; itr != root.end() ; itr++){
        key = itr.key().asString();
        if (key.compare("job")==0){
            jo.jobID = stoi((*itr).asString());
        }
        else{
            um.insert({key, stof((*itr).asString())});
        }
    }
    jo.parameters = um;
    return jo;
}

job_pack JsonCoder::decodeJobPack(string str) {
    Json::Value root = decodeStr(str);
    job_pack jp;
    jp.job_id = stoi(root["id"].asString());
    jp.model_name = root["model"].asString();
    jp.algorithm_name = root["algorithm"].asString();
    jp.email = root["email"].asString();
    return jp;
}

data_pack JsonCoder::decodeDataPack(string str) {
    Json::Value root = decodeStr(str);
    data_pack dp;
    dp.data_id = stoi(root["id"].asString());
    dp.data_type = stoi(root["type"].asString());
    dp.path = root["path"].asString();
    dp.email = root["email"].asString();
    return dp;
}

user_info JsonCoder::decodeUserInfo(string str) {
    Json::Value root = decodeStr(str);
    user_info ui;
    ui.email = root["email"].asString();
    ui.password = root["password"].asString();
    ui.name = root["name"].asString();
    ui.organization = stoi(root["organization"].asString());
    return ui;
}

organization_info JsonCoder::decodeOrganizationInfo(string str) {
    Json::Value root = decodeStr(str);
    organization_info oi;
    oi.id = stoi(root["id"].asString());
    oi.name = root["name"].asString();
    return oi;
}
