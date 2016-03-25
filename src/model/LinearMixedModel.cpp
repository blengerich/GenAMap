/*
 * LinearMixedModel.cpp
 *
 *  Created on: Mar 17, 2016
 *      Author: Aditya Gautam (agautam1@andrew.cmu.edu)
 */
#include "LinearMixedModel.hpp"
using namespace Eigen;

LinearMixedModel::LinearMixedModel() {
    cout << "LMM: No input parameters provided !" << endl;
    n = 0;
    d = 0;
    lambda_start_point = -10.0;
    lambda_end_point = 10.0;
    lambda_interval = 0.2;
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
    
    // Set the default params for Grid search
    set_lambda_params(10.0,-10.0,0.2);
}

void LinearMixedModel::train(MatrixXd X, MatrixXd Y, MatrixXd K){
    
    cout << "Training set X,Y and K are provided !" << endl;
    this->X = X;
    this->Y = Y;
    this->K = K;
    
    // Initialize beta and mau to some random values
    this->beta = MatrixXd::Random(X.cols(),Y.rows());
    this->mau = MatrixXd(n,1);
    
    // Set the default params for Grid search
    set_lambda_params(10.0,-10.0,0.2);
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

void LinearMixedModel::shift_lambda_window(double shift) {
    this->lambda_start_point += shift;
    this->lambda_end_point += shift;
}

double LinearMixedModel::get_lambda_end_value(){
    return this->lambda_end_point;
}

void LinearMixedModel::set_U(MatrixXd U){
    this->U = U;
}

void LinearMixedModel::set_S(MatrixXd S){
    this->S = S;
}

int LinearMixedModel::get_num_samples() {
    return this->n;
}

void LinearMixedModel::set_brent_tol_err(double err) {
    this->brent_tol_error = err;
}

double LinearMixedModel::get_brent_tol_err() {
    return this->brent_tol_error;
}

// Decomposition of Similarity Matrix -> to be done later
void LinearMixedModel::decomposition(){
    
}

// This method will give Beta matrix as a function of the Lambda Matrix.

MatrixXd LinearMixedModel::calculate_beta(double lambda){
    
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
    return first_term*second_term;
}

// This method will give the value of sigma as a function of beta and lambda.
double LinearMixedModel::calculate_sigma(double lambda){
    
    double ret_val=0.0,temp_val=0.0;
    MatrixXd U_tran_Y = U.transpose()*Y; // n*1
    MatrixXd U_tran_X = U.transpose()*X; // n*d
    MatrixXd beta_matrix = calculate_beta(lambda);
    
    for(int i=1;i<=n;i++){
        //temp_val = (U_tran_Y(i,1) - (U_tran_X.col(i))*beta_matrix)/(S(i,i) + lambda);
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
    
    first_term = (n)*log(2*M_PI) + n;
    
    for(int i=1;i<=n;i++){
        second_term += log( double(S(i,i) + lambda));
    }
    
    third_term = n*log(calculate_sigma(lambda)/n);
    ret_val = first_term + second_term + third_term;
    ret_val = -1/2*ret_val;
    return ret_val;
}

/* This function finds the value of lambda for which the log
 */
void LinearMixedModel::find_max_log_likelihood_grid_search(){
    
    double start_val = this->get_lambda_start_value(), end_val = get_lambda_end_value();
    double interval = this->get_lambda_interval(), max_likelihood =0.0,current_log_likelihood =0.0;
    double temp_likehood=0.0,best_lambda=-1;
    
    /* Do Grid search on the likelihood function and see for which lambda, it is getting to
     * the maximum. Maximum likelihood means the most optimal solution.
     */
    
    for(double val = start_val;val<=end_val;val=val+interval){
        current_log_likelihood = get_log_likelihood_value(val);
        
        if(current_log_likelihood >= max_likelihood){
            max_likelihood = current_log_likelihood;
            best_lambda = val;
        }
    }
    
    cout << "Best Likelihood occurs at lambda = " <<  best_lambda << endl;
    
    /* Now, we have the best lambda value, get sigma and calculate the best beta matrix
     * corresponding to this Lambda and sigma values. */
    this->lambda_optimized = best_lambda;
    this->sigma = calculate_sigma(best_lambda);
    this->beta = calculate_beta(best_lambda);
}

/*
 This method is the wrapper function to find the optimal lambda value using
 the brent search. It is assumed that the Interval of Lambda is already set.
 If not, then set the value before using this function else default will be used.
 */
void LinearMixedModel::find_max_log_likelihood_brent_search(){
    
    double start_point = this->lambda_start_point, end_point = this->lambda_end_point;
    double optimal_lambda =0.0, tolerance_error = get_brent_tol_err(),min_neg_likelihood_val=0.0;
    
    min_neg_likelihood_val = brent_search(start_point,end_point,(start_point+end_point)/2,0.0,
                                          tolerance_error,tolerance_error,optimal_lambda);
    
    cout << "Max loglikelihood using brent search = " << -1*min_neg_likelihood_val << endl;
    
    /* Now, we have the best lambda value, get sigma and calculate the best beta matrix
     * corresponding to this Lambda and sigma values. */
    this->lambda_optimized = optimal_lambda;
    this->sigma = calculate_sigma(optimal_lambda);
    this->beta = calculate_beta(optimal_lambda);
}

/*
 * This function is negative of log likehood function and will be used as an objective
 * function in the brent method. Since brent method aims at miniming the log likehood
 * So, we need to have negative log likelihood function.
 * Name is kept to be f for simplicity.
 */
double LinearMixedModel::f(double lambda){
    return -1*(this->get_log_likelihood_value(lambda));
}

/* Brent's search for finding a global minimum between the given interval [a,b].
 *    Parameters:
 a, b -> Starting point and the end point of the search
 c -> Prior knowledge about the global minimum point
 m -> Bound on second derivative (keep it to 0 as of now)
 e -> positive tolerance parameter
 t -> Positive error tolerance.
 x -> Value at which the objective function is attaining the minimal value.
 
 This Method and functions is inspired from Brent search :
 https://en.wikipedia.org/wiki/Brent%27s_method
 
 */
double LinearMixedModel::brent_search(double a, double b, double c, double m, double e, double t,double &x) {
    
    double a0,a2,a3,d0,d1,d2,h,m2,macheps,p,q,qs,r,s,sc,y,y0,y1,y2,y3,yb,z0,z1,z2;
    int k;
    
    a0 = b;
    x = a0;
    a2 = a;
    y0 = f(b);
    yb = y0;
    y2 = f(a);
    y = y2;
    
    if ( y0 < y ) {
        y = y0;
    }
    else {
        x = a;
    }
    
    if ( m <= 0.0 || b <= a ) {
        return y;
    }
    
    macheps = t*t;
    
    m2 = 0.5 * ( 1.0 + 16.0 * macheps ) * m;
    
    if ( c <= a || b <= c ) {
        sc = 0.5 * ( a + b );
    }
    else {
        sc = c;
    }
    
    y1 = f ( sc );
    k = 3;
    d0 = a2 - sc;
    h = 9.0 / 11.0;
    
    if ( y1 < y ) {
        x = sc;
        y = y1;
    }
    
    while(1) {
        
        d1 = a2 - a0;
        d2 = sc - a0;
        z2 = b - a2;
        z0 = y2 - y1;
        z1 = y2 - y0;
        r = d1 * d1 * z0 - d0 * d0 * z1;
        p = r;
        qs = 2.0 * ( d0 * z1 - d1 * z0 );
        q = qs;
        
        if ( k < 1000000 || y2 <= y )
        {
            while(1)
            {
                if ( q * ( r * ( yb - y2 ) + z2 * q * ( ( y2 - y ) + t ) ) <
                    z2 * m2 * r * ( z2 * q - r ) )
                {
                    a3 = a2 + r / q;
                    y3 = f ( a3 );
                    
                    if ( y3 < y ) {
                        x = a3;
                        y = y3;
                    }
                }
                k = ( ( 1611 * k ) % 1048576 );
                q = 1.0;
                r = ( b - a ) * 0.00001 * ( double ) ( k );
                
                if ( z2 <= r ){
                    break;
                }
            }
        }
        else
        {
            k = ( ( 1611 * k ) % 1048576 );
            q = 1.0;
            r = ( b - a ) * 0.00001 * ( double ) ( k );
            
            while ( r < z2 )
            {
                if ( q * ( r * ( yb - y2 ) + z2 * q * ( ( y2 - y ) + t ) ) <
                    z2 * m2 * r * ( z2 * q - r ) )
                {
                    a3 = a2 + r / q;
                    y3 = f ( a3 );
                    
                    if ( y3 < y )
                    {
                        x = a3;
                        y = y3;
                    }
                }
                k = ( ( 1611 * k ) % 1048576 );
                q = 1.0;
                r = ( b - a ) * 0.00001 * ( double ) ( k );
            }
        }
        
        r = m2 * d0 * d1 * d2;
        s = sqrt ( ( ( y2 - y ) + t ) / m2 );
        h = 0.5 * ( 1.0 + h );
        p = h * ( p + 2.0 * r * s );
        q = q + 0.5 * qs;
        r = - 0.5 * ( d0 + ( z0 + 2.01 * e ) / ( d0 * m2 ) );
        
        if ( r < s || d0 < 0.0 ) {
            r = a2 + s;
        }
        else {
            r = a2 + r;
        }
        
        if ( p*q > 0 ) {
            a3 = a2 + p / q;
        }
        else {
            a3 = r;
        }
        
        while(1) {
            
            a3 = max(a3,r);
            
            if ( b <= a3 ){
                a3 = b;
                y3 = yb;
            } else {
                y3 = f ( a3 );
            }
            
            if ( y3 < y ) {
                x = a3;
                y = y3;
            }
            
            d0 = a3 - a2;
            
            if ( a3 <= r )
            break;
            
            p = 2.0 * ( y2 - y3 ) / ( m * d0 );
            
            if ( ( 1.0 + 9.0 * macheps ) * d0 <= abs(p) )
            break;
            
            if ( 0.5 * m2 * ( d0 * d0 + p * p ) <= ( y2 - y ) + ( y3 - y ) + 2.0 * t )
            break;
            
            a3 = 0.5 * ( a2 + a3 );
            h = 0.9 * h;
        }
        
        if ( b <= a3 )
        break;
        
        a0 = sc;
        sc = a2;
        a2 = a3;
        y0 = y1;
        y1 = y2;
        y2 = y3;
    }
    
    cout << "Brent Search : Optimal neg loglikelihood = " << y << " at lambda = "  << x << endl;
    return y;
}