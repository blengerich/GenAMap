//
// Created by haohanwang on 1/24/16.
//

#ifndef ALGORITHMS_ALGORITHM_HPP
#define ALGORITHMS_ALGORITHM_HPP

#include <mutex>
#include <memory>
#include <unordered_map>

#ifdef BAZEL
#include "Models/Model.hpp"
#else
#include "../Models/Model.hpp"
#endif

using namespace std;

typedef unsigned int algorithm_id_t;

class FAKEMUTEX {
public:
    void lock(){};
    void unlock(){};
};

class Algorithm {
protected:
    float progress;
    int maxIteration;
    bool isRunning;
    bool shouldStop;
    
public:
    Algorithm();
    Algorithm(const unordered_map<string, string>);

    mutex mtx;
//    FAKEMUTEX mtx;

    void setMaxIteration(int);

    float getProgress();
    bool getIsRunning();
    int getMaxIteration();
    void stop();

    virtual void assertReadyToRun(){};
    virtual void run(shared_ptr<Model>);
    virtual void setUpRun(){};
    virtual void finishRun(){};

    virtual ~Algorithm(){};
};


#endif //ALGORITHMS_ALGORITHM_HPP
