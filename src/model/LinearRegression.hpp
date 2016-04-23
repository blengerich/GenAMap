//
// Created by haohanwang on 1/24/16.
//

#ifndef ALGORITHMS_LINEARREGRESSION_HPP
#define ALGORITHMS_LINEARREGRESSION_HPP


#include "Model.hpp"

#include <Eigen/Dense>
#include <unordered_map>

#ifdef BAZEL
#include "model/ModelOptions.hpp"
#else
#include "../model/ModelOptions.hpp"
#endif

using namespace Eigen;


class LinearRegression : public virtual Model {
private:
    float L1_reg;
    float L2_reg;
public:
    void setL1_reg(float);
    void setL2_reg(float);

    // general use methods
    MatrixXd derivative();
    double cost();

    // algorithm use methods
    // proximal gradient descent
    MatrixXd proximal_derivative();
    MatrixXd proximal_operator(VectorXd, float);

    LinearRegression();
    LinearRegression(const unordered_map<string, string>& options);
};


#endif //ALGORITHMS_LINEARREGRESSION_HPP
