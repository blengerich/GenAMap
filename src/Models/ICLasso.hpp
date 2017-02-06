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
    float lambda;
    float lambda1;
    float lambda2;
    float gamma;
    MatrixXf Beta; //p * 1
    MatrixXf Theta;

public:
    //constructor
    ICLasso();
    void set_X(MatrixXf);
    void set_Y(MatrixXf);
    void set_XY(MatrixXf, MatrixXf);
    void set_lambda1(float);
    void set_lambda2(float);
    void set_gamma(float);
    void set_theta(MatrixXf);
    float cost();
    void optimize_theta();

};


#endif //ALGORITHMS_LINEARREGRESSION_HPP
