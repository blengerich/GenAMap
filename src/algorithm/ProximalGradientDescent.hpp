//
// Created by haohanwang on 1/24/16.
//

#include "Algorithm.hpp"
#include "../model/LinearRegression.hpp"

#ifndef ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP
#define ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP


class ProximalGradientDescent : public Algorithm {
private:
    float tolerance;
    float learningRate;
public:
    void setLearningRate(float);
    void setTolerance(float);
    void run(Model*);
    void run(LinearRegression*);

    ProximalGradientDescent();
};


#endif //ALGORITHMS_PROXIMALGRADIENTDESCENT_HPP
