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
#include "Models/Model.hpp"
#else
#include "../Models/AdaMultiLasso.hpp"
#include "../Models/Model.hpp"
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
    prev_residue = numeric_limits<double>::max();
}


ProximalGradientDescent::ProximalGradientDescent() {
    learningRate = default_learning_rate;
    learningRate2 = default_learning_rate2;
    tolerance = default_tolerance;
    prev_residue = numeric_limits<double>::max();
    innerStep1 = 10;
    innerStep2 = 10;
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
    throw runtime_error("Test Exception from PGD");
}


void ProximalGradientDescent::setUpRun() {
    isRunning = true;
    progress = 0.0;
    shouldStop = false;
}

void ProximalGradientDescent::finishRun() {
    isRunning = false;
    progress = 1.0;
}

void ProximalGradientDescent::run(Model *model) {
    setUpRun();
    cerr << "The algorithm for this specific model is not implemented, runs on basic model"<<endl;    
    int epoch = 0;
    double residue = model->cost();
    VectorXd grad;
    VectorXd in;
    while (epoch < maxIteration && residue > tolerance && !shouldStop) {
        epoch++;
        progress = float(epoch) / maxIteration;
        grad = model->proximal_derivative();
        in = model->getBeta() - learningRate * grad;
        model->updateBeta(model->proximal_operator(in, learningRate));
        residue = model->cost();
    }
    finishRun();
}

void ProximalGradientDescent::run(Gflasso * model) {
    setUpRun();
    int epoch = 0;
    double residue = model->cost();
    double theta = 1;
    double theta_new = 0;
    MatrixXd beta_prev = model->get_beta(); //bx
    MatrixXd beta_curr = model->get_beta(); //bx_new
    MatrixXd beta = model->get_beta();  //bw
    MatrixXd best_beta = model->get_beta();
    MatrixXd in;
    MatrixXd grad;
    double diff = tolerance*2;
    prev_residue= 9999999;
    
    cout << "PGD maxIter = " << maxIteration << "  tolerance = " << tolerance << endl;
    
    while (epoch < maxIteration && diff > tolerance) {
        epoch++;
        progress = float(epoch) / maxIteration;
        theta_new = 2.0/(epoch+3.0);
        grad = model->gradient();
        
        in = beta - 1/model->getL() * grad;
        beta_curr = in;
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
        
        cout << " Iter = " << epoch  << " cost " << residue << " diff = " << diff << endl;
    }
    cout<<endl;
    model->updateBeta(best_beta);
    finishRun();
}

void ProximalGradientDescent::run(LinearRegression *model) {
    try {
        assertReadyToRun();
        model->assertReadyToRun();
    } catch (const exception& e) {
        rethrow_exception(current_exception());
    }
    setUpRun();
    int epoch = 0;
    MatrixXd y = model->getY();
    for (long i=0; i<y.cols(); i++){
        model->setY(y.col(i));
        model->initBeta();
        double residue = model->cost();
        VectorXd grad;
        VectorXd in;
        while (epoch < maxIteration && residue > tolerance && !shouldStop) {
            epoch++;
            progress = float(epoch) / maxIteration;
            grad = model->proximal_derivative();
            in = model->getBeta() - learningRate * grad;
            model->updateBeta(model->proximal_operator(in, learningRate));
            residue = model->cost();
        }
        model->updateBetaAll(model->getBeta());
    }
    model->updateBeta(model->getBetaAll());
    finishRun();
}

void ProximalGradientDescent::setLearningRate(float lr) {
    learningRate = lr;
}


void ProximalGradientDescent::run(TreeLasso * model) {
    setUpRun();
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
    while (epoch < maxIteration && diff > tolerance && !shouldStop) {
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
    isRunning = false;
    finishRun();
}


void ProximalGradientDescent::run(MultiPopLasso * model) {
    setUpRun();
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
    while (epoch < maxIteration && diff > tolerance && !shouldStop) {
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
    finishRun();
}

void ProximalGradientDescent::run(AdaMultiLasso *model) {
    /*try {
        assertReadyToRun();
        model->assertReadyToRun();
    } catch (const exception& e) {
        rethrow_exception(e);
    }*/
    // this is not just proximal gradient descent, also including iteratively updating beta and w, v
    setUpRun();
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
    while (epoch < maxIteration && diff > tolerance && !shouldStop) {
        i1 = 0;
        i2 = 0;
        epoch++;
        while (i1 < innerStep1 && !shouldStop){
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
        while (i2 < innerStep2 && !shouldStop){
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
    finishRun();
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
    MatrixXd tmp = lr.getBeta();
    model->updateBeta(tmp);
}
