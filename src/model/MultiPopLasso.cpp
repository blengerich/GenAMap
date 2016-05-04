//
// Created by haohanwang on 2/2/16.
//

#include <limits>

#ifdef BAZEL
#include "model/MultiPopLasso.hpp"

#else
#include "MultiPopLasso.hpp"
#endif

void MultiPopLasso::setXY(MatrixXd m, MatrixXd n) {
    X = m;
    y = n;
}

void MultiPopLasso::initBeta() {
    cout << "Multipop lasso does not suppor init beta explicitly here, beta will be initialized when formating data" << endl;
}

void MultiPopLasso::setLambda(double l) { lambda = l; }

void MultiPopLasso::setPopulation(VectorXd pop) {
    // population indicator must start from 0
    population = pop;
    popNum = (long)population.maxCoeff() + 1;
}

double MultiPopLasso::cost() {
    initTraining();
    return 0.5 * (y - X * beta).squaredNorm() + lambda * groupPenalization();
}

double MultiPopLasso::groupPenalization() {
    double r = 0;
    MatrixXd tmp = getBeta();
    for (long i = 0; i < tmp.rows(); i++) {
        r += tmp.row(i).squaredNorm();
    }
    return r;
}

void MultiPopLasso::initTraining() {
    if (!initTrainingFlag){
        initTrainingFlag = true;
        reArrangeData();
        formatData();
        initC();
    }
}

void MultiPopLasso::reArrangeData() {
    // arrange data according to its population
    long r = X.rows();
    long c = X.cols();
    MatrixXd tmpX = MatrixXd::Zero(r, c);
    MatrixXd tmpY = MatrixXd::Zero(r, 1);
    VectorXd tmpPop = VectorXd::Zero(r);
    vector<long> idx;
    long count = 0;
    for (long i=0;i<popNum;i++){
        idx = getPopulationIndex(i);
        for (long j=0;j<idx.size();j++){
            tmpX.row(count) = X.row(idx.at(j));
            tmpY.row(count) = y.row(idx.at(j));
            tmpPop(count++) = i;
        }
    }
    X = tmpX;
    y = tmpY;
    population = tmpPop;
}

void MultiPopLasso::removeColumns() {
    long c = X.cols();
    removeCols = VectorXi::Zero(c);
    for (long i = 0; i < c; i++) {
        double var = Math::getInstance().variance(X.col(i));
        if (var < 1e-3) {
            removeCols(i) = 1;
        }
    }
    long r = X.rows();
    long b = r / popNum;
    MatrixXd tmp;
    double cor;
    double std;
    for (long i = 0; i < r; i += b) {
        tmp = X.block(i, 0, b, c);
        for (long j = 0; j < c; j++) {
            if (removeCols(j) == 0) {
                for (long k = j + 1; k < c; k++) {
                    if (removeCols(k) == 0) {
                        cor = Math::getInstance().correlation(tmp.col(j), tmp.col(k));
                        if (cor > 0.98) {
                            removeCols(k) = 1;
                        }
                    }
                }
                std = Math::getInstance().std(tmp.col(j));
                if (std < 1e-9) {
                    removeCols(j) = 1;
                }
            }
        }
    }
}

MatrixXd MultiPopLasso::normalizeData_col(MatrixXd a) {
    long c = a.cols();
    VectorXd mean = a.colwise().mean();
    VectorXd std_inv = VectorXd::Zero(c);
    for (long i = 0; i < c; i++) {
        std_inv(i) = 1.0 / Math::getInstance().std(a.col(i));
    }
    return ((a.colwise() - mean).array().colwise() * std_inv.array()).matrix();
}

void MultiPopLasso::formatData() {
    // format data, put data into X matrix and init beta

    // todo: here we don't remove columns, may add it later
//    for (long i = removeCols.size() - 1; i >= 0; i--) {
//        if (removeCols(i) == 1) {
//            Math::getInstance().removeCol(&X, i);
//        }
//    }
    long c = X.cols();
    long r = X.rows();
    MatrixXd tmpX = MatrixXd::Zero(r, c * popNum);
    double pIdx = 0;
    for (long i=0;i<r;i++){
        pIdx = population(i);
        for (long j=0;j<c;j++){
            tmpX(i, j*popNum+pIdx) = X(i, j);
        }
    }
    X = tmpX;
    beta = MatrixXd::Random(c * popNum, 1);
    L = ((X.transpose()*X).eigenvalues()).real().maxCoeff();
}

