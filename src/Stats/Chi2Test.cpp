//
// Created by haohanwang on 8/22/16.
//

#include "Chi2Test.h"

void Chi2Test::run() {
    long c = X.cols();
    long r = X.rows();
    long aa = 0, ab = 0, ac = 0, ba = 0, bb = 0, bc = 0;
    float pa = 0;
    double chi = 0;
    VectorXd e = VectorXd::Zero(4);
    VectorXd o = VectorXd::Zero(4);
    long t = y.cols();
    for (long k = 0; k < t && !shouldStop; k++) {
        for (long j = 0; j < c && !shouldStop; j++) {
            progress = float(k*c+j)/(t*c);
            for (long i = 0; i < r && !shouldStop; i++) {
                if (y(i, k) == 0) {
                    if (genoType == 1) {
                        if (X(i, j) == 0) {
                            aa += 1;
                        }
                        else {
                            ac += 1;
                        }
                    }
                    else {
                        if (X(i, j) == 0) {
                            aa += 1;
                        }
                        else if (X(i, j) == 1) {
                            ab += 1;
                        }
                        else {
                            ac += 1;
                        }
                    }
                }
                else {
                    if (genoType == 1) {
                        if (X(i, j) == 0) {
                            ba += 1;
                        }
                        else {
                            bc += 1;
                        }
                    }
                    else {
                        if (X(i, j) == 0) {
                            ba += 1;
                        }
                        else if (X(i, j) == 1) {
                            bb += 1;
                        }
                        else {
                            bc += 1;
                        }
                    }
                }
            }
            o(0) = 2 * aa + ab;
            o(1) = 2 * ba + bb;
            o(2) = 2 * ac + ab;
            o(3) = 2 * bc + bb;
            pa = float(o(0) + o(1))/(o.sum());
            e(0) = (o(0) + o(2))*pa;
            e(1) = (o(1) + o(3))*pa;
            e(2) = (o(0) + o(2))*(1-pa);
            e(3) = (o(1) + o(3))*(1-pa);
            chi = Stats::ChiSquaredTest(o, e);
            beta(j, k) = Stats::ChiToPValue(chi, 1);
        }
    }
    BonferroniCorrection();
}

Chi2Test::Chi2Test(const unordered_map<string, string> &options) {
    string tmp;
    try {
        tmp = options.at("correctNum");
        if (tmp.compare("Bonferroni correction") == 0){
            correct = true;
        }
        else{
            correct = false;
        }
    } catch (std::out_of_range& oor) {
        correct = true;
    }
}
