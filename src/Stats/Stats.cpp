#include <Eigen/Dense>
#include <boost/math/distributions.hpp>
#include <math.h>
#include <iostream>

#ifdef BAZEL
#include "Stats/Stats.hpp"
#else
#include "Stats.hpp"
#endif

using namespace std;
using namespace Eigen;


float Stats::ChiSquaredTest(MatrixXf observed, MatrixXf expected) {
    MatrixXf diff = observed - expected;
    MatrixXf x = diff.cwiseProduct(diff).cwiseQuotient(expected);
    return x.sum();
}


float Stats::ChiToPValue(float chisqr_value, int dof) {
    boost::math::chi_squared dist(dof);
    return 1 - boost::math::cdf(dist, chisqr_value);
}


float Stats::WaldTest(float mle, float var, float candidate) {
    return pow(mle - candidate, 2) / var;
}

float Stats::FisherExactTest(MatrixXf X) {
   int N = X.sum();
   float NFac = boost::math::factorial<float>(N);
   MatrixXf rowSums = X.rowwise().sum();
   MatrixXf colSums = X.colwise().sum();
   MatrixXf comFacs = X.unaryExpr(std::ptr_fun(boost::math::factorial<float>));
   MatrixXf rFacs = rowSums.unaryExpr(std::ptr_fun(boost::math::factorial<float>));
   MatrixXf cFacs = colSums.unaryExpr(std::ptr_fun(boost::math::factorial<float>));
   float rowsFacs = rFacs.prod();
   float colsFacs = cFacs.prod();
   float componentFacs = comFacs.prod();
   return rowsFacs*colsFacs/(NFac*componentFacs);
}

float Stats::BonCorrection(float pVal, int number) {
  return pVal/number;
}

float Stats::get_ts(float beta, float var, float sigma){
  return beta/(sqrt(var * sigma));
}

float Stats::get_qs(float ts, int N, int q){
  return 2*Stats::ChiToPValue(abs(ts), N-q);  
}

void StatsBasic::setAttributeMatrix(const string &string1, MatrixXf *xd) {

}


StatsBasic::StatsBasic() {
    shouldCorrect = false;
}

StatsBasic::StatsBasic(const unordered_map<string, string> & options) {
    string tmp;
    try {
        tmp = options.at("correctNum");
        if (tmp == "Bonferroni correction"){
            shouldCorrect = true;
        }
        else{
            shouldCorrect = false;
        }
    } catch (std::out_of_range& oor) {
        shouldCorrect = true;
    }
}

void StatsBasic::checkGenoType() {
    long r = X.rows();
    long c = X.cols();
    int s = 0;
    bool go = true;
    for (long i=0;i<r&&go;i++){
        for (long j=0;j<c&&go;j++){
            if (X(i,j) == 2){
                s = 1;
                go = false;
            }
        }
    }
    if (s == 0){
        genoType = 1;
    }
    else{
        genoType = 2;
    }
}


void StatsBasic::assertReadyToRun() {
    beta = MatrixXf::Zero(X.cols(), y.cols());
    checkGenoType();
}


void StatsBasic::BonferroniCorrection() {
    if (shouldCorrect){
        beta = beta*X.rows();
        MatrixXf m = MatrixXf::Ones(beta.rows(), beta.cols());
        beta = beta.cwiseMin(m);
    }
}

float StatsBasic::getProgress() {
    return progress;
}

bool StatsBasic::getIsRunning() {
    return isRunning;
}


void StatsBasic::stop() {
    shouldStop = true;
}

void StatsBasic::setUpRun() {
    isRunning = true;
    progress = 0.0;
    shouldStop = false;
}

void StatsBasic::finishRun() {
    isRunning = false;
    progress = 1.0;
}

MatrixXf StatsBasic::getBeta() {
    MatrixXf tmp = MatrixXf::Zero(beta.rows(), beta.cols());
    for (long i = 0; i<beta.rows(); i++){
        for (long j=0; j<beta.cols(); j++){
            if (beta(i,j)>0){
                tmp(i,j) = -log10(beta(i,j));
            }
            else{
                tmp(i,j) = 0;
            }
        }
    }
    return tmp;
}
