//
// Created by haohanwang on 2/8/16.
//

#ifndef ALGORITHMS_MATH_HPP
#define ALGORITHMS_MATH_HPP

#include <Eigen/Dense>

#ifdef BAZEL
#include "Models/TreeLasso.hpp"
#else
#include "../Models/TreeLasso.hpp"
#endif

using namespace Eigen;

class Math {
private:
    Math() {};
    Math(Math const &);  // don't implement
    void operator=(Math const &); // don't implement

    minXY searchMin(MatrixXd);
    MatrixXd appendColRow(MatrixXd, minXY);
    void updateMap(unordered_map<long, treeNode*>*, minXY);


public:
    static Math &getInstance() {
        static Math instance;
        return instance;
    }
    // statistics
    double variance(VectorXd);
    double std(VectorXd);
    double covariance(VectorXd, VectorXd);
    double correlation(VectorXd, VectorXd);
    // matrix
    void removeCol(MatrixXd*, long);
    void removeRow(MatrixXd*, long);
    void removeColRow(MatrixXd*, minXY);


    VectorXd L2Thresholding(VectorXd in);

    Tree* hierarchicalClustering(MatrixXd);
};


#endif //ALGORITHMS_MATH_HPP
