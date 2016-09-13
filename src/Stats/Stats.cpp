#include <Eigen/Dense>
#include <boost/math/distributions.hpp>
#include <math.h>

#ifdef BAZEL
#include "Stats/Stats.hpp"
#else
#include "Stats.hpp"
#endif

using namespace std;
using namespace Eigen;


double Stats::ChiSquaredTest(MatrixXd observed, MatrixXd expected) {
    MatrixXd diff = observed - expected;
    MatrixXd x = diff.cwiseProduct(diff).cwiseQuotient(expected);
    return x.sum();
}


double Stats::ChiToPValue(double chisqr_value, int dof) {
    boost::math::chi_squared dist(dof);
    return 1 - boost::math::cdf(dist, chisqr_value);
}


double Stats::WaldTest(double mle, double var, double candidate) {
    return pow(mle - candidate, 2) / var;
}

double Stats::FisherExactTest(MatrixXd X) {
   int N = X.sum();
   double NFac = boost::math::factorial<double>(N);
   MatrixXd rowSums = X.rowwise().sum();
   MatrixXd colSums = X.colwise().sum();
   MatrixXd comFacs = X.unaryExpr(std::ptr_fun(boost::math::factorial<double>));
   MatrixXd rFacs = rowSums.unaryExpr(std::ptr_fun(boost::math::factorial<double>));
   MatrixXd cFacs = colSums.unaryExpr(std::ptr_fun(boost::math::factorial<double>));
   double rowsFacs = rFacs.prod();
   double colsFacs = cFacs.prod();
   double componentFacs = comFacs.prod();
   return rowsFacs*colsFacs/(NFac*componentFacs);
}

double Stats::BonCorrection(double pVal, int number) {
  return pVal/number;
}

double Stats::get_ts(double beta, double var, double sigma){
  return beta/(sqrt(var * sigma));
}

double Stats::get_qs(double ts, int N, int q){
  return 2*Stats::ChiToPValue(abs(ts), N-q);  
}

void StatsBasic::setAttributeMatrix(const string &string1, MatrixXd *xd) {

}


StatsBasic::StatsBasic() {
    correctNum = 0;
}

StatsBasic::StatsBasic(const unordered_map<string, string> & options) {
    try {
        correctNum = stol(options.at("correctNum"));
    } catch (std::out_of_range& oor) {
        correctNum = 0;
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
    beta = MatrixXd::Zero(X.cols(), y.cols());
    checkGenoType();
}


void StatsBasic::setCorrectNum(long i) {
    correctNum = i;
}

void StatsBasic::BonferroniCorrection() {
    if (correctNum!=0){
        beta = beta*correctNum;
        MatrixXd m = MatrixXd::Ones(beta.rows(), beta.cols());
        beta = beta.cwiseMin(m);
    }
}

// algorithm use

double StatsBasic::getProgress() {
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