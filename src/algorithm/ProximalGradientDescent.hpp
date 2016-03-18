//
// Created by haohanwang on 1/24/16.
//

#include <map>

#if BAZEL
#include "algorithm/Algorithm.hpp"
#include "model/LinearRegression.hpp"
#include "model/TreeLasso.hpp"
#include "model/MultiPopLasso.hpp"
#else
#include "Algorithm.hpp"
#include "AlgorithmOptions.hpp"
#include "../model/LinearRegression.hpp"
#include "../model/TreeLasso.hpp"
#include "../model/MultiPopLasso.hpp"
#endif

#ifndef ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP
#define ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP

using namespace std;

class ProximalGradientDescent : public Algorithm {
private:
    float tolerance;
    float learningRate;
    double prev_residue;
public:
    void setLearningRate(float);
    void setTolerance(float);

    void run(Model*);
    void run(LinearRegression*);
    void run(TreeLasso*);
    void run(MultiPopLasso*);

    ProximalGradientDescent();
    ProximalGradientDescent(const AlgorithmOptions_t& options);
};


#endif //ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP
