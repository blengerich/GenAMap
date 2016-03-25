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
    
    // Lambda interval and boundary dimensions
    double lambda_start_point;
    double lambda_end_point;
    double lambda_interval;
    
    //Brent search params
    double brent_tol_error;
    
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
    void set_S(MatrixXd);
    void set_U(MatrixXd);
    
    // Parameters related to lambda variation
    void set_lambda_params(double, double, double);
    void set_lambda_start_value(double);
    void set_lambda_end_value(double);
    void set_lambda_interval(double);
    void shift_lambda_window(double);
    
    double get_lambda_interval();
    double get_lambda_start_value();
    double get_lambda_end_value();
    
    // Brent search parameters
    void set_brent_tol_err(double);
    double get_brent_tol_err();
    
    // Functions to update the training data
    void train(MatrixXd,MatrixXd);
    void train(MatrixXd,MatrixXd,MatrixXd);
    
    //Supporting functions
    
    // Final Objective of the LLM : Obtain beta matrix.
    MatrixXd calculate_beta(double);
    double calculate_sigma(double);
    double get_log_likelihood_value(double);
    void find_max_log_likelihood_grid_search();
    
    // Brent search related functions
    void find_max_log_likelihood_brent_search();
    double f(double);
    double brent_search(double,double,double,double,double,double,double &);
    
};

#endif /* SRC_MODEL_LINEARMIXEDMODEL_HPP_ */
