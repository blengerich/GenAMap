//
// Created by Liuyu Jin on Jun 9, 2016.
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
    MatrixXd X; //n * p
    MatrixXd Y; //n * 1
    double lambda;
    double lambda1;
    double lambda2;
    double gamma;
    MatrixXd Beta; //p * 1
    MatrixXd Theta;

public:
    void set_X(MatrixXd);
    void set_Y(MatrixXd);
    void set_XY(MatrixXd, MatrixXd);
    void set_lambda1(double);
    void set_lambda2(double);
    void set_gamma(double);
    void set_theta(double);
    double cost();
    void optimize_theta();

};


#endif //ALGORITHMS_LINEARREGRESSION_HPP
