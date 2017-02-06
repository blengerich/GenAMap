//
// Created by haohanwang on 1/24/16.
//

#include "TreeLasso.hpp"
#include <iostream>
#include <limits>
#include <stack>
#include <stdexcept>
#include <queue>

using namespace std;
using namespace Eigen;


void TreeLasso::setX(MatrixXf x) {
    try {
        throw 20;
    }
    catch (int) {
        cerr << "TreeLasso does not support setX() and setY() individually, please use setXY instead";
    }
}

void TreeLasso::setY(MatrixXf x) {
    try {
        throw 20;
    }
    catch (int) {
        cerr << "TreeLasso does not support setX() and setY() individually, please use setXY instead";
    }
}

void TreeLasso::setTree(Tree *tree) {
    T = tree;
    setWeight();
}

void TreeLasso::setXY(MatrixXf m, MatrixXf n) {
    X = m;
    y = n;
    initBeta();
}

void TreeLasso::assertReadyToRun() {
    if (!((X.rows() > 0) && (X.rows() == y.rows())
          && (X.cols() > 0) && (y.cols() > 0))) {
        throw runtime_error("X and Y matrices of size (" + to_string(X.rows()) + "," + to_string(X.cols()) + "), and (" +
                            to_string(y.rows()) + "," + to_string(y.cols()) + ") are not compatible.");
    }
}

void TreeLasso::initIterativeUpdate(){
    XX = X.transpose()*X;
}

void TreeLasso::setLambda(double d){
    lambda = d;
}

void TreeLasso::initBeta() {
    long c = X.cols();
    long d = y.cols();
    beta = MatrixXf::Zero(c, d);
}

void TreeLasso::hierarchicalClustering() {
    long n = y.cols();
    MatrixXf weights = MatrixXf::Zero(n, n);
    T = new Tree();
    unordered_map<long, treeNode *> maps;
    for (long i = 0; i < n; i++) {
        treeNode *t = T->buildLeafNode(i);
        maps.insert({i, t});
        weights.row(i) = (y.colwise() - y.col(i)).colwise().squaredNorm();
    }
    minXY xy;
    while (maps.size() > 1) {
        xy = searchMin(weights);
        treeNode *t1 = maps.at(xy.x);
        treeNode *t2 = maps.at(xy.y);
        vector<treeNode *> tv;
        tv.push_back(t1);
        tv.push_back(t2);
        treeNode *p = T->buildParentFromChildren(tv);
        maps.insert({maps.size(), p});
        weights = appendColRow(weights, xy);
        removeColRow(&weights, xy);
        updateMap(&maps, xy);
    }
    treeNode *root = maps.at(0);
    T->setRoot(root);
    setWeight();
}

void TreeLasso::removeColRow(MatrixXf *mptr, minXY xy) {
    removeRow(mptr, xy.y);
    removeRow(mptr, xy.x);
    removeCol(mptr, xy.y);
    removeCol(mptr, xy.x);
}

void TreeLasso::removeRow(MatrixXf *mptr, long x) {
    long numRows = mptr->rows() - 1;
    long numCols = mptr->cols();

    if (x < numRows)
        mptr->block(x, 0, numRows - x, numCols) = mptr->block(x + 1, 0, numRows - x, numCols);

    mptr->conservativeResize(numRows, numCols);
}

void TreeLasso::removeCol(MatrixXf *mptr, long y) {
    long numRows = mptr->rows();
    long numCols = mptr->cols() - 1;

    if (y < numCols)
        mptr->block(0, y, numRows, numCols - y) = mptr->block(0, y + 1, numRows, numCols - y);

    mptr->conservativeResize(numRows, numCols);
}

void TreeLasso::updateMap(unordered_map<long, treeNode *> *mptr, minXY xy) {
    long n = mptr->size();
    mptr->erase(xy.x);
    mptr->erase(xy.y);
    long k;
    treeNode *t;
    for (long i = xy.x + 1; i < n; i++) {
        if (i != xy.y) {
            t = mptr->at(i);
            if (i < xy.y) {
                k = i - 1;
            }
            else if (i > xy.y) {
                k = i - 2;
            }
            mptr->erase(i);
            mptr->insert({k, t});
        }
    }
}

