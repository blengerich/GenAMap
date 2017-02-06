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
    double lambda_optimized; // Value at which log likelihood is max
    double sigma;
    bool initFlag;

public:

    // Constructor
    LinearMixedModel();
    LinearMixedModel(const unordered_map<string, string>& options);

    //Setters and Getters
    long get_num_samples();
    long get_X_features();
    double get_lambda();
    double getSigma();
    void set_lambda(double);
    void set_S(MatrixXf);
    void set_U(MatrixXf);
    void setXY(MatrixXf, MatrixXf);
    void setXYK(MatrixXf, MatrixXf, MatrixXf);
    void setUS(MatrixXf, MatrixXf);
    MatrixXf getBeta();
    //Supporting functions
    // Final Objective of the LLM : Obtain beta matrix.
    void calculate_beta(double);
    void calculate_sigma(double);
    double get_log_likelihood_value(double);
    void find_max_log_likelihood();

    void set_num_samples(int num_samples);
    // Search objective functions
    double f(double);
    void assertReadyToRun();
    void init();
};

#endif /* SRC_MODEL_LINEARMIXEDMODEL_HPP_ */
