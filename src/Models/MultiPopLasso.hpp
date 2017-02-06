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
    double lambda;
    double mu;
    double gamma;
    VectorXf population;
    MatrixXf Z;
    long popNum;
    double L;
    bool initTrainingFlag;

    VectorXi removeCols;
    MatrixXf C;

    MatrixXf getBetaInside();

    double groupPenalization();
    void reArrangeData();

    void removeColumns();
    MatrixXf normalizeData_col(MatrixXf);
    void formatData();

//    MatrixXf deriveMatrixA(double, long, double);
//    MatrixXf project(MatrixXf);

    vector<long> getPopulationIndex(long);
    void initC();

    static constexpr double default_lambda = 0;
    static constexpr double default_mu = 1;
    static constexpr double default_gamma = 0;

public:
    void reSetFlag();
    void setXY(MatrixXf, MatrixXf);
    void setLambda(double);
    void setPopulation(VectorXf);
    void setMu(double);
    void setGamma(double);
    void setAttributeMatrix(const string&, MatrixXf*);

    void initBeta();
    double cost();
    MatrixXf predict();
    MatrixXf predict(MatrixXf);
    MatrixXf predict(MatrixXf, VectorXf);
    void assertReadyToRun();
    void initTraining();

    MatrixXf proximal_derivative();
    MatrixXf proximal_operator(MatrixXf, float);

    double getL();
    MatrixXf getBeta();
    MatrixXf getFormattedBeta();

    void updateBetaAll();
    MatrixXf getBetaAll();

    MultiPopLasso();
    MultiPopLasso(const unordered_map<string, string>& options);
};


#endif //ALGORITHMS_MULTIPOPLASSO_HPP
