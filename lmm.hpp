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
#include <boost/math/distributions/students_t.hpp>

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

    // What variables should be defined here?

    // Dimensions of the data
    long ns; // Number of samples
    long nf; // Number of features (SNPs)

    // MatrixXd K; // Don't need to calculate K explicitly
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
    FaSTLMM(const unordered_map<string, string>& options); // why two constructors?

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

    void init();
    double f(double);
    void trainNullModel(double, double, double);
    Vector2d tstat(double, double, double, double);
    VectorXd hypothesis_test(MatrixXd, MatrixXd, MatrixXd, MatrixXd);
    VectorXd cv_train(MatrixXd, MatrixXd, double, double, long);
    void train(double, double, double);

};

#endif /* GENAMAP_FAST_LMM_HPP */
