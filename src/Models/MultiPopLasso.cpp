//
// Created by haohanwang on 2/2/16.
//

#include <limits>
#include <stdexcept>

#ifdef BAZEL
#include "Models/MultiPopLasso.hpp"
#else
#include "MultiPopLasso.hpp"
#endif

using namespace std;
using namespace Eigen;

void MultiPopLasso::setXY(MatrixXf m, MatrixXf n) {
    X = m;
    y = n;
}

void MultiPopLasso::initBeta() {
    cout << "Multipop lasso does not suppor init beta explicitly here, beta will be initialized when formating data" << endl;
}

void MultiPopLasso::setLambda(float l) { lambda = l; }

void MultiPopLasso::setPopulation(VectorXf pop) {
    // population indicator must start from 0
    population = pop;
    popNum = (long)population.maxCoeff() + 1;
}

float MultiPopLasso::cost() {
    initTraining();
    if (logisticFlag){
        return 0.5 * (y - (X * beta).unaryExpr(&sigmoid)).squaredNorm() + lambda * groupPenalization();
    }
    else{
        return 0.5 * (y - X * beta).squaredNorm() + lambda * groupPenalization();
    }
}

float MultiPopLasso::groupPenalization() {
    float r = 0;
    MatrixXf tmp = getBetaInside();
    for (long i = 0; i < tmp.rows(); i++) {
        r += tmp.row(i).squaredNorm();
    }
    return r;
}

void MultiPopLasso::assertReadyToRun() {
    // X and Y must be compatible
    if (!((X.rows() > 0) && (X.rows() == y.rows())
        && (X.cols() > 0) && (y.cols() > 0))) {
        throw runtime_error("X and Y matrices of size (" + to_string(X.rows()) + "," + to_string(X.cols()) + "), and (" +
            to_string(y.rows()) + "," + to_string(y.cols()) + ") are not compatible.");
    }
    // Population Labels must have n rows (one for each sample)
    if (population.rows() != X.rows()) {
        throw runtime_error("Population labels of length " + to_string(population.rows()) + 
            " are the wrong size for X with " + to_string(X.rows()) + " samples.");
    }
    checkLogisticRegression();
    cerr << "assertReadyToRun passed" << endl;
}

