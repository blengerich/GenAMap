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
    MatrixXf X; //n * p
    MatrixXf Y; //n * 1
    double lambda;
    double lambda1;
    double lambda2;
    double gamma;
    MatrixXf Beta; //p * 1
    MatrixXf Theta;

public:
    //constructor
    ICLasso();
    void set_X(MatrixXf);
    void set_Y(MatrixXf);
    void set_XY(MatrixXf, MatrixXf);
    void set_lambda1(double);
    void set_lambda2(double);
    void set_gamma(double);
    void set_theta(MatrixXf);
    double cost();
    void optimize_theta();

};


#endif //ALGORITHMS_LINEARREGRESSION_HPP