MatrixXf TreeLasso::appendColRow(MatrixXf mat, minXY xy) {
    long r = mat.rows();
    MatrixXf result = MatrixXf::Zero(r + 1, r + 1);
    VectorXf col = VectorXf::Zero(r);
    if (clusteringMethod.compare("average") == 0) {
        col = (mat.col(xy.x) + mat.col(xy.y)) / 2;
    }
    else if (clusteringMethod.compare("complete") == 0) {
        col = ((mat.col(xy.x).array()).max(mat.col(xy.y).array())).matrix();
    }
    else {
        col = ((mat.col(xy.x).array()).min(mat.col(xy.y).array())).matrix();
    }
    result.block(0, 0, r, r) = mat;
    result.block(0, r, r, 1) = col;
    result.block(r, 0, 1, r) = col.transpose();
    return result;
}

minXY TreeLasso::searchMin(MatrixXf m) {
    long r = m.rows();
    minXY xy;
    xy.x = 0;
    xy.y = 0;
    double tmpV = numeric_limits<double>::max();
    for (long i = 0; i < r; i++) {
        for (long j = i + 1; j < r; j++) {
            if (m(i, j) < tmpV) {
                tmpV = m(i, j);
                xy.x = i;
                xy.y = j;
            }
        }
    }
    return xy;
}

void TreeLasso::setClusteringMethod(string str) {
    clusteringMethod = str;
}

void TreeLasso::setThreshold(double thred) {
    threshold = thred;
}

TreeLasso::TreeLasso() {
    lambda = default_lambda;
    clusteringMethod = default_clustering_method;
    threshold = default_threshold;
    mu = default_mu;
    T = 0;
    initGradientFlag = false;
}

TreeLasso::TreeLasso(const unordered_map<string, string> &options) {
    try {
        lambda = stod(options.at("lambda"));
    }
    catch (const std::out_of_range& oor) {
        lambda = default_lambda;
    }
    try {
        clusteringMethod = options.at("clusteringMethod");
    } catch (const std::out_of_range& oor) {
        clusteringMethod = default_clustering_method;
    }
    try {
        threshold = stod(options.at("threshold"));
    } catch (const std::out_of_range& oor) {
        threshold = default_threshold;    
    }
    try {
        mu = stod(options.at("mu"));
    } catch (const std::out_of_range& oor) {
        mu = default_mu;
    }
    T = 0;
    initGradientFlag = false;
}

TreeLasso::~TreeLasso() {
    delete T;
}

void TreeLasso::setWeight() {
    T->setWeight();
    penaltyWeights();
    prune();
    initMatrixD();
}

Tree *TreeLasso::getTree() {
    return T;
}

double TreeLasso::cost() {
    return 0.5*(y - X * beta).squaredNorm() + penalty_cost();
}

//double TreeLasso::penalty_cost(){
//    queue<treeNode*> nodes;
//    treeNode * root = T->getRoot();
//    nodes.push(root);
//    double r = 0.0;
//    while (nodes.size()>0){
//        treeNode* n = nodes.front();
//        if (n->children.size()==0){
//            r += n->weight*l1NormIndex(n->trait);
//        }
//        else{
//            r += n->weight*l2NormIndex(n->trait);
//            for (int i=0; i<n->children.size();i++){
//                nodes.push(n->children[i]);
//            }
//        }
//        nodes.pop();
//    }
//    return r;
//}

double TreeLasso::penalty_cost() {
    initGradientUpdate();
    MatrixXf A = C*beta.transpose();
    long c = A.cols();
    double s = 0;
    long v = gIdx.rows();
    for (long i = 0;i<v;i++){
        VectorXf tmp = VectorXf::Zero(c);
        for (long j=gIdx(i,0)-1;j<gIdx(i,1);j++){
            tmp += A.row(j).array().square().matrix();
        }
        tmp = tmp.array().sqrt().matrix();
        s += tmp.sum();
    }
    return s;
}

