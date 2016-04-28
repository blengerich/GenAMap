/*
 * LinearMixedModel.cpp
 *
 *  Created on: Mar 17, 2016
 *      Author: Aditya Gautam (agautam1@andrew.cmu.edu)
 */
#include "LinearMixedModel.hpp"

#include <Eigen/Dense>

using namespace Eigen;

LinearMixedModel::LinearMixedModel() {
    cout << "LMM: No input parameters provided !" << endl;
    n = 0;
    d = 0;
}

LinearMixedModel::LinearMixedModel(const unordered_map<string, string>& options){

}

// Methods to set the training data
void LinearMixedModel::train(MatrixXd X, MatrixXd Y){
    
    cout << "Training set X and Y are provided !" << endl;
    this->X = X;
    this->Y = Y;
    
    this->beta = MatrixXd::Random(X.cols(),Y.rows());
    this->K= MatrixXd::Random(X.rows(),Y.rows());
    beta.setZero();
    K.setZero();
}

void LinearMixedModel::train(MatrixXd X, MatrixXd Y, MatrixXd K){
    
    cout << "Training set X,Y and K are provided !" << endl;
    this->X = X;
    this->Y = Y;
    this->K = K;
    
    // Initialize beta and mau to some random values
    this->beta = MatrixXd::Random(X.cols(),Y.rows());
    this->mau = MatrixXd(n,1);
}

// Other getters and setter methods
void LinearMixedModel::set_U(MatrixXd U){
    this->U = U;
}

void LinearMixedModel::set_S(MatrixXd S){
    this->S = S;
}

void LinearMixedModel::set_lambda(double val) {
    this->lambda_optimized = val;
}

int LinearMixedModel::get_num_samples() {
    return this->n;
}

// Decomposition of Similarity Matrix -> to be done later
void LinearMixedModel::decomposition(){
    
}

// This method will give Beta matrix as a function of the Lambda Matrix.

void LinearMixedModel::calculate_beta(double lambda){
    
    MatrixXd Id(n,n); // n*n
    Id.setIdentity(n,n);
    MatrixXd U_trans = U.transpose(); // n*n
    MatrixXd U_trans_X = U_trans*X; // n*d
    MatrixXd U_trans_Y = U_trans*Y; // n*1
    MatrixXd U_X_trans = (U_trans_X).transpose(); // d*n
    MatrixXd S_lambda_inv = (S + lambda*Id).cwiseInverse(); // n*n
    
    MatrixXd first_term = MatrixXd::Random(d,d); // d*d
    MatrixXd second_term = MatrixXd::Random(d,1); // d*1
    
    first_term = ((U_X_trans*S_lambda_inv)*U_trans_X).cwiseInverse();
    second_term = (U_X_trans*S_lambda_inv)*U_trans_Y;

    this->beta = first_term*second_term;
    return ;
}

// This method will give the value of sigma as a function of beta and lambda.
void LinearMixedModel::calculate_sigma(double lambda){
    
    double ret_val=0.0,temp_val=0.0;
    this->calculate_beta(lambda);
    MatrixXd U_tran_Y = U.transpose()*Y; // n*1
    MatrixXd U_tran_X = U.transpose()*X; // n*d

    for(int i=1;i<=n;i++){
        //temp_val = (U_tran_Y(i,1) - (U_tran_X.col(i))*this->beta)/(S(i,i) + lambda);
        temp_val *= temp_val;
        ret_val += temp_val;
    }
    
    ret_val = ret_val/double(n);
    ret_val = sqrt(ret_val);

    this->sigma = ret_val;
    return ;
}

// This method will return the value of log likehood as a function of lambda
// We have to try different lambda values to check at which the log likelihood is maximum or error(cost function) is minimum.

double LinearMixedModel::get_log_likelihood_value(double lambda){
    
    double first_term = 0.0,second_term=0.0, third_term=0.0, ret_val =0.0;
    int n = this->get_num_samples();
    
    first_term = (n)*log(2*M_PI) + n;
    
    for(int i=1;i<=n;i++){
        second_term += log( double(S(i,i) + lambda));
    }

    calculate_sigma(lambda);
    third_term = n*log(this->sigma/n);
    ret_val = first_term + second_term + third_term;
    ret_val = -1/2*ret_val;
    return ret_val;
}

/*
 This method is the function to find the optimal lambda value using
 the grid search for low resolution search and then do the brent search
 for high resolution.It is assumed that the Interval of Lambda is already set.
 If not, then set the value before using this function else default will be used.

 This function is negative of log likehood function and will be used as an objective
 function in the brent method. Since brent method aims at miniming the log likehood
 So, we need to have negative log likelihood function.
 Name is kept to be f for simplicity.
 */
double LinearMixedModel::f(double lambda){
    return -1*(this->get_log_likelihood_value(lambda));
}
