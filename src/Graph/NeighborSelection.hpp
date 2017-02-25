//
// Created by weifang on 2/19/17.
//

#ifndef GRAPH_NEIGHBORSELECTION_HPP
#define GRAPH_NEIGHBORSELECTION_HPP


#include "../Models/Model.hpp"

#include <Eigen/Dense>
#include <unordered_map>

#ifdef BAZEL
#include "Models/ModelOptions.hpp"
#else
#include "../Models/ModelOptions.hpp"
#endif

using namespace Eigen;

class NeighborSelection : public virtual Model {
private:
    float L1_reg;
    float L2_reg;
    MatrixXf betaAll;

    static constexpr float default_L1_reg = 0;
    static constexpr float default_L2_reg = 0;
public:
    NeighborSelection();
    NeighborSelection(const unordered_map<string, string>& options);

    void setL1_reg(float);
    float getL1_reg();
    void setL2_reg(float);
    float getL2_reg();

    void zeroBetaAt(int);

    // general use methods
    MatrixXf derivative();
    float cost();

    // algorithm use methods
    // proximal gradient descent
    MatrixXf proximal_derivative();
    MatrixXf proximal_operator(VectorXf, float);

    void assertReadyToRun();

    void updateBetaAll(MatrixXf);
    MatrixXf getBetaAll();
};


#endif //GRAPH_NEIGHBORSELECTION_HPP
