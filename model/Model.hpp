//
// Created by haohanwang on 1/24/16.
//

#include <Eigen/Dense>

using namespace Eigen;

#ifndef ALGORITHMS_MODEL_HPP
#define ALGORITHMS_MODEL_HPP

class Model {
protected:
    MatrixXd X;
    VectorXd beta;
    VectorXd y;
public:
    void setX(MatrixXd);
    void setY(VectorXd);
    void initBeta(void);
    void initBeta(MatrixXd);
    void updateBeta(VectorXd);
    MatrixXd getX(void);
    MatrixXd getBeta(void);
    VectorXd getY(void);

    VectorXd predict();
    VectorXd predict(MatrixXd);

    virtual VectorXd derivative();
    virtual VectorXd proximal_derivative();
    virtual VectorXd proximal_operator(VectorXd, float);

    virtual double cost();

    Model();
    Model(MatrixXd, VectorXd);
};


#endif //ALGORITHMS_MODEL_HPP
