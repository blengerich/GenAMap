//
// Created by haohanwang on 1/24/16.
//

#include "Model.hpp"

using namespace Eigen;

void Model::setX(MatrixXd m) { X = m; initBeta();}

void Model::setY(VectorXd n) { y = n; };

void Model::initBeta(void) {
    int c = X.cols();
    beta = VectorXd::Random(c);
}

void Model::initBeta(MatrixXd m) {
    int c = m.cols();
    beta = VectorXd::Random(c);
}

void Model::updateBeta(VectorXd b) { beta = b; }

MatrixXd Model::getX(void) { return X; };

MatrixXd Model::getBeta(void) { return beta; };

VectorXd Model::getY(void) { return y; };

VectorXd Model::predict() { return X * beta; }

VectorXd Model::predict(MatrixXd X) { return X * beta; };

double Model::cost() {return 0.0;};

Model::Model() { };

Model::Model(MatrixXd X, VectorXd y) {
    setX(X);
    setY(y);
    initBeta();
}

VectorXd Model::derivative() {
    return VectorXd::Random(1);
}

VectorXd Model::proximal_derivative() {
    return VectorXd::Random(1);
}

VectorXd Model::proximal_operator(VectorXd xd, float d) {
    return VectorXd::Random(1);
}
