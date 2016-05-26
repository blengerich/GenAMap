
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
};

#endif //STATS_STATS_HPP