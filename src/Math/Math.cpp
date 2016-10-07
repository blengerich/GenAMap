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
    double var1 = std(v1);
    double var2 = std(v2);
    if (var1 == 0 or var2 == 0){
        return 0;
    }
    return cov / (var1 * var2);
}

double Math::std(VectorXd v) {
    double mean = v.mean();
    v = (v.array() - mean).matrix();
    return sqrt(v.squaredNorm() / v.size());
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

MatrixXd Math::pinv(MatrixXd xd) {
    JacobiSVD<MatrixXd> svd(xd, ComputeThinU | ComputeThinV);
    MatrixXd tmpS = svd.singularValues();
    MatrixXd U = svd.matrixU();
    MatrixXd V = svd.matrixV();
    MatrixXd invS = MatrixXd::Zero(tmpS.rows(), tmpS.rows());
    for (long i = 0; i<tmpS.rows(); i++){
        if (tmpS(i, 0) !=0){
            invS(i, i) = 1/tmpS(i, 0);
        }
    }
    return U*invS*V;
}
