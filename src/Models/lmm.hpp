/*
 * lmm.hpp
 *
 * Created on: Feb 19, 2017
 * Author: Jie Xie (jiexie@andrew.cmu.edu)
 */

#ifndef GENAMAP_FAST_LMM_HPP
#define GENAMAP_FAST_LMM_HPP

#include <Eigen/Dense>
#include <Eigen/SVD>
#include <iostream>
#include <vector>
#include <math.h>
#include <cstdlib>
#include <iomanip>
#include <functional>
#include <boost/math/distributions/students_t.hpp>
#include <boost/math/tools/minima.hpp>
// #include "../Algorithms/NewBrent.hpp"

#ifdef BAZEL
#include "Math/Math.hpp"
#include "Model.hpp"
#else
#include "../Math/Math.hpp"
#include "../Models/Model.hpp"
#endif

using namespace std;
using namespace Eigen;

class FaSTLMM : public Model {
protected:

    long ns; // Number of samples
    long nf; // Number of features (SNPs)
    bool initTrainingFlag;

    // Input
    MatrixXf X;
    MatrixXf y;
    // Output
    VectorXf p;
    MatrixXf beta;
    // Eigendecomposition
    MatrixXf S;
    MatrixXf U;

    void decompose();

public:

    // Constructor
    FaSTLMM();
    FaSTLMM(const unordered_map<string, string>& options);

    void setX(MatrixXf);
    void setY(MatrixXf);
    void setAttributeMatrix(const string&, MatrixXf*);
    void assertReadyToRun();
    VectorXf getP();
    MatrixXf getBeta();

    void init(MatrixXf, MatrixXf);
    float cost(float);
    float trainNullModel(float, float, float);
    Vector2f tstat(float, float, float, float);
    void hypothesis_test(MatrixXf, MatrixXf, MatrixXf);
    void train(float, float, float);

};

#endif /* GENAMAP_FAST_LMM_HPP */
