//
// Created by haohanwang on 2/24/16.
//

#ifndef GENAMAP_V2_ADAMULTILASSO_HPP
#define GENAMAP_V2_ADAMULTILASSO_HPP

#include <iostream>
#include <math.h>

#ifdef BAZEL
#include "Math/Math.hpp"
#include "model/Model.hpp"
#else
#include "../Math/Math.hpp"
#include "Model.hpp"
#endif


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

    void updateTheta();
    void updateRho();

public:
    AdaMultiLasso();
    void setLambda1(double);
    void setLambda2(double);

    void setSnpsFeature1(MatrixXd);
    void setSnpsFeature2(MatrixXd);
    void setSnpsFeature(MatrixXd);
    MatrixXd getSnpsFeature1();
    MatrixXd getSnpsFeature2();
    VectorXd getW();
    VectorXd getV();
    void updateW(VectorXd);
    void updateV(VectorXd);

    void initTheta();
    void initRho();

    VectorXd getTheta();
    VectorXd getRho();
    void updateTheta_Rho();

    MatrixXd getBeta();
    MatrixXd getFormattedBeta();

    void setX(MatrixXd);
    void setY(MatrixXd);
    void setXY(MatrixXd, MatrixXd);
    void initBeta();

    void initTraining();
    MatrixXd proximal_derivative();
    MatrixXd proximal_operator(MatrixXd, float);
    VectorXd gradient_w();
    VectorXd gradient_v();
    VectorXd projection(VectorXd);
    double getL();

    double cost();
};


#endif //GENAMAP_V2_ADAMULTILASSO_HPP
