//
// Created by haohanwang on 1/24/16.
//

#include "Model.hpp"
#include <Eigen/Dense>

using namespace Eigen;

#ifndef ALGORITHMS_LINEARREGRESSION_HPP
#define ALGORITHMS_LINEARREGRESSION_HPP


class LinearRegression : public virtual Model {
private:
    float L1_reg;
    float L2_reg;
public:
    void setL1_reg(float);
    void setL2_reg(float);

    // general use methods
    VectorXd derivative();
    double cost();

    // algorithm use methods
    // proximal gradient descent
    VectorXd proximal_derivative();
    VectorXd proximal_operator(VectorXd, float);

    LinearRegression();
};


#endif //ALGORITHMS_LINEARREGRESSION_HPP
