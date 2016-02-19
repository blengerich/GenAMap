//
// Created by haohanwang on 2/19/16.
//

#include <stdio.h>
#include "gtest/gtest.h"
#include "MatrixTest.hpp"

void MatrixTest::TEST_VECTOR_NEAR(VectorXd a, VectorXd b, float v) {
    long l = a.size();
    ASSERT_EQ(l, b.size());
    for (long i=0;i<l;i++){
        EXPECT_NEAR(a(i), b(i), v);
    }
}

void MatrixTest::TEST_VECTOR_DOUBLE_EQ(VectorXd a, VectorXd b) {
    long l = a.size();
    ASSERT_EQ(l, b.size());
    for (long i=0;i<l;i++){
        EXPECT_DOUBLE_EQ(a(i), b(i));
    }
}

void MatrixTest::TEST_MATRIX_NEAR(MatrixXd m, MatrixXd n, float v) {
    long r = m.rows();
    long c = m.cols();
    ASSERT_EQ(r, n.rows());
    ASSERT_EQ(c, n.clos());
    for (long i=0;i<r;i++){
        TEST_VECTOR_NEAR(m.row(i), n.row(i), v);
    }
}

void MatrixTest::TEST_MATRIX_DOUBLE_EQ(MatrixXd m, MatrixXd n) {
    long r = m.rows();
    long c = m.cols();
    ASSERT_EQ(r, n.rows());
    ASSERT_EQ(c, n.clos());
    for (long i=0;i<r;i++){
        TEST_VECTOR_DOUBLE_EQ(m.row(i), n.row(i));
    }
}