//
// Created by haohanwang on 2/24/16.
//

#include "AdaMultiLasso.hpp"

using namespace std;

AdaMultiLasso::AdaMultiLasso() {
    lambda1 = 0;
    lambda2 = 0;
    initTrainingFlag = false;
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


VectorXd AdaMultiLasso::gradient_w() {
    return NULL;
}

VectorXd AdaMultiLasso::gradient_v() {
    return NULL;
}

void AdaMultiLasso::updateTheta() {
    long c = snpsFeature1.cols();
    theta = VectorXd::Zero(c);
    for (long j=0; j<c; j++){
        theta(j) = (snpsFeature1.col(j)*w).sum();
    }
}

void AdaMultiLasso::updateRho() {
    long c = snpsFeature2.cols();
    rho = VectorXd::Zero(c);
    for (long j=0; j<c; j++){
        rho(j) = (snpsFeature2.col(j)*v).sum();
    }
}

VectorXd AdaMultiLasso::projection(VectorXd in) {
    return NULL;
}

void AdaMultiLasso::initTheta() {
    w = VectorXd::Zero(snpsFeature1.rows());
    long c = snpsFeature1.cols();
    theta = VectorXd::Zero(c);
    for (long j=0; j<c; j++){
        theta(j) = (snpsFeature1.col(j)*w).sum();
    }
}

void AdaMultiLasso::initRho() {
    v = VectorXd::Zero(snpsFeature2.rows());
    long c = snpsFeature2.cols();
    rho = VectorXd::Zero(c);
    for (long j=0; j<c; j++){
        rho(j) = (snpsFeature2.col(j)*v).sum();
    }
}



VectorXd AdaMultiLasso::getTheta() {
    long c = theta.size();
    long rc = c/taskNum;
    VectorXd tmp = VectorXd::Zero(rc);
    for (long i=0;i<rc;i++){
        tmp(i) = theta(i*taskNum);
    }
    return tmp;
}

VectorXd AdaMultiLasso::getRho() {
    long c = rho.size();
    long rc = c/taskNum;
    VectorXd tmp = VectorXd::Zero(rc);
    for (long i=0;i<rc;i++){
        tmp(i) = rho(i*taskNum);
    }
    return tmp;
}


VectorXd AdaMultiLasso::getTheta_formatted() {
    return theta;
}

VectorXd AdaMultiLasso::getRho_formatted() {
    return rho;
}


MatrixXd AdaMultiLasso::getBeta() {
    long r = beta.rows()/taskNum;
    long c = taskNum;
    MatrixXd tmp = MatrixXd::Zero(r, c);
    for (long i=0;i<r;i++){
        for (long j=0;j<c;j++){
            tmp(i,j) = beta(i*taskNum+j, 0);
        }
    }
    return tmp;
}

MatrixXd AdaMultiLasso::getBeta_formatted() {
    return beta;
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
}

void AdaMultiLasso::initBeta() {
    long c = X.cols();
    long d = y.cols();
    beta = MatrixXd::Random(c, d);
}

double AdaMultiLasso::cost() {
    initTraining();
    return 0.5*(y - X * beta).squaredNorm() + penalty_cost();
}

double AdaMultiLasso::penalty_cost() {
    MatrixXd rb = getBeta();
    long c = rb.rows();
    double result = 0;
    VectorXd theta = getTheta()*lambda1;
    VectorXd rho = getRho()*lambda2;
    for (long i=0;i<c;i++){
        result += theta(i)*rb.row(i).lpNorm<1>() + rho(i)*rb.row(i).norm();
    }
    return result;
}


void AdaMultiLasso::initTraining() {
    if (!initTrainingFlag){
        initTrainingFlag = true;
        // resize X and Y for single task
        initTheta();
        initRho();
        long n = X.rows();
        long c = X.cols();
        taskNum = y.cols();
        MatrixXd tmpX = MatrixXd::Zero(n*taskNum, c*taskNum);
        MatrixXd tmpY = MatrixXd::Zero(n*taskNum, 1);
        VectorXd tmpT = VectorXd::Zero(c*taskNum);
        VectorXd tmpR = VectorXd::Zero(c*taskNum);
        for (long i=0;i<n;i++){
            for (long j=0;j<taskNum;j++){
                for (long k=0;k<c;k++){
                    tmpX(i*taskNum+j, k*taskNum+j) = X(i, k);
                }
                tmpY(i*taskNum+j, 0) = y(i, j);
                tmpT(i*taskNum+j) = theta(i);
                tmpR(i*taskNum+j) = rho(i);
            }
        }
        X = tmpX;
        y = tmpY;
        theta = tmpT;
        rho = tmpR;
        initBeta();
        initC();
        L = ((X.transpose()*X).eigenvalues()).real().maxCoeff() + C.norm()/mu;
    }
}

void AdaMultiLasso::initC() {
    long c = X.cols();
    C = MatrixXd::Zero(c * taskNum, c);
    for (long i = 0; i < c; i++) {
        for (long j = 0; j < taskNum; j++) {
            C(i*j+j, i) = rho(i)*lambda2;
        }
    }
}

MatrixXd AdaMultiLasso::proximal_derivative() {
    long r = beta.rows();
    long c = beta.cols();
    MatrixXd A = MatrixXd::Zero(r*taskNum, c);
    MatrixXd tmp = C*beta;
    for (long i=0;i<r*taskNum;i++){
        A.row(i) = Math::getInstance().L2Thresholding(tmp.row(i)/mu);
    }
    return X.transpose()*(X*beta-y) + C.transpose()*A;
}

MatrixXd AdaMultiLasso::proximal_operator(MatrixXd in, float lr) {
    MatrixXd sign = ((in.array()>0).matrix()).cast<double>();
    sign += -1.0*((in.array()<0).matrix()).cast<double>();
    in = ((in.array().abs()-lr*lambda1*theta.array()).max(0)).matrix();
    return (in.array()*sign.array()).matrix();
}


double AdaMultiLasso::getL() {
    return L;
}


