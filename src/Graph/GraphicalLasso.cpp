/******************************************************************
 * Created by Wei on 3/12/17.
 *
 * This is an implementation of this paper:
 * "Sparse Inverse Covariance Estimation with the Graphical Lasso"
 * 
 * All names of parameters comply with the notaions in the paper.
 ******************************************************************/

#include "GraphicalLasso.hpp"

#include <Eigen/Dense>
#include <Eigen/SVD>
#include <iostream>
#include <map>

#ifdef BAZEL
#include "Models/LinearRegression.hpp"
#include "Models/Model.hpp"
#else
#include "../Models/LinearRegression.hpp"
#include "../Models/Model.hpp"
#endif

using namespace Eigen;
using namespace std;

GraphicalLasso::GraphicalLasso(const unordered_map<string, string>& opts) {
    try {
        tolerance = stod(opts.at("tolerance"));
    } catch(std::out_of_range& oor) {
        tolerance = default_tolerance;
    }
    try {
        learningRate = stod(opts.at("learning_rate"));
    } catch(std::out_of_range& oor) {
        learningRate = default_learning_rate;
    }
}


GraphicalLasso::GraphicalLasso() {
    learningRate = default_learning_rate;
    tolerance = default_tolerance;
}


/*void GraphicalLasso::stop() {
    shouldStop = true;
}*/

void GraphicalLasso::setTolerance(float tol) {
    tolerance = tol;
}

void GraphicalLasso::assertReadyToRun() {
    return;    // there is no data that cannot be inferred
}


void GraphicalLasso::setUpRun() {
    mtx.lock();
    isRunning = true;
    progress = 0.0;
    shouldStop = false;
}

void GraphicalLasso::finishRun() {
    isRunning = false;
    progress = 1.0;
    mtx.unlock();
}

void GraphicalLasso::setLearningRate(float lr) {
    learningRate = lr;
}

MatrixXf GraphicalLasso::matrixRaiseToHalf(MatrixXf& matrix) {
    JacobiSVD<MatrixXf> svd(matrix, ComputeThinU | ComputeThinV);
    MatrixXf D = svd.singularValues().array().sqrt().matrix().asDiagonal();
    MatrixXf U = svd.matrixU();
    return U * D * U.transpose();
}



void GraphicalLasso::run(LinearRegression *model) {
    MatrixXf X = model->getX();
    int num_samples = X.rows();
    int num_features = X.cols();
    stdNormalize(X);
    MatrixXf S = X.transpose() * X / num_samples;
    MatrixXf W = S;
    MatrixXf W_inv = Math::getInstance().pseudoInverse(W);
    MatrixXf W_inv_old = W_inv;
    float regularizer = model->getL1_reg();

    for (int epoch = 0; epoch < maxIteration; epoch++) {
        progress = static_cast<float>(epoch) / maxIteration;
        for (int idx = 0; idx < num_features; idx++) {
            // partition matrixes into blocks
            vector<MatrixXf> S_blocks = partitionBlocks(S);
            MatrixXf W_11 = partitionBlocks(W)[0];
            MatrixXf W_inv_11 = partitionBlocks(W_inv)[0];
            
            // find W_11 ^ (1/2)
            MatrixXf W_11_half = matrixRaiseToHalf(W_11); 
            MatrixXf b = Math::getInstance().pseudoInverse(W_11_half) * S_blocks[1];
            
            // run linear regression with lasso
            MatrixXf beta = fit(model, W_11_half, b);
            MatrixXf W_12 = W_11 * beta;
            
            // recover W_inv (W_inv corresponds to theta in the paper)
            float S_22 = S_blocks.back()(0, 0);
            float W_22 = S_22 + regularizer;
            float W_inv_22 = 1 / (W_22 - (W_12.transpose() * beta)(0, 0)); 
            MatrixXf W_inv_12 = -W_inv_22 * beta;

            W_inv = composeBlocks(W_inv_11, W_inv_12, W_inv_22);
            W = composeBlocks(W_11, W_12, W_22);
            S = composeBlocks(S_blocks[0], S_blocks[1], S_blocks[2](0, 0));
        }
        float diff = (W_inv - W_inv_old).norm();
        if (diff < tolerance) {
            break;
        } else {
            W_inv_old = W_inv;
        }
    }
    for (long col = 0; col < W_inv.cols(); col++) {
        for (long row = 0; row < W_inv.rows(); row++) {
            W_inv(row, col) = abs(W_inv(row, col)) < 1e-5 ? 0 : 1;
        }
    }
    model->updateBeta(W_inv);
}

MatrixXf GraphicalLasso::fit(LinearRegression* model, MatrixXf& X, MatrixXf& Y) {
    model->setL1_reg(model->getL1_reg()*10);
    model->setX(X);
    model->setY(Y);
    model->initBeta();
    float residue = model->cost();
    VectorXf grad;
    VectorXf in;
    long epoch = 0;
    while (!shouldStop && epoch < maxIteration && residue > tolerance && !shouldStop) {
        grad = model->proximal_derivative();
        in = model->getBeta() - learningRate * grad;
        model->updateBeta(model->proximal_operator(in, learningRate));
        residue = model->cost();
        epoch++;
    }
    return model->getBeta();
}

void GraphicalLasso::stdNormalize(MatrixXf& matrix) {
    RowVectorXf mean = matrix.colwise().mean();
    RowVectorXf std = ((matrix.rowwise() - mean).array().square().colwise().sum() / 
                       (matrix.rows())).sqrt();
    matrix = (matrix.rowwise() - mean).array().rowwise() / std.array();
}

vector<MatrixXf> GraphicalLasso::partitionBlocks(MatrixXf& matrix) {
    int num_rows = matrix.rows();
    int num_cols = matrix.cols();
    MatrixXf m_11 = matrix.block(0, 0, num_rows - 1, num_cols - 1);
    MatrixXf m_12 = matrix.block(0, num_cols - 1, num_rows - 1, 1);
    MatrixXf m_22 = matrix.block(num_rows - 1, num_cols - 1, 1, 1);
    return {m_11, m_12, m_22};
}

MatrixXf GraphicalLasso::composeBlocks(MatrixXf& m_11,
                                       MatrixXf& m_12,
                                       float m_22) {
    int num_rows = m_11.rows() + 1;
    int num_cols = m_11.cols() + 1;
    MatrixXf result(num_rows, num_cols);
    result.block(1, 1, num_rows - 1, num_cols - 1) = m_11;
    result.block(1, 0, num_rows - 1, 1) = m_12;
    result.block(0, 1, 1, num_cols - 1) = m_12.transpose();
    result(0, 0) = m_22;
    return result;
}
