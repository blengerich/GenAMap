
// Created by aditya gautam on 2/12/16.

#ifndef GENAMAPV2_GFLASSO_H
#define GENAMAPV2_GFLASSO_H

#include <iostream>
#include <Eigen/Dense>
#include <vector>

#include "Model.hpp"

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

public :
    //Constructor to initialize the correlation graph and the
    //regularisation parameters
    void Gflasso();
    // Only regularization params are given
    void Gflasso(double,double);
    // Regularization params along with corr coff. graph
    void Gflasso(MatrixXd,double,double);

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

    // Cost function and supporting function
    double cost();
    double gflasso_fusion_penalty();
};

#endif //GENAMAPV2_MASTER_GFLASSO_H
