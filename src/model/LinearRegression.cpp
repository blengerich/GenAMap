//
// Created by haohanwang on 1/24/16.
//

#include "LinearRegression.hpp"
#include <Eigen/Dense>

#include "ModelOptions.hpp"

using namespace Eigen;


LinearRegression::LinearRegression() {
    L1_reg = 0;
    L2_reg = 0;
};


LinearRegression::LinearRegression(const ModelOptions_t& options) {
    L1_reg = 0;
    L2_reg = 0;
}


void LinearRegression::setL1_reg(float l1) { L1_reg = l1; };

void LinearRegression::setL2_reg(float l2) { L2_reg = l2; };

double LinearRegression::cost() {
    return 0.5 * (y - X * beta).squaredNorm()/X.rows() + L1_reg * beta.lpNorm<1>() + L2_reg * beta.squaredNorm();
};

MatrixXd LinearRegression::derivative() {
    return ((-1.0 * X.transpose() * (y - X * beta)).array() + L1_reg * (beta.array() / beta.cwiseAbs().array()).sum() +
           L2_reg * beta.sum()).matrix();
};

MatrixXd LinearRegression::proximal_derivative() {
    return -1.0 * X.transpose() * (y - X * beta);
};

MatrixXd LinearRegression::proximal_operator(VectorXd in, float lr) {
    if (L1_reg == 0 && L2_reg == 0){
        return in;
    }
    if (L1_reg != 0 && L2_reg == 0){
        VectorXd sign = ((in.array()>0).matrix()).cast<double>();//sign
        sign += -1.0*((in.array()<0).matrix()).cast<double>();
        in = ((in.array().abs()-lr*L1_reg).max(0)).matrix();//proximal
        return (in.array()*sign.array()).matrix();//proximal multipled back with sign
    }
    else if (L2_reg != 0){
        return in/(1+2*lr*L2_reg);
    }
    else{
        VectorXd sign = ((in.array()>0).matrix()).cast<double>();
        sign += -1.0*((in.array()<0).matrix()).cast<double>();
        in = ((in.array().abs()-lr*L1_reg).max(0)).matrix();
        in = in.array()*sign.array()/(1+2*lr*L2_reg);
        return in.matrix();
    }
}
