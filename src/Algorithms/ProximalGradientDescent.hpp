//
// Created by haohanwang on 1/24/16.
//

#ifndef ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP
#define ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP

#include <map>

#ifdef BAZEL
#include "Algorithms/Algorithm.hpp"
#include "Models/AdaMultiLasso.hpp"
#include "Models/LinearRegression.hpp"
#include "Models/TreeLasso.hpp"
#include "Models/MultiPopLasso.hpp"
#include "Models/GFlasso.h"
#include "Models/SparseLMM.h"
#else
#include "Algorithm.hpp"
#include "AlgorithmOptions.hpp"
#include "../Models/LinearRegression.hpp"
#include "../Models/TreeLasso.hpp"
#include "../Models/MultiPopLasso.hpp"
#include "../Models/AdaMultiLasso.hpp"
#include "../Models/GFlasso.h"
#include "../Models/SparseLMM.h"
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

    static constexpr double default_learning_rate = 0.001;
    static constexpr double default_learning_rate2 = 0.001;
    static constexpr double default_tolerance = 0.000001;

public:
    ProximalGradientDescent();
    ProximalGradientDescent(const unordered_map<string, string>&);

    void setUpRun();
    void finishRun();

    void run(Model*);
    void run(LinearRegression*);
    void run(TreeLasso*);
    void run(MultiPopLasso*);
    void run(AdaMultiLasso*);
    void run(Gflasso*);
    void run(SparseLMM*);

    void setLearningRate(float);
    void setTolerance(float);
    void setLearningRate2(float);
    void setPrevResidule(float);
    void setInnerStep1(long);
    void setInnerStep2(long);
    void assertReadyToRun();

    /*void stop();*/
};


#endif //ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP
