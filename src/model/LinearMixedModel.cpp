/*
 * LinearMixedModel.cpp
 *
 *  Created on: Mar 17, 2016
 *      Author: Aditya Gautam (agautam1@andrew.cmu.edu)
 *      EDITED BY: Liuyu Jin (liuyuj@andrew.cmu.edu)
 */
#include "LinearMixedModel.hpp"

using namespace Eigen;

LinearMixedModel::LinearMixedModel() {
    std::cout << "LMM: Setting default values of n and d to 2" << std::endl;
    n = 2;
    d = 2;
}

// Methods to set the training data
void LinearMixedModel::train(MatrixXd new_X, MatrixXd new_Y){
    
    cout << "LMM: Training set X and Y are provided !" << endl;
    X = new_X; // Input
    Y = new_Y; // Output
    
    beta = MatrixXd::Random(X.cols(),Y.rows());
    K= MatrixXd::Random(X.rows(),Y.rows());
    beta.setZero();
    K.setZero();
}

void LinearMixedModel::train(MatrixXd new_X, MatrixXd new_Y, MatrixXd new_K){
    
    cout << "LMM: Training set X,Y and K are provided !" << endl;
    X = new_X;
    Y = new_Y;
    K = new_K; // Matrix that needs to be decomposed
    
    // Initialize beta and mau to some random values
    beta = MatrixXd::Random(X.cols(),Y.rows());
    mau = MatrixXd(n,1);
}

// Other getters and setter methods
// K = U*S*transpose(U)
void LinearMixedModel::set_U(MatrixXd new_U){
    U = new_U;
}

void LinearMixedModel::set_S(MatrixXd new_S){
    S = new_S;
}

void LinearMixedModel::set_lambda(double val) {
    lambda_optimized = val;
}

MatrixXd LinearMixedModel::get_beta(){
    return beta;
}

double LinearMixedModel::get_sigma(){
    return sigma;
}

double LinearMixedModel::get_lambda() {
    return lambda_optimized;
}

void  LinearMixedModel::set_num_samples(int num_samples){
    n = num_samples;
}

int LinearMixedModel::get_num_samples() {
    return n;
}

// Decomposition of Similarity Matrix -> to be done later
void LinearMixedModel::decomposition(){
    
}

MatrixXd get_betaVar(double lambda){
    MatrixXd Id(n,n); // n*n
    Id.setIdentity(n,n);
    MatrixXd U_trans = U.transpose(); // n*n
    MatrixXd U_trans_X = U_trans*X; // n*d  //XX
    MatrixXd U_trans_Y = U_trans*Y; // n*1
    MatrixXd U_X_trans = (U_trans_X).transpose(); // d*n
    MatrixXd S_lambda_inv = (S + lambda*Id).cwiseInverse(); // n*n
    MatrixXd betaVar = MatrixXd::Random(d,d); // d*d
    betaVar = ((U_X_trans*S_lambda_inv)*U_trans_X).cwiseInverse();
    return betaVar;

}

// This method will give Beta matrix as a function of the Lambda Matrix.

void LinearMixedModel::calculate_beta(double lambda){
    
    MatrixXd Id(n,n); // n*n
    Id.setIdentity(n,n);
    MatrixXd U_trans = U.transpose(); // n*n
    MatrixXd U_trans_X = U_trans*X; // n*d  //XX
    MatrixXd U_trans_Y = U_trans*Y; // n*1
    MatrixXd U_X_trans = (U_trans_X).transpose(); // d*n
    MatrixXd S_lambda_inv = (S + lambda*Id).cwiseInverse(); // n*n

    int r=0,c=0;
    /*
    for(r=0;r<S_lambda_inv.rows();r++)
        for(c=0;c<S_lambda_inv.cols();c++)
            std::cout << S_lambda_inv(r,c) << " ";
    */
    MatrixXd betaVar = get_betaVar(lambda);
    MatrixXd second_term = MatrixXd::Random(d,1); // d*1
    /*
    std::cout << " First term " ;
    for(r=0;r<first_term.rows();r++)
        for(c=0;c<first_term.cols();c++)
            std::cout << first_term(r,c) << " ";
    */
    second_term = (U_X_trans*S_lambda_inv)*U_trans_Y;

    beta = betaVar*second_term;
    /*
    std::cout << " Beta matrix : " ;

    for(r=0;r<beta.rows();r++)
        for(c=0;c<beta.cols();c++)
            std::cout << beta(r,c) << " ";
    */
    return ;
}

// This method will give the value of sigma as a function of beta and lambda.
void LinearMixedModel::calculate_sigma(double lambda){

    //std::cout << "Calculate_sigma : lambda = " << lambda << std::endl;

    double ret_val=0.0,temp_val=0.0;
    calculate_beta(lambda);
    MatrixXd U_tran_Y = U.transpose()*Y; // n*1
    MatrixXd U_tran_X = U.transpose()*X; // n*d
    MatrixXd U_tran_X_beta = U_tran_X*beta;

    int n = U_tran_X.rows();

    for(int i=0;i<n;i++){
        temp_val = U_tran_Y(i,0) - U_tran_X_beta(i,0);
        temp_val = temp_val/(double(S(i,i) + lambda));
        //std::cout << "Sigma cal : S(" << i << "," << i << ") = " << S(i,i) << std::endl;
        //std::cout << "lambda = " << lambda << std::endl;
        temp_val *= temp_val;
        ret_val += temp_val;
        //std::cout << "Sigma cal: ret_val  = " << ret_val << std::endl;
    }
    
    ret_val = ret_val/double(n);
    ret_val = sqrt(ret_val);

    sigma = ret_val;
    //std::cout << " Sigma val = " << ret_val << std::endl;

    return ;
}

/* This method will return the value of log likehood as a function of lambda
   We have to try different lambda values to check at which the log likelihood
   is maximum or error(cost function) is minimum.
*/
double LinearMixedModel::get_log_likelihood_value(double lambda){
    
    double first_term = 0.0,second_term=0.0, third_term=0.0, ret_val =0.0;
    int n = get_num_samples();
    
    first_term = (n)*log(2*M_PI) + n;
    //std::cout << " Get LogLikelihood : lambda =  " << lambda << std::endl;
    
    for(int i=0;i<n;i++){

        // Check if the term is less then zero or not, if yes skip it as it will be inf.
        if(double(S(i,i) + lambda) <= 0.0) {
            std::cout << "LLM Err : Log term is neg.... val = " << double(S(i, i) + lambda) <<  " for n = "  <<
                i << std::endl;
            continue;
        }

        //std::cout << " S val = " << S(i,i) + lambda << std::endl;
        second_term += log( double(S(i,i) + lambda) );
    }

    calculate_sigma(lambda);
    if(sigma <= 0.0){
        third_term = 0.0;
    }else {
        //std::cout << "this->sigma/n = " << this->sigma/n << std::endl;
        third_term = n * log(this->sigma / n);
    }

    ret_val = first_term + second_term + third_term;
    ret_val = -1.0/2.0*ret_val;
    //std::cout << "LMM : first_term " << first_term  << " second term " << second_term <<
    //" third term " << third_term << " ret val " <<  ret_val << std::endl;
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
    //std::cout << "f func ... lambda = " << lambda << std::endl;
    return -1.0*(get_log_likelihood_value(lambda));
}

