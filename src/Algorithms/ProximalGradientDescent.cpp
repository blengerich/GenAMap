//
// Created by haohanwang on 1/24/16.
//

#include "ProximalGradientDescent.hpp"
#include "BrentSearch.hpp"

#include <Eigen/Dense>
#include <iostream>
#include <map>

#ifdef BAZEL
#include "Models/AdaMultiLasso.hpp"
#include "Models/GFlasso.h"
#include "Models/LinearRegression.hpp"
#include "Models/Model.hpp"
#include "Models/MultiPopLasso.hpp"
#include "Models/TreeLasso.hpp"
#else
#include "../Models/AdaMultiLasso.hpp"
#include "../Models/GFlasso.h"
#include "../Models/LinearRegression.hpp"
#include "../Models/Model.hpp"
#include "../Models/MultiPopLasso.hpp"
#include "../Models/TreeLasso.hpp"
#endif

using namespace Eigen;
using namespace std;

ProximalGradientDescent::ProximalGradientDescent(const unordered_map<string, string>& opts) {
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
    try {
        learningRate2 = stod(opts.at("learning_rate2"));
    } catch(std::out_of_range& oor) {
        learningRate2 = default_learning_rate2;
    }
    try {
        innerStep1 = stoi(opts.at("innerStep1"));
    } catch(std::out_of_range& oor) {
        innerStep1 = default_inner_step1;
    }
    try {
        innerStep2 = stoi(opts.at("innerStep2"));
    } catch(std::out_of_range& oor) {
        innerStep2 = default_inner_step2;
    }
    prev_residue = numeric_limits<double>::max();
}


ProximalGradientDescent::ProximalGradientDescent() {
    learningRate = default_learning_rate;
    learningRate2 = default_learning_rate2;
    tolerance = default_tolerance;
    prev_residue = numeric_limits<double>::max();
    innerStep1 = default_inner_step1;
    innerStep2 = default_inner_step2;
}


