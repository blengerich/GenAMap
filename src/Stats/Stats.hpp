
#ifndef STATS_STATS_HPP
#define STATS_STATS_HPP

#include <Eigen/Dense>

using namespace Eigen;

class Stats {
public:

    static double ChiSquaredTest(MatrixXd, MatrixXd);
    static double ChiToPValue(double, int);

};

#endif //STATS_STATS_HPP