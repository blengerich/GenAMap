//
// Created by haohanwang on 1/24/16.
//

#include "Model.hpp"
#include <unordered_map>

using namespace Eigen;
using namespace std;

void Model::setX(const MatrixXd& m) { X = m; }

void Model::setY(const MatrixXd& n) { y = n; };

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

Model::Model(const unordered_map<string, string>& opts) {

}

MatrixXd Model::derivative() {
    return VectorXd::Random(1);
}

MatrixXd Model::proximal_derivative() {
    return VectorXd::Random(1);
}

MatrixXd Model::proximal_operator(MatrixXd xd, float d) {
    return VectorXd::Random(1);
}
