//
// Created by Liuyu Jin on Jun 9, 2016.
//

#ifndef ALGORITHMS_LINEARREGRESSION_HPP
#define ALGORITHMS_LINEARREGRESSION_HPP


#include <Eigen/Dense>
#include <unordered_map>
//#include "Model.hpp"

#ifdef BAZEL
#include "model/ModelOptions.hpp"
#include "Model.hpp"
#else
#include "../model/ModelOptions.hpp"
#include "../model/Model.hpp"
#endif

using namespace Eigen;

class ICLasso : public virtual Model {
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
    //constructor
    ICLasso();
    void set_X(MatrixXd);
    void set_Y(MatrixXd);
    void set_XY(MatrixXd, MatrixXd);
    void set_lambda1(double);
    void set_lambda2(double);
    void set_gamma(double);
    void set_theta(MatrixXd);
    double cost();
    void optimize_theta();

};


#endif //ALGORITHMS_LINEARREGRESSION_HPP
