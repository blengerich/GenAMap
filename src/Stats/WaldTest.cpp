//
// Created by haohanwang on 8/22/16.
//

#include "WaldTest.h"
#include "Math/Math.hpp"

void WaldTest::run() {
    MatrixXd X0 = MatrixXd::Ones(X.rows(), 1);
    X.conservativeResize(X.rows(),X.cols()+1);
    X.col(X.cols()-1) = X0;

    MatrixXd beta0 = (X.transpose()*X).inverse()*X.transpose()*y;
    for (long i=0;i<beta.rows();i++){
        beta.row(i) = beta0.row(i);
    }
    for (long j=0;j<beta.cols();j++){
        beta.col(j) = beta.col(j)/Math::getInstance().variance(beta.col(j));
    }
    BonferroniCorrection();
}
