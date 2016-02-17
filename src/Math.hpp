//
// Created by haohanwang on 2/8/16.
//

#ifndef ALGORITHMS_MATH_HPP
#define ALGORITHMS_MATH_HPP

#include <Eigen/Dense>

using namespace Eigen;

class Math {
private:
    Math() {};
    Math(Math const &);  // don't implement
    void operator=(Math const &); // don't implement
public:
    static Math &getInstance() {
        static Math instance;
        return instance;
    }
    // statistics
    double variance(VectorXd);
    double std(VectorXd);
    double covariance(VectorXd, VectorXd);
    double correlation(VectorXd, VectorXd);
    // matrix
    void removeCol(MatrixXd*, long);

    VectorXd L2Thresholding(VectorXd in);
};


#endif //ALGORITHMS_MATH_HPP
