//
// Created by haohanwang on 1/24/16.
//

#include "ProximalGradientDescent.hpp"

#include <Eigen/Dense>
#include <iostream>
#include <map>

#include "AlgorithmOptions.hpp"

using namespace Eigen;
using namespace std;


ProximalGradientDescent::ProximalGradientDescent(const AlgorithmOptions_t& options) {
    tolerance = options.tolerance;
    learningRate = options.learning_rate;
    prev_residue = numeric_limits<double>::max();
}

/*ProximalGradientDescent::ProximalGradientDescent(const map<string, string>& options) {
    try {
        setLearningRate(stof(options.find("learningRate")->second));
    } catch (exception& e) {}
    try {
        setTolerance(stof(options.find("tolerance")->second));
    } catch (exception& e) {}
}*/

void ProximalGradientDescent::setTolerance(float tol) {
    tolerance = tol;
}


void ProximalGradientDescent::setLearningRate2(float d) {
    learningRate2 = d;
}

void ProximalGradientDescent::setPrevResidule(float d) {
    prev_residue = d;
}

void ProximalGradientDescent::setInnerStep1(long d) {
    innerStep1 = d;
}

void ProximalGradientDescent::setInnerStep2(long d) {
    innerStep2 =d;
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
    learningRate2 = 0.001;
    tolerance = 0.000001;
    prev_residue = numeric_limits<double>::max();
    innerStep1 = 10;
    innerStep2 = 10;
}

void ProximalGradientDescent::run(TreeLasso * model) {
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


void ProximalGradientDescent::run(MultiPopLasso * model) {
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

void ProximalGradientDescent::run(AdaMultiLasso *model) {
    // this is not just proximal gradient descent, also including iteratively updating beta and w, v
    model->initTraining();
    int epoch = 0;
    double residue = model->cost();
    double theta = 1;
    double theta_new = 0;
    MatrixXd beta_prev = model->getFormattedBeta(); //bx
    MatrixXd beta_curr = model->getFormattedBeta(); //bx_new
    MatrixXd beta = model->getFormattedBeta();  //bw
    MatrixXd best_beta = model->getFormattedBeta();
    MatrixXd beta_prev2 = model->getFormattedBeta();
    MatrixXd in;
    MatrixXd grad;
    double diff = tolerance*2;
    double lr2 = 0;
    long i1 = 0;
    long i2 = 0;
    VectorXd w_update = model->getW();
    VectorXd v_update = model->getV();
    VectorXd w_prev = model->getW();
    VectorXd v_prev = model->getV();
    VectorXd w_grad = model->getW();
    VectorXd v_grad = model->getV();
    while (epoch < maxIteration && diff > tolerance) {
        i1 = 0;
        i2 = 0;
        epoch++;
        while (i1 < innerStep1){
            i1 ++ ;
            beta_prev2 = model->getFormattedBeta();
            progress = float(epoch) / maxIteration;
            theta_new = 2.0/(epoch+2);
            grad = model->proximal_derivative();
            in = beta - 1/model->getL() * grad;
            beta_curr = model->proximal_operator(in, learningRate);
            beta = beta_curr + (1-theta)/theta * theta_new * (beta_curr-beta_prev);
            beta_prev = beta_curr;
            theta = theta_new;
            model->updateBeta(beta);
        }
        while (i2 < innerStep2){
            i2 ++ ;
            lr2 = learningRate2 / sqrt(i2);
            w_prev = model->getW();
            v_prev = model->getV();
            w_grad = model->gradient_w();
            v_grad = model->gradient_v();
            w_update = w_prev - lr2*w_grad;
            v_update = v_prev - lr2*v_grad;
            w_update = model->projection(w_update);
            v_update = model->projection(v_update);
            model->updateW(w_update);
            model->updateV(v_update);
            model->updateTheta_Rho();
        }
        residue = model->cost();
        if (residue < prev_residue){
            best_beta = beta;
        }
        diff = abs(prev_residue - residue);
        cout << "epoch: " << epoch << "\t" << "residue: " << residue << endl;
//        cout << "--------"<<endl;
//        cout << beta << endl;
//        cout << "--------"<<endl;
    }
    model->updateBeta(best_beta);
}

bool ProximalGradientDescent::checkVectorConvergence(VectorXd v1, VectorXd v2, double d) {
    double r = (v1 - v2).squaredNorm();
    return (r < d);
}