double TreeLasso::l1NormIndex(vector<long> traits) {
    double r = 0;
    for (unsigned long i=0; i<traits.size(); i++){
        r += beta.col(traits[i]).lpNorm<1>();
    }
    return r;
}

double TreeLasso::l2NormIndex(vector<long> traits) {
    double r = 0;
    for (unsigned long i=0;i<traits.size();i++){
        r += beta.col(traits[i]).norm();
    }
    return r;
}

double TreeLasso::l2NormIndexIndex(long j, vector<long> traits) {
    double r = 0;
    for (unsigned long i=0;i<traits.size();i++){
        r += beta.row(j).col(traits[i]).norm();
    }
    return r;
}

void TreeLasso::prune() {
    queue<treeNode*> nodes;
    nodes.push(T->getRoot());
    while (nodes.size()>0){
        treeNode* n = nodes.front();
        if (n->s>threshold){
            n->weight = 0;
        }
        if (n->children.size()>0){
            for (unsigned int i=0; i<n->children.size(); i++){
                nodes.push(n->children[i]);
            }
        }
        nodes.pop();
    }
}

void TreeLasso::penaltyWeights() {
    queue<treeNode*> nodes;
    treeNode * root = T->getRoot();
    nodes.push(root);
    root->weight = (1 - root->s);
    while (nodes.size()>0){
        treeNode * n = nodes.front();
        if (n->children.size()==0){
        }
        else{
            for (unsigned int i=0; i<n->children.size();i++){
                n->children[i]->weight = n->s*(1-n->children[i]->s);
                nodes.push(n->children[i]);
            }
        }
        nodes.pop();
    }
}

long TreeLasso::countNodes(){
    queue<treeNode*> nodes;
    long count = 1;
    nodes.push(T->getRoot());
    while (nodes.size()>0){
        treeNode * n = nodes.front();
        if (n->children.size()==0){
        }
        else{
            for (unsigned int i=0; i<n->children.size();i++){
                nodes.push(n->children[i]);
                count ++ ;
            }
        }
        nodes.pop();
    }
    return count;
}

long TreeLasso::countNoneZeroNodes() {
    queue<treeNode*> nodes;
    long count = 0;
    nodes.push(T->getRoot());
    while (nodes.size()>0){
        treeNode * n = nodes.front();
        if (n->children.size()==0){
        }
        else{
            for (unsigned int i=0; i<n->children.size();i++){
                nodes.push(n->children[i]);
            }
        }
        if (n->weight>0){
            count ++ ;
        }
        nodes.pop();
    }
    return count;
}

void TreeLasso::initMatrixD() {
    long c = X.cols();
    long d = countNodes();
    mD = MatrixXf::Zero(c, d);
    mD_ = MatrixXf::Zero(c, d);
}

void TreeLasso::updateMD() {
    long index=0;
    unsigned long c = X.cols();
    queue<treeNode*> nodes;
    nodes.push(T->getRoot());
    double denominator = updateMD_denominator();
    while (nodes.size()>0){
        treeNode * n = nodes.front();
        for (unsigned long j=0; j<c; j++){
//            mD(j, index) = l2NormIndexIndex(j, n->trait)*n->weight/denominator;
            mD_(j, index) = denominator*n->weight/l2NormIndexIndex(j, n->trait);
        }
        if (n->children.size()==0){
        }
        else{
            for (unsigned int i=0; i<n->children.size(); i++){
                nodes.push(n->children[i]);
            }
        }
        nodes.pop();
        index+=1;
    }
}

double TreeLasso::updateMD_denominator() {
    double r = 0;
    queue<treeNode*> nodes;
    nodes.push(T->getRoot());
    while (nodes.size()>0){
        treeNode * n = nodes.front();
        r += n->weight*l2NormIndex(n->trait);
        if (n->children.size()==0){
        }
        else{
            for (unsigned int i=0; i<n->children.size(); i++){
                nodes.push(n->children[i]);
            }
        }
        nodes.pop();
    }
    return r;
}


