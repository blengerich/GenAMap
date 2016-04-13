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
#include "model/AdaMultiLasso.hpp"
#include "model/GFlasso.h"

#else
#include "Algorithm.hpp"
#include "AlgorithmOptions.hpp"
#include "../model/LinearRegression.hpp"
#include "../model/TreeLasso.hpp"
#include "../model/MultiPopLasso.hpp"
#include "../model/AdaMultiLasso.hpp"
#include "../model/GFlasso.h"
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
    void run(Gflasso*);

    ProximalGradientDescent();
    ProximalGradientDescent(const AlgorithmOptions_t& options) {
        tolerance = options.tolerance;
        learningRate = options.learning_rate;
        prev_residue = numeric_limits<double>::max();
    };
};


#endif //ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP
