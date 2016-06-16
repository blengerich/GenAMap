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

double ICLasso::cost() {
    int n = X.cols();
    MatrixXd YXBeta = Y-X*Beta;
    MatrixXd squared = YXBeta.unaryExpr(std::ptr_fun(square<double>));
    double loss1 = squared.sum()/n;
    double loss2 = (cov(Y)*Theta).trace() - log(Theta.determinant());
    double pen1 = Beta.abs().sum();
    double pen2 = Theta.abs().sum();
    double pen3 = 0;
    int size_T;
    for (int i = 1; i < size_T; i++){
        for (int j = i+1; j < size_T; j++){
            incr = ((Beta.col(i) + sign(Theta(i,j))*Beta.col(j)).abs().sum());
            pen3 = pen3 + abs(Theta(i, j))*incr;
        }
    }
    return loss1 + loss2 + lambda1 * pen1 + lambda2 * pen2 + gamma * pen3;
};