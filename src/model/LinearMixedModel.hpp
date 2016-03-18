/*
 * LinearMixedModel.hpp
 *
 *  Created on: Mar 17, 2016
 *      Author: Aditya
 */

#ifndef SRC_MODEL_LINEARMIXEDMODEL_HPP_
#define SRC_MODEL_LINEARMIXEDMODEL_HPP_

#include <iostream>
#include "Eigen"
#include "Math/Math.hpp"
#include <vector>
#include "model.hpp"

#define MAX_TRAIS 10

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
    int lambda_start_point;
    int lambda_end_point;
    int lambda_interval;

    public:
    //Similary matrix and SVD
    MatrixXd K;
    void decomposition();

    // Matrixs formed after the decomposition of similarity matrix.
    // Dimension of both is n*n

    MatrixXd S;
    MatrixXd U;

    // Parameters to estimate

    MatrixXd beta; // Dimensions -> d*1
    MatrixXd mau;  // Coeff matrix of similarity matrix.
    double lambda_optimized;
    double sigma;

    //Setters and Getters

    int get_num_samples();
    int get_X_features();

    // Basic parameters
    MatrixXd get_beta();
    double get_lambda();
    double get_sigma();

    // Parameters related to lambda variation
    void set_lambda_params(double, double, double);
    void set_lambda_start_value(double);
    void set_lambda_end_value(double);
    void set_lambda_interval(double);

    double get_lambda_interval();
    double get_lambda_start_value();
    double get_lambda_end_value();

    // Provide the training data
    void train(MatrixXd,MatrixXd);
    void train(MatrixXd,MatrixXd,MatrixXd);

    //Supporting functions

    // Final Objective of the LLM : Obtain beta matrix.
    MatrixXd calculate_beta(double);
    double calculate_sigma(double);
    double calcualted_lambda(double);
    double get_log_likelihood_value(double);
    void find_max_log_likelihood();
};

#endif /* SRC_MODEL_LINEARMIXEDMODEL_HPP_ */
