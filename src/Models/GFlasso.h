
// Created by aditya gautam on 2/12/16.

#ifndef GENAMAPV2_GFLASSO_H
#define GENAMAPV2_GFLASSO_H

#include <iostream>
#include <vector>
#include <unordered_map>
#include "Eigen/Dense"
#include "Model.hpp"

// GFlasso type
#define GcFlasso 0
#define GwFlasso 1

using namespace std;
using namespace Eigen;

class Gflasso: public Model{

private :

    // Training data

    // Correlation graph between Y traits(Input)
    MatrixXf corr_coff;

    // Regularization parameters (Input)
    float lambda_flasso;
    float gamma_flasso;

    // Parameter modelling through Beta MatrixXf
    //Type of flasso
    int flasso_type;

    //Smoothing Proximal Gradient Method
    MatrixXf edge_vertex_matrix; // Dimension: Edge_size*Col(x)
    float mau; // Smootheness parameter  //todo: what is this?
    MatrixXf alpha_matrix;

    static constexpr float default_lambda_flasso = 0.0;
    static constexpr float default_gamma_flasso = 0.0;
    static constexpr int default_flasso_type = GcFlasso;

public :
    //Constructor to initialize the correlation graph and the
    //regularisation parameters
    Gflasso();

    // Only regularization params are given
    Gflasso(float,float);
    // Regularization params along with corr coff. graph
    Gflasso(MatrixXf,float,float);
    Gflasso(const unordered_map<string, string>&);

    void assertReadyToRun();

//    // interfaces irrelevant to PGD, convenient for debug.
//    // Methods to set and get various input variables of GFLASSO
//    void train();
//    // Training data provided along with Correlation coff Matrix
//    void train(MatrixXf,MatrixXf,MatrixXf);
//    // Everything is provided i.e. Training data,traits corr. and regularization params
//    void train(MatrixXf,MatrixXf,MatrixXf,float,float);

    // Only X and Y are given
    void setXY(MatrixXf,MatrixXf);

    // Methods to set and get various parameters
    void set_params(float, float);
    vector<float> get_params();
    void set_lambda(float);
    void set_gamma(float);
    float get_lambda();
    float get_gamma();
    void set_flasso_type(int);
    int get_flasso_type();
    void set_mau(float);
    float get_mau();
    MatrixXf get_X();
    MatrixXf get_Y();
    MatrixXf get_beta();
    void initBeta();

    // Cost function and supporting functions
    float cost();
    float gflasso_fusion_penalty();

    // Smoothing proximal Gradient descent functions

    // Get number of edges in the given correlation coff matrix
    int get_num_edges();

    // Calculate the edge vertex matrix
    void update_edge_vertex_matrix();

    // Calculate the alpha matrix
    void update_alpha_matrix();

    // Calculate the gradient descent using the alpha and Edge vertex matrix
    // along with other input parameters i.e. X, Y and Beta.
    MatrixXf gradient();

    MatrixXf proximal_operator(MatrixXf, float);

    // Lipschitz Constant
    float getL();
};


#endif //GENAMAPV2_MASTER_GFLASSO_H
