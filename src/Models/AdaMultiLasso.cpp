//
// Created by haohanwang on 2/24/16.
//

#include "AdaMultiLasso.hpp"

#include <Eigen/Dense>
#include <stdexcept>
#include <unordered_map>

using namespace std;
using namespace Eigen;

AdaMultiLasso::AdaMultiLasso() {
    lambda1 = default_lambda1;
    lambda2 = default_lambda2;
    mu = default_mu;
    initTrainingFlag = false;
}

AdaMultiLasso::AdaMultiLasso(const unordered_map<string, string>& opts) {
    try {
        lambda1 = stod(opts.at("lambda"));
    } catch (std::out_of_range& oor) {
        lambda1 = default_lambda1;
    }
    try {
        lambda2 = stod(opts.at("gamma"));
    } catch (std::out_of_range& oor) {
        lambda2 = default_lambda2;
    }
    try {
        mu = stod(opts.at("mu"));
    } catch (std::out_of_range& oor) {
        mu = default_mu;
    }
    initTrainingFlag = false;
}

void AdaMultiLasso::setAttributeMatrix(const string& str, MatrixXd* Z) {
    if (str == "snpsFeatures1" || str == "snpsFeature1") {
        setSnpsFeatures1(*Z);
    } else if (str == "snpsFeatures2" || str == "snpsFeature2") {
        setSnpsFeatures2(*Z);
    } else if (str == "snpsFeatures" || str == "snpsFeature") {
        setSnpsFeatures(*Z);
    } else {
        throw runtime_error("AdaMultiLasso models have no attribute with name" + str);
    }
}

void AdaMultiLasso::setLambda1(double d) {
    lambda1 = d;
}

void AdaMultiLasso::setLambda2(double d) {
    lambda2 = d;
}

void AdaMultiLasso::setSnpsFeatures1(MatrixXd xd) {
    snpsFeatures1 = xd;
}

void AdaMultiLasso::setSnpsFeatures2(MatrixXd xd) {
    snpsFeatures2 = xd;
}

void AdaMultiLasso::setSnpsFeatures(MatrixXd xd) {
    setSnpsFeatures1(xd);
    setSnpsFeatures2(xd);
}

MatrixXd AdaMultiLasso::getSnpsFeatures1() {
    return snpsFeatures1;
}

MatrixXd AdaMultiLasso::getSnpsFeatures2() {
    return snpsFeatures2;
}

VectorXd AdaMultiLasso::getW() {
    return w;
}

VectorXd AdaMultiLasso::getV() {
    return v;
}


void AdaMultiLasso::updateW(VectorXd xd) {
    w = xd;
}

void AdaMultiLasso::updateV(VectorXd xd) {
    v = xd;
}

VectorXd AdaMultiLasso::gradient_w() {
    long c = snpsFeatures1.cols();
    long k = beta.cols();
//    updateTheta();
    VectorXd grad = VectorXd::Zero(c);
    for (long j=0;j<c;j++){
        grad(j) += (-k*snpsFeatures1.col(j).array()/theta.array()).sum();
        grad(j) += (snpsFeatures1.col(j).transpose()*(beta.array().abs().matrix())).array().sum();
    }
    return grad;
}

VectorXd AdaMultiLasso::gradient_v() {
    long c = snpsFeatures2.cols();
    long k = beta.cols();
//    updateRho();
    VectorXd grad = VectorXd::Zero(c);
    for (long j=0;j<c;j++){
        grad(j) += (-k*snpsFeatures1.col(j).array()/theta.array()).sum();
        grad(j) += (snpsFeatures1.col(j).transpose()*(beta.array().abs().matrix())).array().sum();  // double check this shortcut
    }
    return grad;
}

void AdaMultiLasso::updateTheta() {
    long c = snpsFeatures1.rows();
    theta = VectorXd::Zero(c);
    for (long j=0; j<c; j++){
        theta(j) = snpsFeatures1.row(j)*w;;
    }
}

void AdaMultiLasso::updateRho() {
    long c = snpsFeatures2.rows();
    rho = VectorXd::Zero(c);
    for (long j=0; j<c; j++){
        rho(j) = snpsFeatures2.row(j)*v;
    }
}