void MultiPopLasso::setAttributeMatrix(const string& str, MatrixXf* Z) {
    if (str == "population") {
        cerr << "setting population" << endl;
        // todo: stop copying data
        setPopulation(VectorXf(Map<VectorXf>(Z->data(), Z->rows())));
    } else if (str == "X") {
        setX(*Z);
    } else if (str == "Y") {
        setY(*Z);
    } else {
//        throw runtime_error("MultiPopLasso models have no attribute with name " + str);
        std::clog << "MultiPopLasso models have no attribute with name " << str << endl;
    }
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
    MatrixXf tmpX = MatrixXf::Zero(r, c);
    MatrixXf tmpY = MatrixXf::Zero(r, 1);
    VectorXf tmpPop = VectorXf::Zero(r);
    vector<long> idx;
    long count = 0;
    for (long i=0; i<popNum; i++){
        idx = getPopulationIndex(i);
        for (unsigned long j=0; j<idx.size(); j++){
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
        float var = Math::getInstance().variance(X.col(i));
        if (var < 1e-3) {
            removeCols(i) = 1;
        }
    }
    long r = X.rows();
    long b = r / popNum;
    MatrixXf tmp;
    float cor;
    float std;
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

MatrixXf MultiPopLasso::normalizeData_col(MatrixXf a) {
    long c = a.cols();
    VectorXf mean = a.colwise().mean();
    VectorXf std_inv = VectorXf::Zero(c);
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
    MatrixXf tmpX = MatrixXf::Zero(r, c * popNum);
    float pIdx = 0;
    for (long i=0;i<r;i++){
        pIdx = population(i);
        for (long j=0;j<c;j++){
            tmpX(i, j*popNum+pIdx) = X(i, j);
        }
    }
    X = tmpX;
    beta = MatrixXf::Zero(c * popNum, 1);
    L = ((X.transpose()*X).eigenvalues()).real().maxCoeff();
}

void MultiPopLasso::initC() {
    long c = X.cols();
    C = MatrixXf::Zero(c * popNum, c);
    for (long i = 0; i < c; i++) {
        for (long j = 0; j < popNum; j++) {
            C(i*j+j, i) = gamma;
        }
    }
}

MatrixXf MultiPopLasso::proximal_derivative() {
    long r = beta.rows();
    long c = beta.cols();
    MatrixXf A = MatrixXf::Zero(r*popNum, c);
    MatrixXf tmp = C*beta;
    for (long i=0;i<r*popNum;i++){
        A.row(i) = Math::getInstance().L2Thresholding(tmp.row(i)/mu);
    }
    if (logisticFlag){
        return X.transpose()*((X*beta).unaryExpr(&sigmoid)-y) + C.transpose()*A;
    }
    else{
        return X.transpose()*(X*beta-y) + C.transpose()*A;
    }
}

MatrixXf MultiPopLasso::proximal_operator(MatrixXf in, float lr) {
    MatrixXf sign = ((in.array()>0).matrix()).cast<float>();
    sign += -1.0*((in.array()<0).matrix()).cast<float>();
    in = ((in.array().abs()-lr*lambda).max(0)).matrix();
    return (in.array()*sign.array()).matrix();
}

//MatrixXf MultiPopLasso::deriveMatrixA(double lr, long loops, double tol) {
//    long r = beta.rows();
//    long c = C.rows();
//    MatrixXf A = MatrixXf::Zero(r, c);
//    MatrixXf bct = beta*C.transpose();
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
//MatrixXf MultiPopLasso::project(MatrixXf A) {
//    if (A.norm() <= 1){
//        return A;
//    }
//    else{
//        return A;
//    }
//}
//
float MultiPopLasso::getL(){
    float c = C.norm()/mu;
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

MatrixXf MultiPopLasso::getBetaInside() {
    long c = X.cols()/popNum;
    MatrixXf r = MatrixXf::Zero(popNum, c);
    for (long i=0;i<popNum;i++){
        for (long j=0;j<c;j++){
            r(i, j) = beta(j*popNum+i,i/popNum);
        }
    }
    return r;
}


MatrixXf MultiPopLasso::getBeta() {
    long c = X.cols()/popNum;
    MatrixXf r = MatrixXf::Zero(popNum*betaAll.cols(), c);
    for (long k=0;k<betaAll.cols();k++){
        for (long i=0;i<popNum;i++){
            for (long j=0;j<c;j++){
                r(i+k*popNum, j) = betaAll(j*popNum+i,k);
            }
        }
    }
    return r.transpose()*100;
}

void MultiPopLasso::setMu(float m) {
    mu = m;
}

void MultiPopLasso::setGamma(float g) {
    gamma = g;
}

MatrixXf MultiPopLasso::getFormattedBeta() {
    return beta;
}

MatrixXf MultiPopLasso::predict() {
    cout << "does not allow prediction with original X, please use predict(X, population) method instead"<<endl;
    return MatrixXf::Random(1,1);
}

MatrixXf MultiPopLasso::predict(MatrixXf x) {
    cout << "does not allow prediction without population information"<<endl;
    return MatrixXf::Random(1,1);
}

MatrixXf MultiPopLasso::predict(MatrixXf x, VectorXf pop){
    long r= x.rows();
    MatrixXf y(r, 1);
    MatrixXf b = getBetaInside();
    for (long i=0;i<r;i++){
        y.row(i) = x.row(i)*(b.row(long(pop(i))).transpose());
    }
    return y;
}

MultiPopLasso::MultiPopLasso() {
    initTrainingFlag = false;
    lambda = default_lambda;
    mu = default_mu;
    gamma = default_gamma;
    betaAll = MatrixXd::Ones(1,1);
    logisticFlag = false;
}

MultiPopLasso::MultiPopLasso(const unordered_map<string, string> &options) {
    initTrainingFlag = false;
    try {
        lambda = stod(options.at("lambda"));
    } catch (std::out_of_range& oor) {
        lambda = default_lambda;
    }
    try {
        mu = stod(options.at("mu"));
    } catch (std::out_of_range& oor) {
        mu = default_mu;
    }
    try {
        gamma = stod(options.at("gamma"));    
    } catch (std::out_of_range& oor) {
        gamma = default_gamma;
    }
    betaAll = MatrixXd::Ones(1,1);
    logisticFlag = false;
}

void MultiPopLasso::updateBetaAll() {
    if (betaAll.rows() == 1){
        betaAll = beta;
    }
    else{
        betaAll.conservativeResize(betaAll.rows(),betaAll.cols()+1);
        betaAll.col(betaAll.cols()-1) = beta;
    }
}

MatrixXf MultiPopLasso::getBetaAll() {
    return betaAll;
}

void MultiPopLasso::reSetFlag() {
    initTrainingFlag = false;
}
