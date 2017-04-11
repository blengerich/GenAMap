//
// Created by haohanwang on 1/24/16.
//

#include "FileIO.hpp"
#include <fstream>
#include <boost/algorithm/string/predicate.hpp>
#include <unordered_map>
#include <queue>


void FileIO::writeMatrixFile(string fileName, MatrixXf X) {
    ofstream file (fileName);
    file << X <<endl;
}

void FileIO::writeVectorFile(string fileName, VectorXf Y) {
    ofstream file (fileName);
    file << Y <<endl;
}

vector<string> FileIO::split(const string &text, string sep) {
    vector<string> tokens;
    size_t start = 0, end = 0;
    while ((end = text.find(sep, start)) != string::npos) {
        tokens.push_back(text.substr(start, end - start));
        start = end + 1;
    }
    tokens.push_back(text.substr(start));
    return tokens;
}

string FileIO::checkFileFormat(string fileName) {
    vector<string> sps = split(fileName, ".");
    string formatString = sps.back();
    locale loc;
    string r = "";
    for (string::size_type i = 0; i < formatString.length(); i++) {
        r = r + toupper(formatString[i], loc);
    }
    return r;
}

MatrixXf FileIO::readMatrixFile(string fileName) {
    string format = checkFileFormat(fileName);
    docInfo doc = countRowCol(fileName, format);
    MatrixXf X(doc.row, doc.col);
    ifstream infile;
    infile.open(fileName);
    string line;
    unsigned long rowIndex = 0;
    VectorXf row;
    while (getline(infile, line)){
        row = decodeLine(line, format, doc.col);
        X.row(rowIndex++) = row;
    }
    return X;
}

docInfo FileIO::countRowCol(string fileName, string format) {
    docInfo doc;
    doc.row = 0;
    doc.col = 0;
    const char *filename = fileName.c_str();
    ifstream infile;
    infile.open(filename);
    string line;
    while (getline(infile, line)) {
        ++doc.row;
        if (doc.row == 1){
            doc.col = countColumn(line, format);
        }
    }
    infile.close();
    return doc;
}

unsigned long FileIO::countColumn(string line, string format) {
    if (format.compare("CSV") == 0) {
        vector<string> values = split(line, ",");
        return values.size();
    }
    else if (format.compare("TSV") == 0) {
        unsigned long c = 0;
        float t;
        stringstream stream(line);
        while (!stream.eof()){
            stream >> t;
            ++c;
        }
        return c;
    }
    else{
        formatError();
        return 0;
    }
}

VectorXf FileIO::decodeLine(string line, string format, unsigned long col) {
    VectorXf row(col);
    if (format.compare("CSV") == 0) {
        vector<string> values = split(line, ",");
        for (int i=0; i<values.size();i++){
            row(i) = stod(values[i]);
        }
        return row;
    }
    else if (format.compare("TSV") == 0) {
        float t;
        int c = 0;
        stringstream stream(line);
        while (!stream.eof()){
            stream >> t;
            row(c++) = t;
        }
        return row;
    }
    else{
        formatError();
        return VectorXf::Random(col);
    }
}

void FileIO::formatError() {
    try {
        throw 20;
    }
    catch (int e) {
        cerr << "Unrecognized input file format, currently we only support the following formats:" << endl;
        cerr << formats << endl;
    }
}

