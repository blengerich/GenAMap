//
// Created by haohanwang on 1/24/16.
//

#include "ProximalGradientDescent.hpp"
#include <Eigen/Dense>
#include <iostream>

using namespace Eigen;
using namespace std;

void ProximalGradientDescent::setTolerance(float tol) {
    tolerance = tol;
}

void ProximalGradientDescent::run(Model *model) {
    cerr << "The algorithm for this specific model is not implemented, runs on basic model"<<endl;
    int epoch = 0;
    float residue = model->cost();
    VectorXd grad;
    VectorXd in;
    while (epoch < maxIteration && residue > tolerance) {
        epoch++;
        progress = float(epoch) / maxIteration;
        grad = model->proximal_derivative();
        in = model->getBeta() - learningRate * grad;
        model->updateBeta(model->proximal_operator(in, learningRate));
        residue = model->cost();
    }
}

void ProximalGradientDescent::run(LinearRegression *model) {
    int epoch = 0;
    float residue = model->cost();
    VectorXd grad;
    VectorXd in;
    while (epoch < maxIteration && residue > tolerance) {
        epoch++;
        progress = float(epoch) / maxIteration;
        grad = model->proximal_derivative();
        in = model->getBeta() - learningRate * grad;
        model->updateBeta(model->proximal_operator(in, learningRate));
        residue = model->cost();
    }
}

void ProximalGradientDescent::setLearningRate(float lr) {
    learningRate = lr;
}

ProximalGradientDescent::ProximalGradientDescent() {
    learningRate = 0.001;
    tolerance = 0.000001;
}