void TreeLasso::updateBeta() {
    unsigned long k = beta.cols();
    unsigned long n = XX.rows();
    MatrixXf D = MatrixXf::Zero(n, n);
    for (unsigned long i=0; i<n; i++){
        D(i,i) = mD_.row(i).sum();
    }
    MatrixXf xxdx = ((XX+lambda * D).inverse())*X.transpose();
    for (unsigned long j=0; j<k; j++){
        beta.col(j) = xxdx*y.col(j);
    }
}

void TreeLasso::updateBeta(MatrixXf b) {
    beta = b;
}

void TreeLasso::initGradientUpdate() {
    if (!initGradientFlag){
        initGradientFlag = true;
        long nodeNum = countNoneZeroNodes();
        long c = T->getRoot()->trait.size();
        long r = nodeNum - c;
        mT = MatrixXf::Zero(r, c);
        mTw = MatrixXf::Zero(r, 1);
        gIdx = MatrixXi::Zero(r, 3);
        gIdx(0,0) = 1;
        long index = r-1;
        queue<treeNode*> nodes;
        stack<double> Cweights;
        stack<long> Cindex;
        nodes.push(T->getRoot());
        while (nodes.size()>0){
            treeNode* node = nodes.front();
            if (node->children.size()>0){
                if (node->weight!=0){
                    mTw(index, 0) = node->weight;
                    for (unsigned long j=0; j<node->trait.size(); j++){
                        mT(index, node->trait.at(j)) = 1;
                        Cweights.push(node->weight);
                        Cindex.push(node->trait.at(j));
                    }
                    index--;
                }
                for (unsigned long i=0; i<node->children.size(); i++){
                    nodes.push(node->children[i]);
                }
            }
            nodes.pop();
        }

        C = MatrixXf::Zero(Cweights.size(), c);
        long tmpIndex = 0;
        while (Cindex.size()!=0){
            C(tmpIndex, Cindex.top()) = Cweights.top();
            Cindex.pop();
            Cweights.pop();
            tmpIndex+=1;
        }
        for (long i=0;i<r;i++){
            int s =  (int)mT.row(i).sum();
            gIdx(i, 1) = gIdx(i, 0) + s - 1;
            gIdx(i, 2) = s;
            if (i+1<r){
                gIdx(i+1, 0) = gIdx(i, 1) + 1;
            }
        }

        VectorXf tau = VectorXf::Zero(c);
        for (long i=0; i<r;i++){
            tau += mT.row(i)*(mTw(i,0)*mTw(i,0));
        }

        tauNorm = tau.maxCoeff();

        double L1 = ((X.transpose()*X).eigenvalues()).real().maxCoeff();
        L = L1 + lambda*lambda*tauNorm/mu;

        XY = X.transpose()*y;
    }
}

MatrixXf TreeLasso::proximal_operator(MatrixXf in, float l) {
    MatrixXf sign = ((in.array()>0).matrix()).cast<double>();//sign
    sign += -1.0*((in.array()<0).matrix()).cast<double>();
    in = ((in.array().abs()-l*lambda/L).max(0)).matrix();//proximal
    return (in.array()*sign.array()).matrix();//proximal multipled back with sign
}

double TreeLasso::getL() {
    return L;
}

MatrixXf TreeLasso::proximal_derivative() {
    MatrixXf A = C*beta.transpose()/mu;
    long r = A.rows();
    long c = A.cols();
    MatrixXf R = MatrixXf::Zero(r, c);
    long v = gIdx.rows();
    for (long i = 0;i<v;i++){
        VectorXf tmp = VectorXf::Zero(c);
        for (long j=gIdx(i,0)-1;j<gIdx(i,1);j++){
            tmp += A.row(j).array().square().matrix();
        }
        tmp = tmp.array().sqrt().matrix();
        for (long j=0;j<tmp.rows();j++){
            if (tmp(j) < 1) {tmp(j) = 1;}
        }
        for (long j=gIdx(i,0)-1;j<gIdx(i,1);j++){
            R.row(j) = (A.row(j).array()/(tmp.transpose()).array()).matrix();
        }
    }
    return X.transpose()*(X*beta)-XY+R.transpose()*C;
}

void TreeLasso::setMu(double m) {
    mu = m;
}

