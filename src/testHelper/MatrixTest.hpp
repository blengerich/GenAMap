//
// Created by haohanwang on 2/19/16.
//

#ifndef GENAMAP_V2_MATRIXTEST_HPP
#define GENAMAP_V2_MATRIXTEST_HPP

#include <Eigen/Dense>

using namespace Eigen;

class MatrixTest {
private:
    MatrixTest() {};
    MatrixTest(MatrixTest const &);  // don't implement
    void operator=(MatrixTest const &); // don't implement

public:
    void TEST_MATRIX_DOUBLE_EQ(MatrixXd, MatrixXd);
    void TEST_VECTOR_DOUBLE_EQ(VectorXd, VectorXd);

    void TEST_MATRIX_NEAR(MatrixXd, MatrixXd, float);
    void TEST_VECTOR_NEAR(VectorXd, VectorXd, float);
};


#endif //GENAMAP_V2_MATRIXTEST_HPP
