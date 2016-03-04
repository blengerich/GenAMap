//
// Created by haohanwang on 2/24/16.
//

#ifndef GENAMAP_V2_ADAMULTILASSO_HPP
#define GENAMAP_V2_ADAMULTILASSO_HPP

#include "model/Model.hpp"
#include <Math/Math.hpp>
#include <iostream>

class AdaMultiLasso : public Model{
private:
    double lambda1;
    double lambda2;
    MatrixXd snpsFeature1;
    MatrixXd snpsFeature2;

    VectorXd w;
    VectorXd v;

    VectorXd theta;
    VectorXd rho;

    double penalty_cost();

    bool initTrainingFlag;
    long taskNum;

    double L;
    double mu;
    MatrixXd C;

    void initC();

public:
    AdaMultiLasso();
    void setLambda1(double);
    void setLambda2(double);

    void setSnpsFeature1(MatrixXd);
    void setSnpsFeature2(MatrixXd);
    MatrixXd getSnpsFeature1();
    MatrixXd getSnpsFeature2();
    VectorXd getW();
    VectorXd getV();

    void initTheta();
    void initRho();

    VectorXd getTheta();
    VectorXd getRho();

    VectorXd getTheta_formatted();
    VectorXd getRho_formatted();

    MatrixXd getBeta();
    MatrixXd getBeta_formatted();

    void setX(MatrixXd);
    void setY(MatrixXd);
    void setXY(MatrixXd, MatrixXd);
    void initBeta();

    void initTraining();
    MatrixXd proximal_derivative();
    MatrixXd proximal_operator(MatrixXd, float);
    double getL();

    double cost();
};


#endif //GENAMAP_V2_ADAMULTILASSO_HPP