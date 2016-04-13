//
// Created by haohanwang on 1/31/16.
//

#include "IterativeUpdate.hpp"
#include <limits>
#include <map>

using namespace std;

IterativeUpdate::IterativeUpdate(const map<string, string>& options) {
    // TODO
    /*try {
        setTolerance(stof(options.find("tolerance")->second));
    } catch (exception& e) {}*/
}

void IterativeUpdate::setTolerance(double t) {tol = t;}

void IterativeUpdate::run(TreeLasso* tl) {
    double i = 0;
    MatrixXd bestBeta = tl->getBeta();
    tl->initIterativeUpdate();
    while (i < maxIteration){
        progress = i/maxIteration;
        residue = tl->cost();
        if (residue < prev_residue){
            bestBeta = tl->getBeta();
        }
        if (abs(prev_residue-residue)<tol){
            break;
        }
        else{
            prev_residue = residue;
        }
        tl->updateMD();
        tl->updateBeta();
        i +=1;
    }
    tl->updateBeta(bestBeta);
}

IterativeUpdate::IterativeUpdate() {
    tol = 1e-5;
    prev_residue = numeric_limits<double>::max();
}