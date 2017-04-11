//
// Created by wei on 3/12/17.
//

#ifndef GRAPHICAL_LASSO_HPP
#define GRAPHICAL_LASSO_HPP

#include <map>
#include <vector>
#include <memory>

#ifdef BAZEL
#include "Algorithms/Algorithm.hpp"
#include "Models/LinearRegression.hpp"
#include "Math/Math.hpp"
#else
#include "../Algorithms/Algorithm.hpp"
#include "../Algorithms/AlgorithmOptions.hpp"
#include "../Models/LinearRegression.hpp"
#include "../Math/Math.hpp"
#endif

using namespace std;

class GraphicalLasso : public Algorithm {
private:
    float tolerance;
    float learningRate;

    static constexpr float default_learning_rate = 0.001;
    static constexpr float default_tolerance = 0.000001;

    void stdNormalize(MatrixXf&);
    MatrixXf fit(shared_ptr<LinearRegression>, MatrixXf&, MatrixXf&);
    vector<MatrixXf> partitionBlocks(MatrixXf&);
    MatrixXf composeBlocks(MatrixXf& m_11, MatrixXf& m_12, float m_22);
    MatrixXf matrixRaiseToHalf(MatrixXf&);

public:
    GraphicalLasso();
    GraphicalLasso(const unordered_map<string, string>&);

    void setUpRun();
    void finishRun();

    void run(shared_ptr<LinearRegression>);

    void setLearningRate(float);
    void setTolerance(float);
    void assertReadyToRun();

    /*void stop();*/
};


#endif //GRAPHICAL_LASSO_HPP
