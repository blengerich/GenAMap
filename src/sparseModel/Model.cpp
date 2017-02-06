//
// Created by haohanwang on 3/25/16.
//

#include "Model.h"

using namespace Eigen;

void Model::setX(SparseMatrix<float> m) { X = m; }

void Model::setY(SparseMatrix<float> n) { y = n; };

void Model::initBeta(void) {
    long c = X.cols();
    SparseVector<float> vec(c);
    beta = vec;
}

void Model::initBeta(SparseMatrix<float> m) {
    long c = m.cols();
    SparseVector<float> vec(c);
    beta = vec;
}

void Model::updateBeta(SparseMatrix<float> b) { beta = b; }

SparseMatrix<float> Model::getX(void) { return X; };

SparseMatrix<float> Model::getBeta(void) { return beta; };

SparseMatrix<float> Model::getY(void) { return y; };

SparseMatrix<float> Model::predict() { return X * beta; }

SparseMatrix<float> Model::predict(SparseMatrix<float> X) { return X * beta; };

float Model::cost() {return 0.5*(y-X*beta).squaredNorm()/y.rows();};

Model::Model() { };

SparseMatrix<float> Model::derivative() {
    SparseVector<float> vec(1);
    return vec;
}

SparseMatrix<float> Model::proximal_derivative() {
    SparseVector<float> vec(1);
    return vec;
}

SparseMatrix<float> Model::proximal_operator(SparseMatrix<float> xd, float d) {
    SparseVector<float> vec(1);
    return vec;
}
