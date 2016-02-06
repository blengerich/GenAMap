//
// Created by haohanwang on 2/2/16.
//

#include "MultiPopLasso.hpp"

void MultiPopLasso::setLambda(double l) { lambda = l; }

void MultiPopLasso::setPopulation(VectorXd pop) {population = pop; }

double MultiPopLasso::cost() {
    return 0.5*(y - X * beta).squaredNorm() + lambda * groupPenalization();
}

double MultiPopLasso::groupPenalization() {
    double r = 0;
    for (long i=0;i<beta.rows();i++){
        r += beta.row(i).squaredNorm();
    }
    return r;
}