Tree* FileIO::readTreeFile(string fileName) {
    // Each line has to be tab delimited, spaces are not accepted.
    // Root has to be represented by "root" (without "")
    ifstream infile;
    infile.open(fileName);
    string text;
    string line;
    bool parenthesis = false;
    bool flag = true;
    unordered_map<string, vector<treeNode*>> maps;
    vector<string> tmp;
    Tree* tree = new Tree();
    while (getline(infile, line)){
        if (flag){
            flag = false;
            if (boost::starts_with(line, "(")){
                parenthesis = true;
            }
            else{
                parenthesis = false;
            }
        }
        if (parenthesis){
            text += line;
            }
        else{
            tmp = split(line, "\t");
            if (boost::starts_with(tmp[0], "T")){
                int l = stoi(tmp[0].substr(1,tmp[0].size()-1));
                treeNode* node = tree->buildLeafNode(l);
                if (maps.count(tmp[1]) > 0){
                    vector<treeNode*> nodes = maps.at(tmp[1]);
                    maps.erase(tmp[1]);
                    nodes.push_back(node);
                    maps.insert({tmp[1], nodes});
                }
                else{
                    vector<treeNode*> nodes;
                    nodes.push_back(node);
                    maps.insert({tmp[1], nodes});
                }
            }
            else{
                if (tmp[0].compare("root")!=0){
                    vector<treeNode*> nodes = maps.at(tmp[0]);
                    treeNode* node = tree->buildParentFromChildren(nodes);
                    maps.erase(tmp[0]);
                    if (maps.count(tmp[1]) > 0){
                        vector<treeNode*> nodes = maps.at(tmp[1]);
                        maps.erase(tmp[1]);
                        nodes.push_back(node);
                        maps.insert({tmp[1], nodes});
                    }
                    else{
                        vector<treeNode*> nodes;
                        nodes.push_back(node);
                        maps.insert({tmp[1], nodes});
                    }
                }
            }
        }
    }
    if (parenthesis){
        delete tree;
        return readTreeFromParanthesis(text);
    }
    else{
        vector<treeNode*> nodes = maps.at("root");
        treeNode * root = tree->buildParentFromChildren(nodes);
        tree->setRoot(root);
        tree->setWeight();
        return tree;
    }
}

Tree* FileIO::readTreeFromParanthesis(string text) {
    Tree* tree = new Tree();
    unordered_map<int, vector<treeNode*>> maps;
    string str;
    unsigned long i = 0;
    int depth = 0;
    int maxDepth = 0;
    while (i<text.size()){
        str = getNextToken(i, text);
        if (str.compare("(") == 0){
            depth += 1;
            maxDepth = max(depth, maxDepth);
        }
        else if (str.compare(")") == 0){
            depth -= 1;
            vector<treeNode*> nodes = maps.at(depth+1);
            maps.erase(depth+1);
            treeNode * node = tree->buildParentFromChildren(nodes);
            if (maps.count(depth) > 0){
                vector<treeNode*> nodes = maps.at(depth);
                maps.erase(depth);
                nodes.push_back(node);
                maps.insert({depth, nodes});
            }
            else{
                vector<treeNode*> nodes;
                nodes.push_back(node);
                maps.insert({depth, nodes});
            }
        }
        else if (str.compare(",") == 0){
        }
        else{
            int l = stoi(str.substr(1,str.size()-1));
            treeNode* node = tree->buildLeafNode(l);
            if (maps.count(depth) > 0){
                vector<treeNode*> nodes = maps.at(depth);
                maps.erase(depth);
                nodes.push_back(node);
                maps.insert({depth, nodes});
            }
            else{
                vector<treeNode*> nodes;
                nodes.push_back(node);
                maps.insert({depth, nodes});
            }
        }
        i += str.size();
    }
    vector<treeNode*> nodes = maps.at(0);
    tree->setRoot(nodes[0]);
    tree->setWeight();
    return tree;
}

string FileIO::getNextToken(unsigned long i, string str) {
    if (str[i] == '('){
        return "(";
    }
    else if (str[i] == ')'){
        return ")";
    }
    else if (str[i] == ','){
        return ",";
    }
    else{
        unsigned long l=0;
        for (unsigned long j=i;j<str.size();j++){
            if (str[j] == ',' || str[j] == '(' || str[j] == ')'){
                break;
            }
            l += 1;
        }
        return str.substr(i, l);
    }
}

void FileIO::writeTreeFile(string fileName, Tree * tree) {
    struct parentTreeNode{
        string parent;
        treeNode* T;
    };
    string output = "";
    queue<parentTreeNode> nodes;
    int count = 1;
    treeNode * root = tree->getRoot();
    string name;
    for (int i=0; i<root->children.size(); i++){
        parentTreeNode ptn;
        ptn.parent = "root";
        ptn.T = root->children[i];
        nodes.push(ptn);
    }
    while (nodes.size()>0){
        parentTreeNode ptnp = nodes.front();
        if (ptnp.T->children.size()==0){
            name = "T"+to_string(ptnp.T->trait[0]);
            output = name+"\t"+ptnp.parent+"\n"+output;
        }
        else{
            name = "node"+to_string(count++);
            output = name+"\t"+ptnp.parent+"\n"+output;
            for (int i=0; i<ptnp.T->children.size();i++){
                parentTreeNode ptn;
                ptn.parent = name;
                ptn.T = ptnp.T->children[i];
                nodes.push(ptn);
            }
        }
        nodes.pop();
    }
    ofstream file (fileName);
    file << output;
}
