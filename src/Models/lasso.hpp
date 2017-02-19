//
// Created by haohanwang on 1/22/16.
//

#ifndef ALGORITHMS_LASSO_HPP
#define ALGORITHMS_LASSO_HPP

#include <iostream>
#include <Eigen/Dense>

using namespace Eigen;
using namespace std;

class Lasso {
private:
    MatrixXf X;
    MatrixXf beta;
    VectorXf y;
    float lambda;
    float learningRate;
    float progress;
public:
    void setX(MatrixXf);
    void setY(VectorXf);
    void setLambda(float);
    void setLearningRage(float);

    MatrixXf getX(void);
    MatrixXf getBeta(void);
    VectorXf getY(void);
    float getLambda(void);
    float getLearningRate(void);

    virtual void assertReadyToRun();
    void train();
    void train(MatrixXf, VectorXf, float, float, float);

    VectorXf predict();
    VectorXf predict(MatrixXf);

    Lasso();
};


#endif //ALGORITHMS_LASSO_HPP
