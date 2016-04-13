//
// Created by haohanwang on 1/24/16.
//

#ifndef ALGORITHMS_ALGORITHM_HPP
#define ALGORITHMS_ALGORITHM_HPP

#ifdef BAZEL
#include "model/Model.hpp"

#else
#include "../model/Model.hpp"
#endif

class Algorithm {
protected:
    double progress;
    int maxIteration;
public:
    Algorithm();
    void setMaxIteration(int);

    double getProgress();
    int getMaxIteration();
    void run(Model*);
};


#endif //ALGORITHMS_ALGORITHM_HPP
