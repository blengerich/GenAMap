//
// Created by weifang on 2/19/17.
//

#include "NeighborSelection.hpp"

#include <Eigen/Dense>
#include <stdexcept>
#include <iostream>
#include <unordered_map>

#ifdef BAZEL
#include "../Models/ModelOptions.hpp"
#else
#include "ModelOptions.hpp"
#endif

using namespace Eigen;
using namespace std;


NeighborSelection::NeighborSelection() {
    L1_reg = default_L1_reg;
    L2_reg = default_L2_reg;
    betaAll = MatrixXf::Ones(1,1);
};


NeighborSelection::NeighborSelection(const unordered_map<string, string>& options) {
    try {
        L1_reg = stof(options.at("lambda"));
    } catch (std::out_of_range& oor) {
        L1_reg = default_L1_reg;
    }
    try {
        L2_reg = stof(options.at("L2_lambda"));
    } catch (std::out_of_range& oor) {
        L2_reg = default_L2_reg;
    }
    betaAll = MatrixXf::Ones(1,1);
};

void NeighborSelection::assertReadyToRun() {
    // X should not be empty
    const bool ready = ((X.rows() > 0) && (X.cols() > 0));
    const string err_str = "X is empty.";
    if (!ready) {
        throw runtime_error(err_str);
    }
}

void NeighborSelection::setL1_reg(float l1) { L1_reg = l1; };

void NeighborSelection::setL2_reg(float l2) { L2_reg = l2; };

void NeighborSelection::zeroBetaAt(int idx) {
    beta(idx) = 0;
}

float NeighborSelection::cost() {
    return 0.5 * (y - X * beta).squaredNorm()/X.rows() + L1_reg * beta.lpNorm<1>() + L2_reg * beta.squaredNorm();
};

MatrixXf NeighborSelection::derivative() {
    return ((-1.0 * X.transpose() * (y - X * beta)).array() + L1_reg * (beta.array() / beta.cwiseAbs().array()).sum() +
           L2_reg * beta.sum()).matrix();
};

MatrixXf NeighborSelection::proximal_derivative() {
    return -1.0 * X.transpose() * (y - X * beta);
};

MatrixXf NeighborSelection::proximal_operator(VectorXf in, float lr) {
    if (L1_reg == 0 && L2_reg == 0){
        return in;
    }
    if (L1_reg != 0 && L2_reg == 0){
        VectorXf sign = ((in.array()>0).matrix()).cast<float>();//sign
        sign += -1.0*((in.array()<0).matrix()).cast<float>();
        in = ((in.array().abs()-lr*L1_reg).max(0)).matrix();//proximal
        return (in.array()*sign.array()).matrix();//proximal multipled back with sign
    }
    else if (L2_reg != 0){
        return in/(1+2*lr*L2_reg);
    }
    else{
        VectorXf sign = ((in.array()>0).matrix()).cast<float>();
        sign += -1.0*((in.array()<0).matrix()).cast<float>();
        in = ((in.array().abs()-lr*L1_reg).max(0)).matrix();
        in = in.array()*sign.array()/(1+2*lr*L2_reg);
        return in.matrix();
    }
}

void NeighborSelection::updateBetaAll(MatrixXf b) {
    if (betaAll.rows() == 1){
        betaAll = b;
    }
    else{
        betaAll.conservativeResize(betaAll.rows(),betaAll.cols()+1);
        betaAll.col(betaAll.cols()-1) = b;
    }
}

MatrixXf NeighborSelection::getBetaAll() {
    return betaAll;
}

float NeighborSelection::getL1_reg() {
    return L1_reg;
}

float NeighborSelection::getL2_reg() {
    return L2_reg;
}
