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
    double residue = model->cost();
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
    double residue = model->cost();
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
    prev_residue = numeric_limits<double>::max();
}

void ProximalGradientDescent::run_accelerated(TreeLasso * model) {
    int epoch = 0;
    double residue = model->cost();
    double theta = 1;
    double theta_new = 0;
    MatrixXd beta_prev = model->getBeta(); //bx
    MatrixXd beta_curr = model->getBeta(); //bx_new
    MatrixXd beta = model->getBeta();  //bw
    MatrixXd best_beta = model->getBeta();
    MatrixXd in;
    MatrixXd grad;
    model->initGradientUpdate();
    double diff = tolerance*2;
    while (epoch < maxIteration && diff > tolerance) {
        epoch++;
        progress = float(epoch) / maxIteration;

        theta_new = 2.0/(epoch+2);

        grad = model->proximal_derivative();

        in = beta - 1/model->getL() * grad;
        beta_curr = model->proximal_operator(in, learningRate);
        beta = beta_curr + (1-theta)/theta * theta_new * (beta_curr-beta_prev);

        beta_prev = beta_curr;
        theta = theta_new;
        model->updateBeta(beta);
        residue = model->cost();
        if (residue < prev_residue){
            best_beta = beta;
        }
        diff = abs(prev_residue - residue);
    }
    model->updateBeta(best_beta);
}

void ProximalGradientDescent::run_accelerated(MultiPopLasso * model) {
    model->initTraining();
    int epoch = 0;
    double residue = model->cost();
    double theta = 1;
    double theta_new = 0;
    MatrixXd beta_prev = model->getFormattedBeta(); //bx
    MatrixXd beta_curr = model->getFormattedBeta(); //bx_new
    MatrixXd beta = model->getFormattedBeta();  //bw
    MatrixXd best_beta = model->getFormattedBeta();
    MatrixXd in;
    MatrixXd grad;
    double diff = tolerance*2;
    while (epoch < maxIteration && diff > tolerance) {
        epoch++;
        progress = float(epoch) / maxIteration;

        theta_new = 2.0/(epoch+2);

        grad = model->proximal_derivative();

        double L = model->getL();
        in = beta - 1/model->getL() * grad;
        beta_curr = model->proximal_operator(in, learningRate);
        beta = beta_curr + (1-theta)/theta * theta_new * (beta_curr-beta_prev);

        beta_prev = beta_curr;
        theta = theta_new;
        model->updateBeta(beta);
        residue = model->cost();
        cout << "epoch: " << epoch << "residue: "<<residue <<endl;
        if (residue < prev_residue){
            best_beta = beta;
        }
        diff = abs(prev_residue - residue);
    }
    model->updateBeta(best_beta);
}