//
// Created by haohanwang on 1/24/16.
//

#include <map>

#if BAZEL
#include "algorithm/Algorithm.hpp"
#include "algorithm/AlgorithmOptions.hpp"
#include "model/AdaMultiLasso.hpp"
#include "model/LinearRegression.hpp"
#include "model/TreeLasso.hpp"
#include "model/MultiPopLasso.hpp"
#else
#include "Algorithm.hpp"
#include "AlgorithmOptions.hpp"
#include "../model/LinearRegression.hpp"
#include "../model/TreeLasso.hpp"
#include "../model/MultiPopLasso.hpp"
#include "../model/AdaMultiLasso.hpp"
#endif

#ifndef ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP
#define ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP

using namespace std;

class ProximalGradientDescent : public Algorithm {
private:
    float tolerance;
    float learningRate;
    float learningRate2;
    double prev_residue;
    long innerStep1;
    long innerStep2;

    bool checkVectorConvergence(VectorXd, VectorXd, double);

public:
    void setLearningRate(float);
    void setTolerance(float);
    void setLearningRate2(float);
    void setPrevResidule(float);
    void setInnerStep1(long);
    void setInnerStep2(long);

    void run(Model*);
    void run(LinearRegression*);
    void run(TreeLasso*);
    void run(MultiPopLasso*);
    void run(AdaMultiLasso*);

    ProximalGradientDescent();
    ProximalGradientDescent(const AlgorithmOptions_t& options);
};


#endif //ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP
