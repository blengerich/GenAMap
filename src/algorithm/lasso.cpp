//
// Created by haohanwang on 1/22/16.
//

#include "lasso.hpp"


void Lasso::setX(MatrixXd X){this->X=X;};
void Lasso::setY(VectorXd){this->y=y;};
void Lasso::setLambda(float l){this->lambda=l;};
void Lasso::setLearningRage(float lr){this->learningRate=lr;};

MatrixXd Lasso::getX(void){return this->X;};
MatrixXd Lasso::getBeta(void){return this->beta;};
VectorXd Lasso::getY(void){return this->y;};
float Lasso::getLambda(void){return this->lambda;};
float Lasso::getLearningRate(void){return this->learningRate;};

void Lasso::train(){
    VectorXd y = this->getY();
    MatrixXd X = this->getX();
    float lambda = this->getLambda();
    float lr = this->getLearningRate();
    this->train(X, y, lambda, lr, 0.001);
};

void Lasso::train(MatrixXd X, VectorXd y, float lambda, float lr, float tol){
    int c = X.cols();
    beta = VectorXd::Random(c);
    float residue = (y - X*beta).array().sum();
    int step = 0;
    int MaxSteps = 1000;
    while (residue>tol && step<=MaxSteps){
        step++;
        VectorXd tmp = -2*X.transpose()*(y-X*beta); // gradient
        tmp = beta - lr * tmp; // input for proximal
        VectorXd sign = ((tmp.array()>0).matrix()).cast<double>() ;//sign
        sign += -1.0*((tmp.array()<0).matrix()).cast<double>();
        tmp = ((tmp.array().abs()-lr*lambda).max(0)).matrix();//proximal
        beta = (tmp.array()*sign.array()).matrix();//proximal multipled back with sign
        residue = (y - X*beta).array().sum();
    }
};

//VectorXd Lasso::predict(){};
//VectorXd Lasso::predict(MatrixXd){};

Lasso::Lasso(void){cout<<"something created here";};
