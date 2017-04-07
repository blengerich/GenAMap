//
// Created by wei on 3/3/17.
//

#ifndef NEIGHBOR_SELECTION_HPP
#define NEIGHBOR_SELECTION_HPP

#include <map>
#include <memory>

#ifdef BAZEL
#include "Algorithms/Algorithm.hpp"
#include "Models/LinearRegression.hpp"
#else
#include "../Algorithms/Algorithm.hpp"
#include "../Algorithms/AlgorithmOptions.hpp"
#include "../Models/LinearRegression.hpp"
#endif

using namespace std;

class NeighborSelection : public Algorithm {
private:
    float tolerance;
    float learningRate;

    static constexpr float default_learning_rate = 0.001;
    static constexpr float default_tolerance = 0.000001;

public:
    NeighborSelection();
    NeighborSelection(const unordered_map<string, string>&);

    void setUpRun();
    void finishRun();

    void run(shared_ptr<Model>);
    void run(shared_ptr<LinearRegression>);

    void setLearningRate(float);
    void setTolerance(float);
    void assertReadyToRun();

    /*void stop();*/
};


#endif //NEIGHBOR_SELECTION_HPP
