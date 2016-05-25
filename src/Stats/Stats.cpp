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