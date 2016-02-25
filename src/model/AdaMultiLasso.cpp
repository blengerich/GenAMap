//
// Created by haohanwang on 2/24/16.
//

#include "AdaMultiLasso.hpp"

using namespace std;

AdaMultiLasso::AdaMultiLasso() {
    lambda1 = 0;
    lambda2 = 0;
}

void AdaMultiLasso::setLambda1(double d) {
    lambda1 = d;
}

void AdaMultiLasso::setLambda2(double d) {
    lambda2 = d;
}

void AdaMultiLasso::setSnpsFeature1(MatrixXd xd) {
    snpsFeature1 = xd;
}

void AdaMultiLasso::setSnpsFeature2(MatrixXd xd) {
    snpsFeature2 = xd;
}

MatrixXd AdaMultiLasso::getSnpsFeature1() {
    return snpsFeature1;
}

MatrixXd AdaMultiLasso::getSnpsFeature2() {
    return snpsFeature2;
}

VectorXd AdaMultiLasso::getW() {
    return w;
}

VectorXd AdaMultiLasso::getV() {
    return v;
}


VectorXd AdaMultiLasso::getTheta() {
    long c = snpsFeature1.cols();
    VectorXd theta = VectorXd::Zero(c);
    for (long j=0; j<c; j++){
        theta(j) = (snpsFeature1.col(j)*w).sum();
    }
    return theta;
}

VectorXd AdaMultiLasso::getRho() {
    long c = snpsFeature1.cols();
    VectorXd rho = VectorXd::Zero(c);
    for (long j=0; j<c; j++){
        rho(j) = (snpsFeature1.col(j)*v).sum();
    }
    return rho;
}

void AdaMultiLasso::setX(MatrixXd xd) {
    try {
        throw 20;
    }
    catch (int) {
        cerr << "TreeLasso does not support setX() and setY() individually, please use setXY instead";
    }
}

void AdaMultiLasso::setY(MatrixXd xd) {
    try {
        throw 20;
    }
    catch (int) {
        cerr << "TreeLasso does not support setX() and setY() individually, please use setXY instead";
    }
}

void AdaMultiLasso::setXY(MatrixXd m, MatrixXd n) {
    X = m;
    y = n;
    initBeta();
}

void AdaMultiLasso::initBeta() {
    long c = X.cols();
    long d = y.cols();
    beta = MatrixXd::Random(c, d);
}

double AdaMultiLasso::cost() {
    return 0.5*(y - X * beta).squaredNorm() + penalty_cost();
}

double AdaMultiLasso::penalty_cost() {
    long c = beta.rows();
    double result = 0;
    VectorXd theta = getTheta()*lambda1;
    VectorXd rho = getRho()*lambda2;
    for (long i=0;i<c;i++){
        result += theta(i)*beta.row(i).lpNorm<1>() + rho(i)*beta.row(i).norm();
    }
    return result;
}