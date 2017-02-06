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
    MatrixXf snpsFeatures1;
    MatrixXf snpsFeatures2;

    VectorXf w;
    VectorXf v;

    VectorXf theta;
    VectorXf rho;

    double penalty_cost();

    bool initTrainingFlag;
    long taskNum;

    double L;
    double mu;
    MatrixXf C;

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

    void setAttributeMatrix(const string&, MatrixXf*);
    void setSnpsFeatures1(MatrixXf); // TODO: switch to handling scoped pointers
    void setSnpsFeatures2(MatrixXf);
    void setSnpsFeatures(MatrixXf);
    MatrixXf getSnpsFeatures1();
    MatrixXf getSnpsFeatures2();
    VectorXf getW();
    VectorXf getV();
    void updateW(VectorXf);
    void updateV(VectorXf);

    void initTheta();
    void initRho();

    VectorXf getTheta();
    VectorXf getRho();
    void updateTheta_Rho();

    MatrixXf getBeta();
    MatrixXf getFormattedBeta();

    void setX(MatrixXf);
    void setY(MatrixXf);
    void setXY(MatrixXf, MatrixXf);
    void initBeta();

    void assertReadyToRun();
    void initTraining();
    MatrixXf proximal_derivative();
    MatrixXf proximal_operator(MatrixXf, float);
    VectorXf gradient_w();
    VectorXf gradient_v();
    VectorXf projection(VectorXf);
    double getL();

    double cost();
};


#endif //GENAMAP_V2_ADAMULTILASSO_HPP
