/*
 * LinearMixedModel.cpp
 *
 *  Created on: Mar 17, 2016
 *      Author: Aditya
 */
#include "LinearMixedModel.hpp"

using namespace Eigen;

LinearMixedModel::LinearMixedModel() {
    cout << "LMM: No input parameters provided !";
    n = 0;
    d = 0;
}

// Methods to set the training data

void LinearMixedModel::train(MatrixXd X, MatrixXd Y){

    cout << "Training set X and Y are provided !" << endl;
    this->X = X;
    this->Y = Y;

    this->beta = MatrixXd::Random(X.cols(),Y.rows());
    this->K= MatrixXd::Random(X.rows(),Y.rows());
    beta.setZeros();
    K.setZeros();
}

void LinearMixedModel::train(MatrixXd X, MatrixXd Y, MatrixXd K){

    cout << "Training set X,Y and K are provided !" << endl;
    this->X = X;
    this->Y = Y;
    this->K = K;

    // Initialize beta and mau to some random values
    this->beta = MatrixXd::Random(X.cols(),Y.rows());
    this->mau = MatrixXd::Random(n,1);
}

// Other getters and setter methods

void LinearMixedModel::set_lambda_params(double s, double e, double i){
	this->lambda_start_point = s;
	this->lambda_end_point = e;
	this->lambda_interval = i;
}

void LinearMixedModel::set_lambda_start_value(double start_val){
	this->lambda_start_point = start_val;
}

void LinearMixedModel::set_lambda_end_value(double end_val){
	this->lambda_end_point = end_val;
}

void LinearMixedModel::set_lambda_interval(double interval){
	this->lambda_interval = interval;
}

double LinearMixedModel::get_lambda_interval(){
	return this->lambda_interval;
}

double LinearMixedModel::get_lambda_start_value(){
   return this->lambda_start_point;
}

double LinearMixedModel::get_lambda_end_value(){
   return this->lambda_end_point;
}

// Decomposition of Similarity Matrix -> to be done later
void LinearMixedModel::decomposition(){

}

// This method will give Beta matrix as a function of the Lambda Matrix.

MatrixXd LinearMixedModel::calculate_beta(double lambda){

    MatrixXd Id = MatrixXd::setIdentity(n, n); // n*n
    MatrixXd U_trans = U.transpose(); // n*n
    MatrixXd U_trans_X = U_trans*X; // n*d
    MatrixXd U_trans_Y = U_trans*Y; // n*1
    MatrixXd U_X_trans = (U_trans_X).transpose(); // d*n
    MatrixXd S_lambda_inv = (S + lambda*Id).cwiseInverse(); // n*n

    MatrixXd first_term = MatridxXd::Random(d,d); // d*d
    MatrixXd second_term = MatridxXd::Random(d,1); // d*1

    first_term = ((U_X_trans*S_lambda_inv)*U_trans_X).cwiseInverse();
    second_term = (U_X_trans*S_lambda_inv)*U_trans_Y;
    return first_term*second_term;
}

// This method will give the value of sigma as a function of beta and lambda.
double LinearMixedModel::calculate_sigma(double lambda){

    double ret_val=0.0,temp_val=0.0;
    MatrixXd U_tran_Y = U.transpose()*Y; // n*1
    MatrixXd U_tran_X = U.transpose()*X; // n*d
    MatrixXd beta_matrix = calculate_beta(lambda);

    for(int i=1;i<=n;i++){
        temp_val = (U_tran_Y(i,1) - (U_tran_X.col(i))*beta_matrix)/(S(i,i) + lambda);
        temp_val *= temp_val;
        ret_val += temp_val;
    }

    ret_val = ret_val/double(n);
    ret_val = sqrt(ret_val);

    return ret_val;
}

// This method will return the value of log likehood as a function of lambda
// We have to try different lambda values to check at which the log likelihood is maximum or error(cost function) is minimum.

double LinearMixedModel::get_log_likelihood_value(double lambda){

    double first_term = 0.0,second_term=0.0, third_term=0.0, ret_val =0.0;
    int n = this->get_num_samples();

    first_term = (n)*log(2*3.14) + n;

    for(int i=1;i<=n;i++){
        second_term += log( double(S(i,i) + lambda));
    }

    third_term = n*log(calculate_sigma(lambda)/n);
    ret_val = -1/2*ret_val;
    return ret_val;
}

/* This function finds the value of lambda for which the log
 *
 */
void LinearMixedModel::find_max_log_likelihood(){

	int start_val = this->get_lambda_start_value(), end_val = get_lambda_end_value();
	int interval = this->get_lambda_interval(), max_likelihood =0.0,current_log_likelihood;
        int temp_likehood=0.0,best_lambda=-1;

	/* Do Grid search on the likelihood function and see for which lambda, it is getting to
	 * the maximum. Maximum likelihood means the most optimal solution.
	 */
        
	for(int val = start_val;val<=end_val;val=val+interval){
		current_log_likelihood = get_log_likelihood_value(val);

		if(current_log_likelihood >= max_likelihood){
			max_likelihood = current_log_likelihood;
			best_lambda = val;
		}
	}

	cout << "Best Likelihood occurs at lambda = " <<  best_lambda << endl;
	/* Now, we have the best lambda value, get sigma and calculate the best beta matrix
	 * corresponding to this Lambda and sigma values.
	 */
	this->lambda_optimized = best_lambda;
	this->sigma = calculate_sigma(best_lambda);
	this->beta = calculate_beta(best_lambda);
}
