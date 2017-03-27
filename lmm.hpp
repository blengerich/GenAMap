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
#include "../Algorithms/brent.hpp"

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

    // Dimensions of the data
    long ns; // Number of samples
    long nf; // Number of features (SNPs)

    MatrixXd X;
    MatrixXd y;
    MatrixXd S;
    MatrixXd U;
    MatrixXd X0;
    MatrixXd Uy;
    // for test, delete it later
    MatrixXd SUX;
    MatrixXd SUy;
    MatrixXd SUX0;
    // end

    void decompose();

    double nllMin;
    double delta0; // Value at which log likelihood of the null model reaches the maximum
    double ldelta0; // log(delta0)
    double sigma;
    bool initTrainingFlag;

public:

    // Constructor
    FaSTLMM();
    FaSTLMM(const unordered_map<string, string>& options);

    // For Scheduler
    void setX(MatrixXd);
    void setY(MatrixXd);
    void setAttributeMatrix(const string&, MatrixXd*);
    void assertReadyToRun();

    // for test, delete later
    double get_ldelta0();
    double get_nllmin();
    MatrixXd get_SUX();
    MatrixXd get_SUy();
    MatrixXd get_SUX0();
    // end

    void init(MatrixXd, MatrixXd);
    double objective(double);
    void trainNullModel(double, double, double);
    Vector2d tstat(double, double, double, double);
    VectorXd hypothesis_test(MatrixXd, MatrixXd, MatrixXd, MatrixXd);
    void train(double, double, double);

};

#endif /* GENAMAP_FAST_LMM_HPP */
