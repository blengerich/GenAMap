//
// Created by haohanwang on 1/24/16.
//

#include "Algorithm.hpp"
#include "../model/LinearRegression.hpp"
#include "../model/TreeLasso.hpp"

#ifndef ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP
#define ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP


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

    void run_accelerated(TreeLasso*);

    ProximalGradientDescent();
};


#endif //ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP
