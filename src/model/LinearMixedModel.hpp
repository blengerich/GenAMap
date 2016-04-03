/*
 * LinearMixedModel.hpp
 *
 *  Created on: Mar 17, 2016
 *      Author: Aditya Gautam (agautam1@andrew.cmu.edu)
 */

#ifndef SRC_MODEL_LINEARMIXEDMODEL_HPP_
#define SRC_MODEL_LINEARMIXEDMODEL_HPP_

#include <iostream>
#include <vector>
#include <math.h>
#include <cstdlib>
#include <iostream>

#if BAZEL
#include "Eigen"
#include "Math/Math.hpp"
#include "Model.hpp"
#else
#include "../Eigen/Dense"
#include "../Math/Math.hpp"
#include "../model/Model.hpp"
#endif

using namespace std;
using namespace Eigen;

class LinearMixedModel: public Model{
    
    private :
    
    // Training data
    MatrixXd X;
    MatrixXd Y;
    
    // Dimensions of the data
    int n; // Number of samples
    int d; // Number of input features

    //Search parameters
    
public:
    
    // Constructor
    LinearMixedModel();
    
    //Similary matrix and SVD
    MatrixXd K;
    void decomposition();
    
    // Matrixs formed after the decomposition of similarity matrix.
    // Dimension of both is n*n
    MatrixXd S;
    MatrixXd U;
    
    // Parameters to estimate
    MatrixXd beta; // d*1
    MatrixXd mau;  // Coeff matrix of similarity matrix.
    double lambda_optimized; // Value at which log likelihood is max
    double sigma;
    
    //Setters and Getters
    int get_num_samples();
    int get_X_features();
    
    // Basic parameters
    MatrixXd get_beta();
    double get_lambda();
    double get_sigma();
    void set_lambda(double);
    void set_S(MatrixXd);
    void set_U(MatrixXd);
    
    // Functions to update the training data
    void train(MatrixXd,MatrixXd);
    void train(MatrixXd,MatrixXd,MatrixXd);
    
    //Supporting functions
    
    // Final Objective of the LLM : Obtain beta matrix.
    void calculate_beta(double);
    void calculate_sigma(double);
    double get_log_likelihood_value(double);
    void find_max_log_likelihood();
    
    // Search objective functions
    double f(double);
};

#endif /* SRC_MODEL_LINEARMIXEDMODEL_HPP_ */
