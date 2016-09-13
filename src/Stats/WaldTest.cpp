//
// Created by haohanwang on 8/22/16.
//

#include "WaldTest.h"
#ifdef BAZEL
#include "Math/Math.hpp"
#else
#include "../Math/Math.hpp"
#endif

void WaldTest::run() {
    MatrixXd X0 = MatrixXd::Ones(X.rows(), 1);
    X.conservativeResize(X.rows(),X.cols()+1);
    X.col(X.cols()-1) = X0;

    MatrixXd beta0 = (X.transpose()*X).inverse()*X.transpose()*y;
    long r = beta.rows();
    long c = beta.cols();
    for (long i=0;i<beta.rows() && !shouldStop;i++){
        progress = float(i)/(r+c);
        beta.row(i) = beta0.row(i);
    }
    for (long j=0;j<beta.cols() && !shouldStop;j++){
        progress = float(r+j)/(r+c);
        beta.col(j) = beta.col(j)/Math::getInstance().variance(beta.col(j));
    }
    BonferroniCorrection();
}
