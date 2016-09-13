//
// Created by haohanwang on 2/24/16.
//

#ifndef GENAMAP_V2_ADAMULTILASSO_HPP
#define GENAMAP_V2_ADAMULTILASSO_HPP

#include <iostream>
#include <math.h>
#include <unordered_map>

#ifdef BAZEL
#include "Math/Math.hpp"
#include "Models/Model.hpp"
#else
#include "../Math/Math.hpp"
#include "Model.hpp"
#endif

using namespace Eigen;
using namespace std;

class AdaMultiLasso : public Model{
private:
    double lambda1;
    double lambda2;
    MatrixXd snpsFeatures1;
    MatrixXd snpsFeatures2;

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

    static constexpr double default_lambda1 = 0;
    static constexpr double default_lambda2 = 0;
    static constexpr double default_mu = 1e-3;

public:
    AdaMultiLasso();
    AdaMultiLasso(const unordered_map<string, string>&);
    void setLambda1(double);
    void setLambda2(double);

    void setAttributeMatrix(const string&, MatrixXd*);
    void setSnpsFeatures1(MatrixXd); // TODO: switch to handling scoped pointers
    void setSnpsFeatures2(MatrixXd);
    void setSnpsFeatures(MatrixXd);
    MatrixXd getSnpsFeatures1();
    MatrixXd getSnpsFeatures2();
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

    void assertReadyToRun();
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