void MultiPopLasso::initC() {
    long c = X.cols();
    C = MatrixXd::Zero(c * popNum, c);
    for (long i = 0; i < c; i++) {
        for (long j = 0; j < popNum; j++) {
            C(i*j+j, i) = gamma;
        }
    }
}

MatrixXd MultiPopLasso::proximal_derivative() {
    long r = beta.rows();
    long c = beta.cols();
    MatrixXd A = MatrixXd::Zero(r*popNum, c);
    MatrixXd tmp = C*beta;
    for (long i=0;i<r*popNum;i++){
        A.row(i) = Math::getInstance().L2Thresholding(tmp.row(i)/mu);
    }
    return X.transpose()*(X*beta-y) + C.transpose()*A;
}

MatrixXd MultiPopLasso::proximal_operator(MatrixXd in, float lr) {
    MatrixXd sign = ((in.array()>0).matrix()).cast<double>();
    sign += -1.0*((in.array()<0).matrix()).cast<double>();
    in = ((in.array().abs()-lr*lambda).max(0)).matrix();
    return (in.array()*sign.array()).matrix();
}

//MatrixXd MultiPopLasso::deriveMatrixA(double lr, long loops, double tol) {
//    long r = beta.rows();
//    long c = C.rows();
//    MatrixXd A = MatrixXd::Zero(r, c);
//    MatrixXd bct = beta*C.transpose();
//    double prev_residue = numeric_limits<double>::max();
//    double curr_residue;
//    for (long i=0;i<loops;i++){
//        A = A - lr*(bct - A);
//        A = project(A);
//        curr_residue = (bct*A).trace() - 0.5*A.norm();
//        if (prev_residue - curr_residue<= tol){
//            break;
//        }
//        else{
//            prev_residue = curr_residue;
//        }
//    }
//    return A;
//}
//
//MatrixXd MultiPopLasso::project(MatrixXd A) {
//    if (A.norm() <= 1){
//        return A;
//    }
//    else{
//        return A;
//    }
//}
//
double MultiPopLasso::getL(){
    double c = C.norm()/mu;
    return c + L;
}

vector<long> MultiPopLasso::getPopulationIndex(long pi) {
    vector<long> idx;
    for (long i=0;i<y.rows();i++){
        if (population(i) == pi){
            idx.push_back(i);
        }
    }
    return idx;
}

MatrixXd MultiPopLasso::getBeta() {
    long c = X.cols()/popNum;
    MatrixXd r = MatrixXd::Zero(popNum, c);
    for (long i=0;i<popNum;i++){
        for (long j=0;j<c;j++){
            r(i, j) = beta(j*popNum+i,0);
        }
    }
    return r;
}

void MultiPopLasso::setMu(double m) {
    mu = m;
}

void MultiPopLasso::setGamma(double g) {
    gamma = g;
}

MatrixXd MultiPopLasso::getFormattedBeta() {
    return beta;
}

MatrixXd MultiPopLasso::predict() {
    cout << "does not allow prediction with original X, please use predict(X, population) method instead"<<endl;
    return MatrixXd::Random(1,1);
}

MatrixXd MultiPopLasso::predict(MatrixXd x) {
    cout << "does not allow prediction without population information"<<endl;
    return MatrixXd::Random(1,1);
}

MatrixXd MultiPopLasso::predict(MatrixXd x, VectorXd pop){
    long r= x.rows();
    MatrixXd y(r, 1);
    MatrixXd b = getBeta();
    for (long i=0;i<r;i++){
        y.row(i) = x.row(i)*(b.row(long(pop(i))).transpose());
    }
    return y;
}

MultiPopLasso::MultiPopLasso() {
    initTrainingFlag = false;
    lambda = 0;
    mu = 1;
    gamma = 0;
}

MultiPopLasso::MultiPopLasso(const unordered_map<string, string> &options) {
    initTrainingFlag = false;
    lambda = stod(options.at("lambda"));
    mu = stod(options.at("mu"));
    gamma = stod(options.at("gamma"));
}
