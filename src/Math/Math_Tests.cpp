//
// Created by haohanwang on 2/18/16.
//

#include <stdio.h>
#include "gtest/gtest.h"

#include "Math.hpp"


void TEST_VECTOR_NEAR(VectorXf a, VectorXf b, float v) {
    long l = a.size();
    ASSERT_EQ(l, b.size());
    for (long i=0;i<l;i++){
        EXPECT_NEAR(a(i), b(i), v);
    }
}

void TEST_VECTOR_DOUBLE_EQ(VectorXf a, VectorXf b) {
    long l = a.size();
    ASSERT_EQ(l, b.size());
    for (long i=0;i<l;i++){
        EXPECT_DOUBLE_EQ(a(i), b(i));
    }
}

void TEST_MATRIX_NEAR(MatrixXf m, MatrixXf n, float v) {
    long r = m.rows();
    long c = m.cols();
    ASSERT_EQ(r, n.rows());
    ASSERT_EQ(c, n.cols());
    for (long i=0;i<r;i++){
        TEST_VECTOR_NEAR(m.row(i), n.row(i), v);
    }
}

void TEST_MATRIX_DOUBLE_EQ(MatrixXf m, MatrixXf n) {
    long r = m.rows();
    long c = m.cols();
    ASSERT_EQ(r, n.rows());
    ASSERT_EQ(c, n.cols());
    for (long i=0;i<r;i++){
        TEST_VECTOR_DOUBLE_EQ(m.row(i), n.row(i));
    }
}


TEST(MathTest, Always_True) {
EXPECT_EQ(1,1);
}

TEST(MathTest, Variance){
VectorXf a(8);
a << 1.1,2.4,2.4,3.2,4.5,6.7,6.8,8.9 ;
EXPECT_DOUBLE_EQ(Math::getInstance().variance(a), 6.445);
VectorXf b(1);
b << 0;
EXPECT_DOUBLE_EQ(Math::getInstance().variance(b), 0);
VectorXf c(2);
c << 1, 1;
EXPECT_DOUBLE_EQ(Math::getInstance().variance(c), 0);
}

TEST(MathTest, STD){
VectorXf a(8);
a << 1.1,2.4,2.4,3.2,4.5,6.7,6.8,8.9 ;
EXPECT_NEAR(Math::getInstance().std(a), 2.538700, 1e-5);
VectorXf b(1);
b << 0;
EXPECT_NEAR(Math::getInstance().std(b), 0.0, 1e-5);
VectorXf c(2);
c << 1, 1;
EXPECT_NEAR(Math::getInstance().std(c), 0.0, 1e-5);
}

TEST(MathTest, Covariance){
VectorXf a(8);
a << 1.1,2.4,2.4,3.2,4.5,6.7,6.8,8.9 ;
VectorXf b(8);
b << 2.2,3.6,5.2,1.5,4.5,2.3,3.2,0.9 ;
EXPECT_NEAR(Math::getInstance().covariance(a, b), -1.441250, 1e-5);
EXPECT_NEAR(Math::getInstance().covariance(a, a), 6.445, 1e-5);
a << 0,0,0,0,0,0,0,0;
EXPECT_NEAR(Math::getInstance().covariance(a, a), 0, 1e-5);
EXPECT_NEAR(Math::getInstance().covariance(a, b), 0,1e-5);
}

TEST(MathTest, Correlation){
VectorXf a(8);
a << 1.1,2.4,2.4,3.2,4.5,6.7,6.8,8.9 ;
VectorXf b(8);
b << 2.2,3.6,5.2,1.5,4.5,2.3,3.2,0.9 ;
EXPECT_NEAR(Math::getInstance().correlation(a, b), -0.411388, 1e-5);
EXPECT_DOUBLE_EQ(Math::getInstance().correlation(a, a), 1);
a << 0,0,0,0,0,0,0,0;
EXPECT_DOUBLE_EQ(Math::getInstance().correlation(a, a), 0);
EXPECT_DOUBLE_EQ(Math::getInstance().correlation(a, b), 0);
}

TEST(MathTest, L2Thresholding){
VectorXf a(8);
a << 1.1,2.4,2.4,3.2,4.5,6.7,6.8,8.9 ;
VectorXf b(8);
b << 0.07527,0.16422,0.16422,0.21897,0.30793,0.45847,0.46531,0.60901 ;
TEST_VECTOR_NEAR(b, Math::getInstance().L2Thresholding(a), 1e-5);
TEST_VECTOR_DOUBLE_EQ(b, Math::getInstance().L2Thresholding(b));
a << 0,0,0,0,0,0,0,0;
TEST_VECTOR_DOUBLE_EQ(a, Math::getInstance().L2Thresholding(a));
}

int main(int argc, char** argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}