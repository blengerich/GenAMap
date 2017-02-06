/*
 * LinearMixedModel.cpp
 *
 *  Created on: Mar 17, 2016
 *      Author: Aditya Gautam (agautam1@andrew.cmu.edu)
 */
#include "LinearMixedModel.hpp"

#include <stdexcept>

using namespace std;
using namespace Eigen;

LinearMixedModel::LinearMixedModel() {
    K = MatrixXf::Zero(1,1);
    S = MatrixXf::Zero(1,1);
    initFlag = false;
}

LinearMixedModel::LinearMixedModel(const unordered_map<string, string> &options) {
    K = MatrixXf::Zero(1,1);
    S = MatrixXf::Zero(1,1);
    initFlag = false;
}

// Methods to set the training data
void LinearMixedModel::setXY(MatrixXf X, MatrixXf Y) {
//    cout << "LMM: Training set X and Y are provided !" << endl;
    this->X = X; // Input
    this->y = Y; // Output

    this->beta = MatrixXf::Random(X.cols(), Y.rows());
    this->K = X*X.transpose();
    this->n = get_num_samples();
    this->d = X.cols();
//    beta.setZero();
//    K.setZero();
}

void LinearMixedModel::setXYK(MatrixXf X, MatrixXf Y, MatrixXf K) {
//    cout << "LMM: Training set X,Y and K are provided !" << endl;
    this->X = X;
    this->y = Y;
    this->K = K; // Matrix that needs to be decomposed
    this->n = get_num_samples();
    this->d = X.cols();

    // Initialize beta and mau to some random values
    this->beta = MatrixXf::Random(X.cols(), Y.rows());
    this->mau = MatrixXf(n, 1);
}

// Other getters and setter methods
// K = U*S*transpose(U)
void LinearMixedModel::set_U(MatrixXf U) {
    this->U = U;
}

void LinearMixedModel::set_S(MatrixXf S) {
    this->S = S;
}


void LinearMixedModel::setUS(MatrixXf U, MatrixXf S) {
    this->U = U;
    this->S = S;
}

void LinearMixedModel::set_lambda(double val) {
    this->lambda_optimized = val;
}

double LinearMixedModel::get_lambda() {
    return this->lambda_optimized;
}

void  LinearMixedModel::set_num_samples(int num_samples) {
    this->n = num_samples;
}

long LinearMixedModel::get_num_samples() {
    return this->X.rows();
}

void LinearMixedModel::assertReadyToRun() {
    throw runtime_error("LinearMixedModel not implemented");
}

// Decomposition of Similarity Matrix ->
// K = U*S*transpose(U)
void LinearMixedModel::decomposition() {
    JacobiSVD<MatrixXf> svd(this->K, ComputeThinU | ComputeThinV);
    MatrixXf tmpS = svd.singularValues();
    U = svd.matrixU();
    S = MatrixXf::Zero(tmpS.rows(), tmpS.rows());
    for (long i = 0; i<tmpS.rows(); i++){
        S(i, i) = tmpS(i, 0);
    }
}


// This method will give Beta matrix as a function of the Lambda Matrix.
void LinearMixedModel::calculate_beta(double lambda) {
    init();
    MatrixXf Id(n, n); // n*n
    Id.setIdentity(n, n);
    MatrixXf U_trans = U.transpose(); // n*n
    MatrixXf U_trans_X = U_trans * X; // n*d
    MatrixXf U_trans_Y = U_trans * y; // n*1
    MatrixXf U_X_trans = (U_trans_X).transpose(); // d*n
    MatrixXf S_lambda_inv = (S + lambda * Id).inverse(); // n*n

//    MatrixXf first_term = MatrixXf::Random(d, d); // d*d
//    MatrixXf second_term = MatrixXf::Random(d, 1); // d*1

    MatrixXf first_term = ((U_X_trans * S_lambda_inv) * U_trans_X).inverse();
    MatrixXf second_term = (U_X_trans * S_lambda_inv) * U_trans_Y;

    beta = first_term * second_term;

    return;
}

// This method will give the value of sigma as a function of beta and lambda.
void LinearMixedModel::calculate_sigma(double lambda) {
    init();
    double ret_val = 0.0, temp_val = 0.0;
    this->calculate_beta(lambda);
    MatrixXf U_tran_Y = U.transpose() * y; // n*1
    MatrixXf U_tran_X = U.transpose() * X; // n*d
    MatrixXf U_tran_X_beta = U_tran_X * beta;

    long n = U_tran_X.rows();

    for (int i = 0; i < n; i++) {
        temp_val = U_tran_Y(i, 0) - U_tran_X_beta(i, 0);
        temp_val = temp_val / (double(S(i, i) + lambda));
        temp_val *= temp_val;
        ret_val += temp_val;
    }

    this->sigma = ret_val / double(n);
    return;
}

/* This method will return the value of log likehood as a function of lambda
   We have to try different lambda values to check at which the log likelihood
   is maximum or error(cost function) is minimum.
*/
double LinearMixedModel::get_log_likelihood_value(double lambda) {
    init();
    double first_term = 0.0, second_term = 0.0, third_term = 0.0, ret_val = 0.0;
    long n = this->get_num_samples();

    first_term = (n) * log(2 * M_PI) + n;
    for (int i = 0; i < n; i++) {

        // Check if the term is less then zero or not, if yes skip it as it will be inf.
        if (double(S(i, i) + lambda) <= 0.0) {
//            std::cout << "LLM Err : Log term is neg.... val = " << double(S(i, i) + lambda) << " for n = " <<
//            i << std::endl;
            continue;
        }
        second_term += log(double(S(i, i) + lambda));
    }

    calculate_sigma(lambda);
    if (sigma <= 0.0) {
        third_term = 0.0;
    } else {
        third_term = n * log(this->sigma);
    }

    ret_val = first_term + second_term + third_term;
    ret_val = -1.0 / 2.0 * ret_val;
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
double LinearMixedModel::f(double lambda) {
    init();
    return -1.0 * (this->get_log_likelihood_value(lambda));
}

void LinearMixedModel::init() {
    MatrixXf tmp = MatrixXf::Zero(1,1);
    if (!initFlag){
        if (K.rows() == 1){
            K = X*X.transpose();
            decomposition();
        }
        else if (S.rows() == 1){
            decomposition();
        }
        initFlag = true;
    }
}

MatrixXf LinearMixedModel::getBeta() {
    return beta;
}

double LinearMixedModel::getSigma() {
    return sigma;
}
