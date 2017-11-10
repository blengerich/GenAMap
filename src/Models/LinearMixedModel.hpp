/*
 * LinearMixedModel.hpp
 *
 *  Created on: Mar 17, 2016
 *      Author: Aditya Gautam (agautam1@andrew.cmu.edu)
 */

#ifndef SRC_MODEL_LINEARMIXEDMODEL_HPP_
#define SRC_MODEL_LINEARMIXEDMODEL_HPP_

#include <Eigen/Dense>
#include <Eigen/SVD>
#include <iostream>
#include <vector>
#include <math.h>
#include <cstdlib>
#include <iostream>

#ifdef BAZEL
#include "Math/Math.hpp"
#include "Model.hpp"
#else
#include "../Math/Math.hpp"
#include "../Models/Model.hpp"
#endif

using namespace std;
using namespace Eigen;

class LinearMixedModel : public Model {
protected:

    // Training data
//    MatrixXf X;
//    MatrixXf Y;

    // Dimensions of the data
    long n; // Number of samples
    long d; // Number of input features

    //Similary matrix and SVD
    MatrixXf K;
    MatrixXf S;
    MatrixXf U;
    void decomposition();

//    MatrixXf beta; // d*1
    MatrixXf mau;  // Coeff matrix of similarity matrix.
    float lambda_optimized; // Value at which log likelihood is max
    float sigma;
    bool initFlag;

public:

    // Constructor
    LinearMixedModel();
    LinearMixedModel(const unordered_map<string, string>& options);

    //Setters and Getters
    long get_num_samples();
    long get_X_features();
    float get_lambda();
    float getSigma();
    void set_lambda(float);
    void set_S(MatrixXf);
    void set_U(MatrixXf);
    void setX(const MatrixXf&);
    void setXY(MatrixXf, MatrixXf);
    void setXYK(MatrixXf, MatrixXf, MatrixXf);
    void setUS(MatrixXf, MatrixXf);
    MatrixXf getBeta();
    //Supporting functions
    // Final Objective of the LLM : Obtain beta matrix.
    void calculate_beta(float);
    void calculate_sigma(float);
    float get_log_likelihood_value(float);
    void find_max_log_likelihood();

    void set_num_samples(int num_samples);
    // Search objective functions
    float f(float);
    void assertReadyToRun();
    void init();
};

#endif /* SRC_MODEL_LINEARMIXEDMODEL_HPP_ */
