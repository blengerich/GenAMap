//
// Created by haohanwang on 2/2/16.
//

#ifndef ALGORITHMS_MULTIPOPLASSO_HPP
#define ALGORITHMS_MULTIPOPLASSO_HPP

#include <iostream>
#include <vector>

#ifdef BAZEL
#include "Models/Model.hpp"
#include "Math/Math.hpp"
#else
#include "../Models/Model.hpp"
#include "../Math/Math.hpp"
#endif


using namespace std;
using namespace Eigen;

class MultiPopLasso : public Model {
private:
    MatrixXf betaAll;
    float lambda;
    float mu;
    float gamma;
    VectorXf population;
    MatrixXf Z;
    long popNum;
    float L;
    bool initTrainingFlag;

    VectorXi removeCols;
    MatrixXf C;

    MatrixXf getBetaInside();

    float groupPenalization();
    void reArrangeData();

    void removeColumns();
    MatrixXf normalizeData_col(MatrixXf);
    void formatData();

//    MatrixXf deriveMatrixA(double, long, double);
//    MatrixXf project(MatrixXf);

    vector<long> getPopulationIndex(long);
    void initC();

    static constexpr float default_lambda = 0;
    static constexpr float default_mu = 1;
    static constexpr float default_gamma = 0;

public:
    void reSetFlag();
    void setXY(MatrixXf, MatrixXf);
    void setLambda(float);
    void setPopulation(VectorXf);
    void setMu(float);
    void setGamma(float);
    void setAttributeMatrix(const string&, MatrixXf*);

    void initBeta();
    float cost();
    MatrixXf predict();
    MatrixXf predict(MatrixXf);
    MatrixXf predict(MatrixXf, VectorXf);
    void assertReadyToRun();
    void initTraining();

    MatrixXf proximal_derivative();
    MatrixXf proximal_operator(MatrixXf, float);

    float getL();
    MatrixXf getBeta();
    MatrixXf getFormattedBeta();

    void updateBetaAll();
    MatrixXf getBetaAll();

    MultiPopLasso();
    MultiPopLasso(const unordered_map<string, string>& options);
};


#endif //ALGORITHMS_MULTIPOPLASSO_HPP
