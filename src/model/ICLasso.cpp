//
// Created by Liuyu Jin on Jun 9, 2016.
//

#include "ICLasso.hpp"
#include <Eigen/Dense>
#include <boost/math/distributions.hpp>
#include <math.h>
#include <unordered_map>
#include <iostream>

#ifdef BAZEL
#include "model/ModelOptions.hpp"
#else
#include "ModelOptions.hpp"
#endif

using namespace Eigen;
using namespace std;


ICLasso::ICLasso(double l1 = 1, double l2 = 1, double g = 1) {
    lambda1 = l1;
    lambda2 = l2;
    gamma = g;
};

void ICLasso::set_X(MatrixXd new_X){
    X = new_X;
};

void ICLasso::set_Y(MatrixXd new_Y){
    Y = new_Y;
};

void ICLasso::set_XY(MatrixXd new_X, MatrixXd new_Y){
    X = new_X;
    Y = new_Y;
    //initialize Beta here
    Beta = MatrixXd::Random(X.cols(),Y.rows());
};

void ICLasso::set_lambda1(double new_l){
    lambda1 = new_l;
};

void ICLasso::set_lambda2(double new_l){
    lambda2 = new_l;
};

void ICLasso::set_gamma(double new_g){
    gamma = new_g;
};

void ICLasso::set_theta(MatrixXd new_t){
    Theta = new_t;
};

/* helpers for cost */
double square(double a){
    return a*a;
};

MatrixXd cov(MatrixXd X){
  MatrixXd centered = X.rowwise() - X.colwise().mean();
  MatrixXd result = (centered.adjoint() * centered) / double(X.rows() - 1);
  return result;
};

double sign(double x){
    if (x > 0) return 1;
    if (x < 0) return -1;
    return 0;
}；

/* end helpers for cost */

double ICLasso::cost() {
    int n = X.cols();
    MatrixXd YXBeta = Y-X*Beta;
    MatrixXd squared = YXBeta.unaryExpr(std::ptr_fun(square<double>));
    double loss1 = squared.sum()/n;
    double loss2 = (cov(Y)*Theta).trace() - log(Theta.determinant());
    double pen1 = Beta.abs().sum();
    double pen2 = Theta.abs().sum();
    double pen3 = 0;
    int size_T = Theta.rows();
    for (int i = 0; i < size_T; i++){
        for (int j = i+1; j < size_T; j++){
            incr = ((Beta.col(i) + sign(Theta(i,j))*Beta.col(j)).abs().sum());
            pen3 = pen3 + abs(Theta(i, j))*incr;
        }
    }
    return loss1 + loss2 + lambda1 * pen1 + lambda2 * pen2 + gamma * pen3;
};

/* Helpers for optimize_theta */
double cost_theta(MatrixXd S, MatrixXd Beta, MatrixXd Theta, lambda, gamma) {
    double loss = (S*Theta).trace()-log(Theta.determinant());
    double pen2 = Theta.abs().sum();
    double pen3 = 0;
    int size_T = Theta.rows();
    for (int i = 0; i < size_T; i++){
        for (int j = i+1; j < size_T; j++){
            incr = ((Beta.col(i) + sign(Theta(i,j))*Beta.col(j)).abs().sum());
            pen3 = pen3 + abs(Theta(i, j))*incr;
        }
    }
    return loss + lambda * pen2 + gamma * pen3;
};


MatrixXd remove_row(MatrixXd X, int j){
    int numRows = X.rows()-1;
    int numCols = X.cols();
    MatrixXd result = MatrixXd::Zero(numRows, numCols);
    result.block(0, 0, j, numCols) = X.block(0, 0, j, numCols);
    result.block(j, 0, numRows-j, numCols) = X.block(j+1, 0, numRows-j, numCols);
    return result;
};

MatrixXd remove_col(MatrixXd X, int j){
    int numRows = X.rows();
    int numCols = X.cols() - 1;
    MatrixXd result = MatrixXd::Zero(numRows, numCols);
    result.block(0, 0, numRows, j) = X.block(0, 0, numRows, j);
    result.block(0, j, numRows, numCols - j) = X.block(0, j+1, numRows, numCols-j);
    return result;
};

void change_theta(MatrixXd C, int j){
    for (int i = 0; i < Theta.cols(); i++){
        if (i != j){
            Theta(i, j) = Theta(j, j) * C(i, j);
        }
    }
};

void symmetrize(int j){
    for (int i = 0; i < Theta.cols(); i++){
        if (i != j){
            Theta(j, i) = Theta(i, j);
        }
    }
};

double bound_below(double a){
    return max(a, 0);
}

//Two return values?
MatrixXd optimize_block_coord(MatrixXd, S, int maxiter, double a, double b){
    int p = X.cols();
    Beta = MatrixXd::Zero(p, 1);
    MatrixXd oldBeta;
    for (int i = 0; i < maxiter; i++){
        oldBeta = Beta;
        Beta = update_beta_mex(X,S,a,b,lambda,gamma,Beta);
        if ((Beta-oldBeta).norm() < 1e-3) break;
    }
    return -X*(Beta.unaryExpr(std::ptr_fun(bound_below<double>))-
              (-Beta).unaryExpr(std::ptr_fun(bound_below<double>)));
}


