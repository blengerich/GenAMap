//
// Created by haohanwang on 1/24/16.
//

#include "Model.hpp"
#include "TreeLasso.hpp"

#include <stdexcept>
#include <unordered_map>
#include <Math/Math.hpp>
#include <JSON/JsonCoder.hpp>

using namespace Eigen;
using namespace std;

void Model::setX(const MatrixXd& m) { X = m; }

void Model::setY(const MatrixXd& n) { y = n; };

void Model::setAttributeMatrix(const string& str, MatrixXd* Z) {
    //throw runtime_error("This type of model has no attribute matrix with name " + str);
}

void Model::initBeta(void) {
    long c = X.cols();
    beta = VectorXd::Random(c);
}

void Model::initBeta(MatrixXd m) {
    long c = m.cols();
    beta = VectorXd::Random(c);
}

void Model::updateBeta(MatrixXd b) { beta = b; }

MatrixXd Model::getX(void) { return X; };

MatrixXd Model::getBeta(void) { return beta; };

MatrixXd Model::getY(void) { return y; };

MatrixXd Model::predict() { return X * beta; }

MatrixXd Model::predict(MatrixXd X) { return X * beta; };

double Model::cost() {return 0.5*(y-X*beta).squaredNorm()/y.rows();};

Model::Model() { };

Model::Model(MatrixXd X, VectorXd y) {
    setX(X);
    setY(y);
    initBeta();
}

Model::Model(const unordered_map<string, string>& opts) {}

MatrixXd Model::derivative() {
    return VectorXd::Random(1);
}

MatrixXd Model::proximal_derivative() {
    return VectorXd::Random(1);
}

MatrixXd Model::proximal_operator(MatrixXd xd, float d) {
    return VectorXd::Random(1);
}

clusteringResult Model::getClusteringResult() {
    Tree * t1 = Math::getInstance().hierarchicalClustering(beta);
    Tree * t2 = Math::getInstance().hierarchicalClustering(beta.transpose());
    MatrixXd tmp = MatrixXd::Zero(beta.rows(), beta.cols());
    queue<treeNode*> nodes;
    long count = -1;
    nodes.push(t1->getRoot());
    while (nodes.size()>0){
        treeNode * n = nodes.front();
        if (n->children.size()==0){
            tmp.col(++count) = beta.col(n->trait[0]);
        }
        else{
            for (unsigned int i=0; i<n->children.size();i++){
                nodes.push(n->children[i]);
            }
        }
        nodes.pop();
    }
    count = -1;
    beta = tmp;
    nodes.push(t2->getRoot());
    while (nodes.size()>0){
        treeNode * n = nodes.front();
        if (n->children.size()==0){
            tmp.row(++count) = beta.row(n->trait[0]);
        }
        else{
            for (unsigned int i=0; i<n->children.size();i++){
                nodes.push(n->children[i]);
            }
        }
        nodes.pop();
    }
    beta = tmp;
    clusteringResult cr;
    cr.colStr = JsonCoder::getInstance().encodeTraitTree(t1);
    cr.rowStr = JsonCoder::getInstance().encodeTraitTree(t2);
    return cr;
}
