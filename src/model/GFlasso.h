
// Created by aditya gautam on 2/12/16.

#ifndef GENAMAPV2_GFLASSO_H
#define GENAMAPV2_GFLASSO_H

#include <iostream>
#include <vector>
#include "Eigen/Dense"

#ifdef BAZEL
#include "model/Model.hpp"
#else
#include "../model/Model.hpp"
#endif

// Upper limit on number of Traits
#define MAX_TRAITS 10

// GFlasso type
#define GcFlasso 0
#define GwFlasso 1

using namespace std;
using namespace Eigen;

class Gflasso: public Model{

private :

    // Training data
    MatrixXd X;
    MatrixXd Y;

    // Correlation graph between Y traits(Input)
    MatrixXd corr_coff;

    // Regularization parameters (Input)
    double lambda_flasso;
    double gamma_flasso;

    // Parameter modelling through Beta MatrixXd
    MatrixXd beta;

    //Type of flasso
    int flasso_type;

    //Smoothing Proximal Gradient Method
    MatrixXd edge_vertex_matrix; // Dimension: Edge_size*Col(x)
    int mau; // Smootheness parameter
    MatrixXd alpha_matrix;

public :
    //Constructor to initialize the correlation graph and the
    //regularisation parameters
    Gflasso();
    // Only regularization params are given
    Gflasso(double,double);
    // Regularization params along with corr coff. graph
    Gflasso(MatrixXd,double,double);

    // Methods to set and get various input variables of GFLASSO
    void train();
    // Only X and Y are given
    void train(MatrixXd,MatrixXd);
    // Training data provided along with Correlation coff Matrix
    void train(MatrixXd,MatrixXd,MatrixXd);
    // Everything is provided i.e. Training data,traits corr. and regularization params
    void train(MatrixXd,MatrixXd,MatrixXd,double,double);

    // Methods to set and get various parameters
    void set_params(double, double);
    vector<double> get_params();
    void set_lambda(double);
    void set_gamma(double);
    double get_lambda();
    double get_gamma();
    void set_flasso_type(int);
    int get_flasso_type();
    void set_mau(double);
    double get_mau();

    // Cost function and supporting functions
    double cost();
    double gflasso_fusion_penalty();

    // Smoothing proximal Gradient descent functions

    // Get number of edges in the given correlation coff matrix
    int get_num_edges();

    // Calculate the edge vertex matrix
    void update_edge_vertex_matrix();

    // Calculate the alpha matrix
    void update_alpha_matrix();

    // Calculate the gradient descent using the alpha and Edge vertex matrix
    // along with other input parameters i.e. X, Y and Beta.
    MatrixXd gradient_descent();
};


#endif //GENAMAPV2_MASTER_GFLASSO_H