/*void ProximalGradientDescent::stop() {
    shouldStop = true;
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

void ProximalGradientDescent::assertReadyToRun() {
    return;    // there is no data that cannot be inferred
}


void ProximalGradientDescent::setUpRun() {
    mtx.lock();
    isRunning = true;
    progress = 0.0;
    shouldStop = false;
}

void ProximalGradientDescent::finishRun() {
    isRunning = false;
    progress = 1.0;
    mtx.unlock();
}

void ProximalGradientDescent::setLearningRate(float lr) {
    learningRate = lr;
}

void ProximalGradientDescent::run(Model *model) {
    cerr << "The algorithm for this specific model is not implemented, runs on basic model"<<endl;    
    int epoch = 0;
    double residue = model->cost();
    VectorXd grad;
    VectorXd in;
    while (!shouldStop && epoch < maxIteration && residue > tolerance) {
        epoch++;
        progress = float(epoch) / maxIteration;
        grad = model->proximal_derivative();
        in = model->getBeta() - learningRate * grad;
        model->updateBeta(model->proximal_operator(in, learningRate));
        residue = model->cost();
    }
}

void ProximalGradientDescent::run(Gflasso * model) {
    model->initBeta();
    learningRate = learningRate*2e6;
    int epoch = 0;
    double residue = model->cost();
    double theta = 1;
    double theta_new = 0;
    MatrixXf beta_prev = model->get_beta(); //bx
    MatrixXf beta_curr = model->get_beta(); //bx_new
    MatrixXf beta = model->get_beta();  //bw
    MatrixXf best_beta = model->get_beta();
    MatrixXf in;
    MatrixXf grad;
    double diff = tolerance*2;
    prev_residue= 9999999;
    while (!shouldStop && epoch < maxIteration && diff > tolerance) {
        epoch++;
        progress = float(epoch) / maxIteration;
        theta_new = 2.0/(epoch+3.0);
        grad = model->gradient();
        in = beta - 1/model->getL() * grad;
        beta_curr = model->proximal_operator(in, learningRate);
        beta = beta_curr + (1-theta)/theta * theta_new * (beta_curr-beta_prev);
        beta_prev = beta_curr;
        theta = theta_new;
        model->updateBeta(beta);
        residue = model->cost();
        diff = abs(prev_residue - residue);
        if (residue < prev_residue){
            best_beta = beta;
            prev_residue = residue;
        }
    }
    model->updateBeta(best_beta);
}

void ProximalGradientDescent::run(LinearRegression *model) {
    int epoch = 0;
    MatrixXf y = model->getY();
    model->setL1_reg(model->getL1_reg()*10);
    long s = y.cols();
    for (long i=0; i<s; i++){
        if (shouldStop) {
            break;
        }
        model->setY(y.col(i));
        model->initBeta();
        double residue = model->cost();
        VectorXd grad;
        VectorXd in;
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
    model->updateBeta(model->getBetaAll());
}


void ProximalGradientDescent::run(TreeLasso * model) {
    model->initBeta();
    model->hierarchicalClustering();
    learningRate = learningRate*1e5;
    int epoch = 0;
    double residue = model->cost();
    double theta = 1;
    double theta_new = 0;
    MatrixXf beta_prev = model->getBeta(); //bx
    MatrixXf beta_curr = model->getBeta(); //bx_new
    MatrixXf beta = model->getBeta();  //bw
    MatrixXf best_beta = model->getBeta();
    MatrixXf in;
    MatrixXf grad;
    model->initGradientUpdate();
    double diff = tolerance*2;
    while (!shouldStop && epoch < maxIteration && diff > tolerance) {
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
    MatrixXf X = model->getX();
    MatrixXf y = model->getY();
    int epoch = 0;
    long s = y.cols();
    for (long i=0; i<y.cols(); i++) {
        if (shouldStop) {
            break;
        }
        model->reSetFlag();
        model->setXY(X, y.col(i));
        model->initTraining();
        epoch = 0;
        double residue = model->cost();
        double theta = 1;
        double theta_new = 0;
        MatrixXf beta_prev = model->getFormattedBeta(); //bx
        MatrixXf beta_curr = model->getFormattedBeta(); //bx_new
        MatrixXf beta = model->getFormattedBeta();  //bw
        MatrixXf best_beta = model->getFormattedBeta();
        MatrixXf in;
        MatrixXf grad;
        double diff = tolerance * 2;
        while (!shouldStop && epoch < maxIteration && diff > tolerance) {
            epoch++;
            progress = (float(epoch) + i*maxIteration ) / (maxIteration*s);
            theta_new = 2.0 / (epoch + 2);
            grad = model->proximal_derivative();
            in = beta - 1 / model->getL() * grad;
            beta_curr = model->proximal_operator(in, learningRate);
            beta = beta_curr + (1 - theta) / theta * theta_new * (beta_curr - beta_prev);

            beta_prev = beta_curr;
            theta = theta_new;
            model->updateBeta(beta);
            residue = model->cost();
            if (residue < prev_residue) {
                best_beta = beta;
            }
            diff = abs(prev_residue - residue);
        }
        model->updateBeta(best_beta);
        model->updateBetaAll();
    }
//    model->updateBeta(model->getBetaAll());
}

void ProximalGradientDescent::run(AdaMultiLasso *model) {
    // this is not just proximal gradient descent, also including iteratively updating beta and w, v
    model->initBeta();
    model->initTraining();
    int epoch = 0;
    double residue = model->cost();
    double theta = 1;
    double theta_new = 0;
    MatrixXf beta_prev = model->getFormattedBeta(); //bx
    MatrixXf beta_curr = model->getFormattedBeta(); //bx_new
    MatrixXf beta = model->getFormattedBeta();  //bw
    MatrixXf best_beta = model->getFormattedBeta();
    MatrixXf beta_prev2 = model->getFormattedBeta();
    MatrixXf in;
    MatrixXf grad;
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
    while (!shouldStop && epoch < maxIteration && diff > tolerance) {
        i1 = 0;
        i2 = 0;
        epoch++;
        while (!shouldStop && i1 < innerStep1){
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
        while (!shouldStop && i2 < innerStep2){
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
        //cerr << "epoch: " << epoch << "\tresidue: " << residue << "\ndiff: " << diff << endl;
        prev_residue = residue;
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

void ProximalGradientDescent::run(SparseLMM *model) {
    BrentSearch *brentSearch = new BrentSearch();
    brentSearch->set_delta(0.5);
    brentSearch->run(model);
    double delta = model->get_lambda();
    model->rotateXY(delta);
    LinearRegression lr = LinearRegression();
    lr.setL1_reg(model->getL1reg());
    lr.setX(model->getRotatedX());
    lr.setY(model->getRoattedY());
    run(&lr);
    MatrixXf tmp = lr.getBeta();
    model->updateBeta(tmp);
}
