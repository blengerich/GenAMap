//
// Created by aditya gautam on 2/22/16.
//
#include "GFLasso.h"

// Constructors with different parameters provided
void Gflasso::gflasso() {
    corr_coff = MatrixXd::Random(MAX_TRAITS,MAX_TRAITS);
    corr_coff.setZero();
    lambda_flasso = 0.0;
    gamma_flasso = 0.0;
    flasso_type = GcFlasso;
}

void Gflasso::gflasso(double lambda,double gamma){
    corr_coff = MatrixXd::Random(MAX_TRAITS,MAX_TRAITS);
    corr_coff.setZero();
    lambda_flasso = lambda;
    gamma_flasso = gamma;
    flasso_type = GcFlasso;
}

void Gflasso::gflasso(MatrixXd corr_coff,double lambda,double gamma){
    this->corr_coff = corr_coff;
    gamma_flasso = gamma;
}

// Setting and getting various params of GFLasso model
void Gflasso::set_params(double lambda,double gamma){
    lambda_flasso = lambda;
    gamma_flasso = gamma;
}

vector<double> Gflasso::get_params(){
    vector<double> params;
    params.push_back(this->lambda_flasso);
    params.push_back(this->gamma_flasso);
    return params;
}

void Gflasso::set_lambda(double lambda){
    this->lambda_flasso = lambda;
}

void Gflasso::set_gamma(double gamma){
    this->gamma_flasso = gamma;
}

double Gflasso::get_lambda(){
    return (this->lambda_flasso);
}

double Gflasso::get_gamma(){
    return (this->gamma_flasso);
}

void Gflasso::set_flasso_type(int type){
    this->flasso_type = type;
}

int Gflasso::get_flasso_type() {
    return this->flasso_type;
}

// Training functions : X,Y and other parameters
void Gflasso::train(){
    cout << " Error : No Parameters are provided. Cannot perform GFLasso regression !" <<endl;
}

void Gflasso::train(MatrixXd X,MatrixXd Y){
    cout << "Training set X and Y is provided !" << endl;
    this->X = X;
    this->Y = Y;
    int row =0, col =0;
    row = X.cols();
    col = Y.rows();

    // Initialize beta to some random values
    this->beta = MatrixXd::Random(row,col);
}

// Training data provided along with initial beta estimation
void Gflasso::train(MatrixXd X,MatrixXd Y,MatrixXd Beta){
    this->X = X;
    this->Y = Y;
    this->beta = Beta;
}

// Everything is provided i.e. Training data,traits corr. and regularization params
void Gflasso::train(MatrixXd X,MatrixXd Y,MatrixXd corr_coeff,double lamdba,double gamma){
    this->X = X;
    this->Y = Y;
    this->corr_coff = corr_coff;
    this->lambda_flasso = lamdba;
    this->gamma_flasso = gamma;
}

double Gflasso::gflasso_fusion_penalty(int type){

    int num_rows = (this->corr_coff).rows();
    int num_cols = (this->corr_coff).cols(),idx=0,sign=1;
    int mul_factor = 1;
    double total_sum = 0.0;

    // Go through each edge of the corr_coff matrix(graph)
    for(int start_node=0;start_node<num_rows;start_node++) {

        for (int end_node = 0; end_node < num_cols; end_node++) {

            if (corr_coff(start_node, end_node) == 0)
                continue;
            else if (corr_coff(start_node, end_node) < 0)
                sign = -1;
            else
                sign = 1;

            mul_factor=1;
            if(type==GwFlasso) {
                mul_factor = corr_coff(start_node, end_node);
            }

            total_sum = mul_factor*abs(beta.col(start_node) - sign * beta(end_node));
        }
    }

    return total_sum;
}

// Cost function of gflasso
double Gflasso::gflasso_cost_function(int type){

    return (
            (Y - X * beta).squaredNorm() +
            lambda_flasso*(beta.cwiseAbs().sum()) +
            gamma_flasso*(gflasso_fusion_penalty(type))
    );
}