void AdaMultiLasso::updateTheta_Rho() {
    this->updateTheta();
    this->updateRho();
}

void AdaMultiLasso::initTheta() {
    w = VectorXd::Ones(snpsFeatures1.cols());
    long r = snpsFeatures1.rows();
    theta = VectorXd::Zero(r);
    for (long j=0; j<r; j++){
        theta(j) = snpsFeatures1.row(j)*w;
    }
}

void AdaMultiLasso::initRho() {
    v = VectorXd::Ones(snpsFeatures2.cols());
    long r = snpsFeatures2.rows();
    rho = VectorXd::Zero(r);
    for (long j=0; j<r; j++){
        rho(j) = snpsFeatures2.row(j)*v;
    }
}

VectorXd AdaMultiLasso::getTheta() {
    return theta;
}

VectorXd AdaMultiLasso::getRho() {
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

MatrixXd AdaMultiLasso::getFormattedBeta() {
    return beta;
}

void AdaMultiLasso::setX(MatrixXd xd) {
    X = xd;
}

void AdaMultiLasso::setY(MatrixXd yd) {
    y = yd;
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


void AdaMultiLasso::assertReadyToRun() {
    // X and Y must be compatible
	if (!((X.rows() > 0) && (X.rows() == y.rows())
		&& (X.cols() > 0) && (y.cols() > 0))) {
		throw runtime_error("X and Y matrices of size (" + to_string(X.rows()) + "," + to_string(X.cols()) + "), and (" +
            to_string(y.rows()) + "," + to_string(y.cols()) + ") are not compatible.");
	}
    // SNPs features must have p rows (the number of markers)
	if (!((snpsFeatures1.rows() > 0) && (snpsFeatures1.cols() > 0)
		&& (snpsFeatures2.rows() > 0) && (snpsFeatures2.cols() > 0)
        && (snpsFeatures1.rows() == X.cols()) && (snpsFeatures2.rows() == X.cols()))) {
		throw runtime_error("SNP Feature matrices of size (" + to_string(snpsFeatures1.rows()) + 
            ", " + to_string(snpsFeatures1.cols()) + "), and (" + to_string(snpsFeatures2.rows()) +
            ", " + to_string(snpsFeatures2.cols()) + ") are not compatible with X of size (" +
            to_string(X.rows()) + ", " + to_string(X.cols()) + ").");
	}
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
        MatrixXd tmpS1 = MatrixXd::Zero(c*taskNum, snpsFeatures1.cols());
        MatrixXd tmpS2 = MatrixXd::Zero(c*taskNum, snpsFeatures2.cols());
        for (long j=0;j<taskNum;j++){
            for (long k=0;k<c;k++){
                tmpT(k*taskNum+j) = theta(k);
                tmpR(k*taskNum+j) = rho(k);
                tmpS1.row(k*taskNum+j) = snpsFeatures1.row(k);
                tmpS2.row(k*taskNum+j) = snpsFeatures2.row(k);
            }
        }
        for (long i=0;i<n;i++){
            for (long j=0;j<taskNum;j++){
                for (long k=0;k<c;k++){
                    tmpX(i*taskNum+j, k*taskNum+j) = X(i, k);
                }
                tmpY(i*taskNum+j, 0) = y(i, j);
            }
        }
        X = tmpX;
        y = tmpY;
        theta = tmpT;
        rho = tmpR;
        snpsFeatures1 = tmpS1;
        snpsFeatures2 = tmpS2;
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

VectorXd AdaMultiLasso::projection(VectorXd in) {
    VectorXd a = in;
    sort(a.data(), a.data()+a.size());
    long l = a.size();
    double I = 0;
    double S = 0;
    for (long i=0;i<l;i++){
        double ss = 0;
        for (long j=i;j<l;j++) {
            ss += a(j);
        }
        if (ss - 1 < a(i)*(l-i)){
            S = ss - 1;
            I = l-i;
            break;
        }
    }
    double t = S/I;
    VectorXd r = ((in.array() - t).max(0)).matrix();
    return r;
}
