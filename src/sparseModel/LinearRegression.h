//
// Created by haohanwang on 3/25/16.
//

#ifndef GENAMAP_V2_LINEARREGRESSION_H
#define GENAMAP_V2_LINEARREGRESSION_H

#include "Model.h"
#include "../model/ModelOptions.hpp"

#include <Eigen/Sparse>

using namespace Eigen;

class LinearRegression : public Model {
private:
    float L1_reg;
    float L2_reg;
public:
    void setL1_reg(float);

    void setL2_reg(float);

    // general use methods
    SparseMatrix<float> derivative();

    float cost();

    // algorithm use methods
    // proximal gradient descent
    SparseMatrix<float> proximal_derivative();

    SparseMatrix<float> proximal_operator(SparseMatrix<float>, float);

    LinearRegression();

    LinearRegression(const ModelOptions_t &options);
};


#endif //GENAMAP_V2_LINEARREGRESSION_H
