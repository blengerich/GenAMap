//
// Created by haohanwang on 6/14/16.
//

#include "SparseLMM.h"

SparseLMM::SparseLMM() {
    K = MatrixXf::Zero(1,1);
    S = MatrixXf::Zero(1,1);
    initFlag = false;
}

SparseLMM::SparseLMM(const unordered_map<string, string> &options) {
    K = MatrixXf::Zero(1,1);
    S = MatrixXf::Zero(1,1);
    initFlag = false;
    try {
        l1Reg = stof(options.at("lambda"));
    } catch(std::out_of_range& oor) {
        l1Reg = default_l1Reg;
    }
}


void SparseLMM::rotateXY(double lambda) {
    MatrixXf Id(n, n); // n*n
    Id.setIdentity(n, n);
    MatrixXf U_trans = U.transpose(); // n*n
    MatrixXf U_trans_X = U_trans * X; // n*d
    MatrixXf U_trans_Y = U_trans * y; // n*1
    MatrixXf S_lambda = (S + lambda * Id);
    rX = S_lambda * U_trans_X;
    rY = S_lambda * U_trans_Y;
}

MatrixXf SparseLMM::getRotatedX() {
    return rX;
}

MatrixXf SparseLMM::getRoattedY() {
    return rY;
}

void SparseLMM::setL1reg(double d) {
    l1Reg = d;
}

double SparseLMM::getL1reg() {
    return l1Reg;
}
