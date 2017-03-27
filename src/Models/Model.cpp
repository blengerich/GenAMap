//
// Created by haohanwang on 1/24/16.
//

#include "Model.hpp"

#include <stdexcept>
#include <unordered_map>

#ifdef BAZEL
#include "Math/Math.hpp"
#include "JSON/JsonCoder.hpp"
#else
#include "../Math/Math.hpp"
#include "../JSON/JsonCoder.hpp"
#endif

using namespace Eigen;
using namespace std;

void Model::setX(const MatrixXf& m) { X = m; }

void Model::setY(const MatrixXf& n) { y = n; };

void Model::setAttributeMatrix(const string& str, MatrixXf* Z) {
    //throw runtime_error("This type of model has no attribute matrix with name " + str);
}

void Model::initBeta(void) {
    long c = X.cols();
    beta = VectorXf::Random(c);
}

void Model::initBeta(MatrixXf m) {
    long c = m.cols();
    beta = VectorXf::Random(c);
}

void Model::updateBeta(MatrixXf b) { beta = b; }

MatrixXf Model::getX(void) { return X; };

MatrixXf Model::getBeta(void) { return beta; };

MatrixXf Model::getY(void) { return y; };

MatrixXf Model::predict() { return X * beta; }

MatrixXf Model::predict(MatrixXf X) { return X * beta; };

float Model::cost() {return 0.5*(y-X*beta).squaredNorm()/y.rows();};

Model::Model() { };

Model::Model(MatrixXf X, VectorXf y) {
    setX(X);
    setY(y);
    initBeta();
}

Model::Model(const unordered_map<string, string>& opts) {}

MatrixXf Model::derivative() {
    return VectorXf::Random(1);
}

MatrixXf Model::proximal_derivative() {
    return VectorXf::Random(1);
}

MatrixXf Model::proximal_operator(MatrixXf xd, float d) {
    return VectorXf::Random(1);
}

modelResult Model::getClusteringResult() {
    MatrixXf B = this->getBeta();
    Tree * t1 = Math::getInstance().hierarchicalClustering(B);
    Tree * t2 = Math::getInstance().hierarchicalClustering(B.transpose());
    MatrixXf tmp = MatrixXf::Zero(B.rows(), B.cols());
    queue<treeNode*> nodes;
    long count = -1;
    nodes.push(t1->getRoot());
    while (nodes.size()>0){
        treeNode * n = nodes.front();
        if (n->children.size()==0){
            tmp.col(++count) = B.col(n->trait[0]);
        }
        else{
            for (unsigned int i=0; i<n->children.size();i++){
                nodes.push(n->children[i]);
            }
        }
        nodes.pop();
    }
    count = -1;
    B = tmp;
    nodes.push(t2->getRoot());
    while (nodes.size()>0){
        treeNode * n = nodes.front();
        if (n->children.size()==0){
            tmp.row(++count) = B.row(n->trait[0]);
        }
        else{
            for (unsigned int i=0; i<n->children.size();i++){
                nodes.push(n->children[i]);
            }
        }
        nodes.pop();
    }
    B = tmp;
    modelResult cr;
    cr.colStr = JsonCoder::getInstance().encodeTraitTree(t1);
    cr.rowStr = JsonCoder::getInstance().encodeTraitTree(t2);
    cr.beta = B;
    return cr;
}

void Model::checkLogisticRegression() {
    logisticFlag = true;
    long n = y.rows();
    long k = y.cols();
    for (long i=0;i<n&&logisticFlag;i++){
        for (long j=0;j<k&&logisticFlag;j++){
            if (y(i,j)!=0 and y(i,j)!=1){
                logisticFlag = false;
            }
        }
    }
// logisticFlag = (y-y.cwiseProduct(y)).sum() == 0;
// a potential faster way of calculating logisticFlag, depends on how often we met logistic regression data
}