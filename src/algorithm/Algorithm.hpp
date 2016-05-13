//
// Created by haohanwang on 1/24/16.
//

#ifndef ALGORITHMS_ALGORITHM_HPP
#define ALGORITHMS_ALGORITHM_HPP

#include <unordered_map>

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
    Algorithm(const unordered_map<string, string>);

    void setMaxIteration(int);

    double getProgress();
    int getMaxIteration();
    virtual void run(Model*){};

    virtual ~Algorithm(){};
};


#endif //ALGORITHMS_ALGORITHM_HPP
