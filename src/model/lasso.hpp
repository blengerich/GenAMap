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
    MatrixXd X;
    MatrixXd beta;
    VectorXd y;
    float lambda;
    float learningRate;
    float progress;
public:
    void setX(MatrixXd);
    void setY(VectorXd);
    void setLambda(float);
    void setLearningRage(float);

    MatrixXd getX(void);
    MatrixXd getBeta(void);
    VectorXd getY(void);
    float getLambda(void);
    float getLearningRate(void);

    void train();
    void train(MatrixXd, VectorXd, float, float, float);

    VectorXd predict();
    VectorXd predict(MatrixXd);

    Lasso();
};


#endif //ALGORITHMS_LASSO_HPP
