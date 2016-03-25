//
// Created by haohanwang on 3/25/16.
//

#include "Model.h"

using namespace Eigen;

void Model::setX(SparseMatrix<double> m) { X = m; }

void Model::setY(SparseMatrix<double> n) { y = n; };

void Model::initBeta(void) {
    long c = X.cols();
    SparseVector<double> vec(c);
    beta = vec;
}

void Model::initBeta(SparseMatrix<double> m) {
    long c = m.cols();
    SparseVector<double> vec(c);
    beta = vec;
}

void Model::updateBeta(SparseMatrix<double> b) { beta = b; }

SparseMatrix<double> Model::getX(void) { return X; };

SparseMatrix<double> Model::getBeta(void) { return beta; };

SparseMatrix<double> Model::getY(void) { return y; };

SparseMatrix<double> Model::predict() { return X * beta; }

SparseMatrix<double> Model::predict(SparseMatrix<double> X) { return X * beta; };

double Model::cost() {return 0.5*(y-X*beta).squaredNorm()/y.rows();};

Model::Model() { };

SparseMatrix<double> Model::derivative() {
    SparseVector<double> vec(1);
    return vec;
}

SparseMatrix<double> Model::proximal_derivative() {
    SparseVector<double> vec(1);
    return vec;
}

SparseMatrix<double> Model::proximal_operator(SparseMatrix<double> xd, float d) {
    SparseVector<double> vec(1);
    return vec;
}
