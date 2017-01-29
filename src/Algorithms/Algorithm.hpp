//
// Created by haohanwang on 1/24/16.
//

#ifndef ALGORITHMS_ALGORITHM_HPP
#define ALGORITHMS_ALGORITHM_HPP

#include <mutex>
#include <unordered_map>

#ifdef BAZEL
#include "Models/Model.hpp"
#else
#include "../Models/Model.hpp"
#endif

using namespace std;

typedef unsigned int algorithm_id_t;

class Algorithm {
protected:
    double progress;
    int maxIteration;
    bool isRunning;
    bool shouldStop;
    
public:
    Algorithm();
    Algorithm(const unordered_map<string, string>);

    mutex mtx;

    void setMaxIteration(int);

    double getProgress();
    bool getIsRunning();
    int getMaxIteration();
    void stop();

    virtual void assertReadyToRun(){};
    virtual void run(Model*);
    virtual void setUpRun(){};
    virtual void finishRun(){};

    virtual ~Algorithm(){};
};


#endif //ALGORITHMS_ALGORITHM_HPP
