//
// Created by haohanwang on 1/24/16.
//

#include "LinearRegression.hpp"
#include <Eigen/Dense>

using namespace Eigen;

void LinearRegression::setL1_reg(float l1) { L1_reg = l1; };

void LinearRegression::setL2_reg(float l2) { L2_reg = l2; };

double LinearRegression::cost() {
    float size = float(y.size());
    return 0.5 * ((y - X * beta).squaredNorm() / size + L1_reg * beta.lpNorm<1>() + L2_reg * beta.norm())/X.rows();
};

VectorXd LinearRegression::derivative() {
    return ((-1.0 * X.transpose() * (y - X * beta)).array() + L1_reg * (beta.array() / beta.cwiseAbs().array()).sum() +
           L2_reg * beta.sum()).matrix();
};

VectorXd LinearRegression::proximal_derivative() {
    return -1.0 * X.transpose() * (y - X * beta);
};

LinearRegression::LinearRegression() {
    L1_reg = 0;
    L2_reg = 0;
};

VectorXd LinearRegression::proximal_operator(VectorXd in, float lr) {
    if (L1_reg != 0 && L2_reg == 0){
        VectorXd sign = ((in.array()>0).matrix()).cast<double>();//sign
        sign += -1.0*((in.array()<0).matrix()).cast<double>();
        in = ((in.array().abs()-lr*L1_reg).max(0)).matrix();//proximal
        return (in.array()*sign.array()).matrix();//proximal multipled back with sign
    }
    else if (L2_reg != 0){
        return in/(1+2*lr*L2_reg);
//        if (in.norm() > L2_reg){
//            double s = 1-L2_reg/in.norm();
//            return s*in;
//        }
//        else {
//            long s = in.size();
//            return VectorXd::Zero(s);
//        }
    }
    else{
        VectorXd sign = ((in.array()>0).matrix()).cast<double>();
        sign += -1.0*((in.array()<0).matrix()).cast<double>();
        in = ((in.array().abs()-lr*L1_reg).max(0)).matrix();
        in = in.array()*sign.array()/(1+2*lr*L2_reg);
        return in.matrix();
    }
}