//DONE
MatrixXd fused_prox_vector(MatrixXd beta, MatrixXd u, MatrixXd l){
    int len = beta.rows();
    w = MatrixXd::Zero(len, 1);
    for (int i = 0; i < len; i++){
        double beta_c = beta(i, 0);
        double u_c = u(i, 0);
        double l_c = l(i, 0);
        if (beta_c > u_c){
            beta(i, 0) = beta_c - u_c;
        } else if (beta_c < l_c){
            beta(i, 0) = beta_c - l_c;
        }
    }
    return w;

}

//DONE
double fused_prox_scalar(double beta, double u, double l){
    if (beta > u){
        return beta - u;
    } else if (beta < l){
        return beta - l;
    } else {
        return 0;
    }

}

MatrixXd optimize_block_prox(MatrixXd S, int maxiter, double a, double b){

    //get dimension
    int n = X.rows();

    //initialize variables
    Beta = MatrixXd::Zero(n, 1);
    MatrixXd w = Beta;
    theta = 1;
    L = 10;
    objVals = MatrixXd::Zero(maxiter, 1);

    //grad?
    MatrixXd h_w;
    double grad, z, upper, lower;

    //optimize Beta
    for (int iter = 0; iter < maxiter; iter++){
        //computer gradient
        grad = (X*w) + s;

        //compute new estimate of beta using line search
        h_w = w.transpose()*X*w/2 + s.transpose()*w;
        while (true){
            z = w - (1/L)*grad;
            upper = (gamma*a + lambda)/L;
            lower = -(gamma*b + lambda)/L;
            beta_new = fused_prox_vector(z,upper,lower);
            h_beta = beta_new.transpose()*X*beta_new/2 + s.transpose()*beta_new;
            Q = h_w + (beta_new-w).transpose()*grad
                + L*((beta_new-w).cwiseProduct(beta_new-w)).sum()/2;
            if (h_beta <= Q) break;
            else L = 2*L;

            //update w and theta
            theta_new = (1 + sqrt(1 + 4*theta*theta))/2;
            w = beta_new + (theta-1)/(theta_new)*(beta_new-beta);

            //store current objective value
            objVals(iter, 0) = h_beta + (gamma*a+lambda).transpose()*
                               beta_new.unaryExpr(std::ptr_fun(bound_below<double>) + 
                               (gamma*b+lambda).transpose()*
                               (-beta_new).unaryExpr(std::ptr_fun(bound_below<double>);

            //store new variables
            beta = beta_new;
            theta = theta_new;
                    % check convergence
            if (iter >= 5 && abs(objVals(iter, 0)-objVals(iter-1, 0))/abs(objVals(iter-1, 0)) < 1e-8)
            break;


        }
    }

    //calculate sigma
    sigma = -X*(beta_new.unaryExpr(std::ptr_fun(bound_below<double>)-
                (-beta_new).unaryExpr(std::ptr_fun(bound_below<double>));
    return sigma;


}



/* end helpers for optimize_theta */

/* ISSUES: 1. index starting at 1? Resolved
           2. options? Resolved
           3. add new files?
           4. compile new files?
*/
void ICLasso::optimize_theta(){

    //get dimensions ISSUE
    int q = Y.rows();

    //precompute sample covariance & penalty matrices
    MatrixXd S = cov(Y);
    MatrixXd A = MatrixXd::Zero(q, q);
    MatrixXd B = MatrixXd::Zero(q, q);
    for (int j = 0; j < q; j++){
        for (int k = 0; k < q; k++){
            A(j, k) = abs(Beta.col(j) + Beta.col(k)).abs().sum()/2;
            B(j, k) = abs(Beta.col(j) - Beta.col(k)).abs().sum()/2;
        }
        A(j, j) = 0;
        B(j, j) = 0;
    }
    int maxiter = 10000;
    double tol = 1e-4;
    MatrixXd C, s, a, b;

    //store objective values and run times
    MatrixXd objVals = MatrixXd::Zero(maxiter, 1);

    //initialize values;
    MatrixXd Sigma = S + lambda * MatrixXd::Identity(q, q);

    int i = 0;
    //run optimization to obtain estimate of covariance
    for (int iter = 0; iter < option.maxiter; iter++){
        //iterate through each block
        C = MatrixXd::Zero(q, q);
        for (int j = 0; j < q; j++){
            X = remove_col(remove_row(Sigma, j), j);
            s = remove_row(S, j);
            a = remove_row(A, j);
            b = remove_row(B, j);
            //update sigma ISSUE
            MatrixXd sigma_j, beta;
            sigma_j = optimize_block_coord(s, maxiter, a, b);
            for (i = 0; i < S.rows(); i++){
                if (i != j) {
                    Sigma(i, j) = sigma_j(i, 0);
                    Sigma(j, i) = sigma_j(i, 0);
                }
            }
            //store beta
            for (i = 0; i < C.rows(); i++){
                if (i != j){
                    C(i, j) = beta(i, 0);
                }
            }
        }
        objVals(iter) = cost_theta(S, Beta, Sigma.inverse(), lambda, gamma);
        //check for convergence 
        if (iter >= 10 && abs(objVals(iter)-objVals(iter-1))/abs(objVals(iter-1)) < tol)
        {break;}

    }




    //calculate inverse covariance
    Theta = MatrixXd::Zero(q, q);
    for (int j = 0; j < q; j++){
        MatrixXd removed_Sigma = remove_row(Sigma, j);
        MatrixXd removed_C = remove_row(C, j);
        Theta(j, j) = 1/(Sigma(j, j) + 
               (removed_Sigma.col(j).transpose() * removed_C.col(j))(0, 0));
        change_theta(C, j);
        symmetrize(j);
    }

};