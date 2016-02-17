//
// Created by haohanwang on 2/8/16.
//

#include "Math.hpp"

double Math::variance(VectorXd v) {
    double mean = v.mean();
    v = (v.array() - mean).matrix();
    return v.squaredNorm() / v.size();
}

double Math::covariance(VectorXd v1, VectorXd v2) {
    double m1 = v1.mean();
    double m2 = v2.mean();
    return ((v1.array() - m1) * (v2.array() - m2)).matrix().mean();
}

double Math::correlation(VectorXd v1, VectorXd v2) {
    double cov = covariance(v1, v2);
    double var1 = variance(v1);
    double var2 = variance(v2);
    return cov / (var1 * var2);
}

double Math::std(VectorXd v) {
    double mean = v.mean();
    v = (v.array() - mean).matrix();
    return v.norm() / v.size();
}

void Math::removeCol(MatrixXd *mptr, long y) {
    long numRows = mptr->rows();
    long numCols = mptr->cols() - 1;

    if (y < numCols)
        mptr->block(0, y, numRows, numCols - y) = mptr->block(0, y + 1, numRows, numCols - y);

    mptr->conservativeResize(numRows, numCols);
}

VectorXd Math::L2Thresholding(VectorXd in) {
    if (in.norm()>1){
        return in/in.norm();
    }
    else{
        return in;
    }
}