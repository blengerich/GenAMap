
#ifndef STATS_STATS_HPP
#define STATS_STATS_HPP

#include <Eigen/Dense>

using namespace Eigen;

namespace Stats {
//public:
    double ChiSquaredTest(MatrixXd, MatrixXd);
    double ChiToPValue(double, int);
    double WaldTest(double mle, double var, double candidate);
    double FisherExactTest(MatrixXd);
    double BonCorrection(double, int);
    double get_ts(double beta, double var, double sigma);
    double get_qs(double ts, int N, int q);
};

#endif //STATS_STATS_HPP