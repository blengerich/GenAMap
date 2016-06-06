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
#include "../model/Model.hpp"

#endif

using namespace std;
using namespace Eigen;

class LinearMixedModel : public Model {
private :

    // Training data
    MatrixXd X;
    MatrixXd Y;

    // Dimensions of the data
    int n; // Number of samples
    int d; // Number of input features

    //Similary matrix and SVD
    MatrixXd K;
    MatrixXd S;
    MatrixXd U;
    void decomposition();

    MatrixXd beta; // d*1
    MatrixXd mau;  // Coeff matrix of similarity matrix.
    double lambda_optimized; // Value at which log likelihood is max
    double sigma;
    bool initFlag;

public:

    // Constructor
    LinearMixedModel();
    LinearMixedModel(const unordered_map<string, string>& options);

    //Setters and Getters
    int get_num_samples();
    int get_X_features();
    double get_lambda();
    double get_sigma();
    void set_lambda(double);
    void set_S(MatrixXd);
    void set_U(MatrixXd);
    void setXY(MatrixXd, MatrixXd);
    void setXYK(MatrixXd, MatrixXd, MatrixXd);
    void setUS(MatrixXd, MatrixXd);
    //Supporting functions
    // Final Objective of the LLM : Obtain beta matrix.
    void calculate_beta(double);
    void calculate_sigma(double);
    double get_log_likelihood_value(double);
    void find_max_log_likelihood();

    void set_num_samples(int num_samples);
    // Search objective functions
    double f(double);
    void init();
};

#endif /* SRC_MODEL_LINEARMIXEDMODEL_HPP_ */
