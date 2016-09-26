//
// Created by haohanwang on 8/22/16.
//

#include "FisherTest.h"

void FisherTest::run() {
    long c = X.cols();
    long r = X.rows();
    long aa = 0, ab = 0, ac = 0, ba = 0, bb = 0, bc = 0;
    MatrixXd o = MatrixXd::Zero(2, 2);
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
            o(0, 0) = 2 * aa + ab;
            o(0, 1) = 2 * ba + bb;
            o(1, 0) = 2 * ac + ab;
            o(1, 1) = 2 * bc + bb;
            beta(j, k) = Stats::FisherExactTest(o);
        }
    }
    BonferroniCorrection();
}

FisherTest::FisherTest(const unordered_map<string, string> & options) {
    string tmp;
    try {
        tmp = options.at("correctNum");
        if (tmp.compare("Bonferroni correction") == 0){
            shouldCorrect = true;
        }
        else{
            shouldCorrect = false;
        }
    } catch (std::out_of_range& oor) {
        shouldCorrect = true;
    }
}
