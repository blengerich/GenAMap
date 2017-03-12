//
// Created by wei on 3/3/17.
//

#include "NeighborSelection.hpp"

#include <Eigen/Dense>
#include <iostream>
#include <map>

#ifdef BAZEL
#include "Models/LinearRegression.hpp"
#include "Models/Model.hpp"
#else
#include "../Models/LinearRegression.hpp"
#include "../Models/Model.hpp"
#endif

using namespace Eigen;
using namespace std;

NeighborSelection::NeighborSelection(const unordered_map<string, string>& opts) {
    try {
        tolerance = stod(opts.at("tolerance"));
    } catch(std::out_of_range& oor) {
        tolerance = default_tolerance;
    }
    try {
        learningRate = stod(opts.at("learning_rate"));
    } catch(std::out_of_range& oor) {
        learningRate = default_learning_rate;
    }
}


NeighborSelection::NeighborSelection() {
    learningRate = default_learning_rate;
    tolerance = default_tolerance;
}


/*void NeighborSelection::stop() {
    shouldStop = true;
}*/

void NeighborSelection::setTolerance(float tol) {
    tolerance = tol;
}

void NeighborSelection::assertReadyToRun() {
    return;    // there is no data that cannot be inferred
}


void NeighborSelection::setUpRun() {
    mtx.lock();
    isRunning = true;
    progress = 0.0;
    shouldStop = false;
}

void NeighborSelection::finishRun() {
    isRunning = false;
    progress = 1.0;
    mtx.unlock();
}

void NeighborSelection::setLearningRate(float lr) {
    learningRate = lr;
}

void NeighborSelection::run(Model *model) {
    cerr << "The algorithm for this specific model is not implemented, runs on basic model"<<endl;    
    int epoch = 0;
    float residue = model->cost();
    VectorXf grad;
    VectorXf in;
    while (!shouldStop && epoch < maxIteration && residue > tolerance) {
        epoch++;
        progress = float(epoch) / maxIteration;
        grad = model->proximal_derivative();
        in = model->getBeta() - learningRate * grad;
        model->updateBeta(model->proximal_operator(in, learningRate));
        residue = model->cost();
    }
}

void NeighborSelection::run(LinearRegression *model) {
    int epoch = 0;
    MatrixXf X_origin = model->getX();
    MatrixXf X = model->getX();
    model->setL1_reg(model->getL1_reg()*10);
    long s = X_origin.cols();
    for (long i = 0; i < s; i++){
        if (shouldStop) {
            break;
        }
        X.col(i).setZero();
        model->setX(X);
        X.col(i) = X_origin.col(i);
        model->setY(X_origin.col(i));
        VectorXf beta = VectorXf::Random(X.cols());
        beta(i) = 0;
        model->updateBeta(beta);
        float residue = model->cost();
        VectorXf grad;
        VectorXf in;
        epoch = 0; 
        while (!shouldStop && epoch < maxIteration && residue > tolerance && !shouldStop) {
            epoch++;
            progress = (float(epoch) + i*maxIteration )/(maxIteration*s);
            grad = model->proximal_derivative();
            in = model->getBeta() - learningRate * grad;
            model->updateBeta(model->proximal_operator(in, learningRate));
            residue = model->cost();
        }
        model->updateBetaAll(model->getBeta());
    }
    auto result = model->getBetaAll();
    for (long col = 0; col < result.cols(); col++) {
        for (long row = 0; row < result.rows(); row++) {
            result(row, col) = abs(result(row, col)) < 1e-5 ? 0 : 1;  
        }
    }
    model->updateBeta(result);
}
