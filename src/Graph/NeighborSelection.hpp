//
// Created by wei on 3/3/17.
//

#ifndef NEIGHBOR_SELECTION_HPP
#define NEIGHBOR_SELECTION_HPP

#include <map>

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
    float learningRate2;
    float prev_residue;
    long innerStep1;
    long innerStep2;

    bool checkVectorConvergence(VectorXf, VectorXf, float);

    static constexpr float default_learning_rate = 0.001;
    static constexpr float default_learning_rate2 = 0.001;
    static constexpr float default_tolerance = 0.000001;
    static constexpr long default_inner_step1 = 10;
    static constexpr long default_inner_step2 = 10;

public:
    NeighborSelection();
    NeighborSelection(const unordered_map<string, string>&);

    void setUpRun();
    void finishRun();

    void run(Model*);
    void run(LinearRegression*);

    void setLearningRate(float);
    void setTolerance(float);
    void setLearningRate2(float);
    void setPrevResidule(float);
    void setInnerStep1(long);
    void setInnerStep2(long);
    void assertReadyToRun();

    /*void stop();*/
};


#endif //GRAPH_NEIGHBORSELECTION_HPP
