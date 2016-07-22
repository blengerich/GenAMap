//
// Created by haohanwang on 1/24/16.
//

#ifndef ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP
#define ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP

#include <map>

#ifdef BAZEL
#include "algorithm/Algorithm.hpp"
#include "model/AdaMultiLasso.hpp"
#include "model/LinearRegression.hpp"
#include "model/TreeLasso.hpp"
#include "model/MultiPopLasso.hpp"
#include "model/GFlasso.h"
#include "model/SparseLMM.h"
#else
#include "Algorithm.hpp"
#include "AlgorithmOptions.hpp"
#include "../model/LinearRegression.hpp"
#include "../model/TreeLasso.hpp"
#include "../model/MultiPopLasso.hpp"
#include "../model/AdaMultiLasso.hpp"
#include "../model/GFlasso.h"
#include "../model/SparseLMM.h"
#endif


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

    void setUpRun();
    void finishRun();

    static constexpr double default_learning_rate = 0.001;
    static constexpr double default_learning_rate2 = 0.001;
    static constexpr double default_tolerance = 0.000001;

public:
    ProximalGradientDescent();
    ProximalGradientDescent(const unordered_map<string, string>&);

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
    void run(SparseLMM*);

    /*void stop();*/
};


#endif //ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP
