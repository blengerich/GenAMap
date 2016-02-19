//
// Created by haohanwang on 2/19/16.
//

#include <stdio.h>
#include "gtest/gtest.h"
#include "MatrixTest.hpp"

void MatrixTest::TEST_VECTOR_NEAR(VectorXd a, VectorXd b, float v) {
    long l = a.size();
    ASSERT_EQ(a.size(), b.size());
    for (long i=0;i<l;i++){
        EXPECT_NEAR(a(i), b(i), v);
    }
}