//
// Created by haohanwang on 1/26/16.
//

#ifdef BAZEL
#include "json/JsonCoder.hpp"
#else
#include "JsonCoder.hpp"
#endif

string JsonCoder::encodeMainMessage(mainMessage m) {
    Json::Value root;
    root["c"] = m.command;
    root["d"] = m.detailedMessage;
    return writer.write(root);
}

string JsonCoder::encodeMatrix(const MatrixXd& X) {
    Json::Value root;
    unsigned int r = X.rows();
    unsigned int c = X.cols();
    root["r"] = r;
    root["c"] = c;
    string v = "";
    for (unsigned int i=0; i<r; i++){
        for (unsigned int j=0; j<c-1;j++){
            v+=to_string(float(X(i,j)))+",";
        }
        v+=to_string(float(X(i,c-1)))+";";
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

string JsonCoder::encodeTraitTreeEffectsizes(Tree *tree, MatrixXd matrix) {
    Json::Value root;
    treeNode * rt = tree->getRoot();
    int count = 0;
    string tmp = "root ";
    root["id"] = tmp + to_string(count);
    root["children"] = node2json(rt->children, count, matrix);
    return writer.write(root);
}

string JsonCoder::long2string(long i1) {
    std::string number;
    std::stringstream strstream;
    strstream << i1;
    strstream >> number;
    return number;
}

Json::Value JsonCoder::node2json(vector<treeNode *> children, int count, MatrixXd matrix) {
    Json::Value root;
    string tmp = "child ";
    string tmp2 = "node ";
    string tmp3 = "leaf";
    int count2 = count + children.size();
    for (unsigned int i=0;i<children.size(); i++){
        if (children[i]->children.size()>0){
            root["id"] = tmp2 + to_string(++count);
            root[tmp+to_string(i+1)] = node2json(children[i]->children, count2, matrix);
        }
        else{
            root["id"] = tmp3 + long2string(children[i]->trait[0]);
            root["value"] = encodeVector(matrix.col(children[i]->trait[0]));
        }
    }
    return root;
}

Json::Value JsonCoder::encodeVector(MatrixXd X) {
    Json::Value root;
    double r = X.rows();
    string v = "";
    for (int j=0; j<r-1;j++){
        v+=to_string(X(j,0))+",";
    }
    root["v"]=v;
    return root;
}

string JsonCoder::encodeTraitTree(Tree *tree) {
    int count = 0;
    Json::Value root;
    treeNode * rt = tree->getRoot();
    root["name"] = "root";
    root["children"] = node2json(rt->children, count);
    return writer.write(root);
}

Json::Value JsonCoder::node2json(vector<treeNode *> children, int count){
    int count2 = count + children.size();
    Json::Value vec(Json::arrayValue);
    for (unsigned int i=0;i<children.size(); i++){
        Json::Value root;
        if (children[i]->children.size()>0){
            root["name"] = "node" + to_string(++count);
            root["children"] = node2json(children[i]->children, count2);
            vec.append(root);
        }
        else{
            root["name"] = "trait: " + long2string(children[i]->trait[0]);
            vec.append(root);
        }
    }
    return vec;
}
