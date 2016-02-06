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
    MatrixXd beta;
    MatrixXd y;
public:
    void setX(MatrixXd);
    void setY(MatrixXd);
    void initBeta(void);
    void initBeta(MatrixXd);
    void updateBeta(MatrixXd);
    MatrixXd getX(void);
    MatrixXd getBeta(void);
    MatrixXd getY(void);

    MatrixXd predict();
    MatrixXd predict(MatrixXd);

    virtual MatrixXd derivative();
    virtual MatrixXd proximal_derivative();
    virtual MatrixXd proximal_operator(MatrixXd, float);

    virtual double cost();

    Model();
    Model(MatrixXd, VectorXd);
};


#endif //ALGORITHMS_MODEL_HPP
