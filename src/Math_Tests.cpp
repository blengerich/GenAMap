//
// Created by haohanwang on 2/8/16.
//

#include <stdio.h>
#include "gtest/gtest.h"

#include "Math.hpp"

TEST(MathTest, Always_True) {
EXPECT_EQ(1,1);
}

TEST(MathTest, Variance){
VectorXd a(8);
a << 1.1,2.4,2.4,3.2,4.5,6.7,6.8,8.9 ;
EXPECT_DOUBLE_EQ(Math::getInstance().variance(a), 6.445);
VectorXd b(1);
b << 0;
EXPECT_DOUBLE_EQ(Math::getInstance().variance(b), 0);
VectorXd c(2);
c << 1, 1;
EXPECT_DOUBLE_EQ(Math::getInstance().variance(c), 0);
}

TEST(MathTest, STD){
VectorXd a(8);
a << 1.1,2.4,2.4,3.2,4.5,6.7,6.8,8.9 ;
EXPECT_NEAR(Math::getInstance().std(a), 2.538700, 1e-5);
VectorXd b(1);
b << 0;
EXPECT_NEAR(Math::getInstance().std(b), 0.0, 1e-5);
VectorXd c(2);
c << 1, 1;
EXPECT_NEAR(Math::getInstance().std(c), 0.0, 1e-5);
}

TEST(MathTest, Covariance){
VectorXd a(8);
a << 1.1,2.4,2.4,3.2,4.5,6.7,6.8,8.9 ;
VectorXd b(8);
b << 2.2,3.6,5.2,1.5,4.5,2.3,3.2,0.9 ;
EXPECT_NEAR(Math::getInstance().covariance(a, b), -1.441250, 1e-5);
EXPECT_NEAR(Math::getInstance().covariance(a, a), 6.445, 1e-5);
a << 0,0,0,0,0,0,0,0;
EXPECT_NEAR(Math::getInstance().covariance(a, a), 0, 1e-5);
EXPECT_NEAR(Math::getInstance().covariance(a, b), 0,1e-5);
}

TEST(MathTest, Correlation){
VectorXd a(8);
a << 1.1,2.4,2.4,3.2,4.5,6.7,6.8,8.9 ;
VectorXd b(8);
b << 2.2,3.6,5.2,1.5,4.5,2.3,3.2,0.9 ;
EXPECT_NEAR(Math::getInstance().correlation(a, b), -0.411388, 1e-5);
EXPECT_DOUBLE_EQ(Math::getInstance().correlation(a, a), 1);
a << 0,0,0,0,0,0,0,0;
EXPECT_DOUBLE_EQ(Math::getInstance().correlation(a, a), 0);
EXPECT_DOUBLE_EQ(Math::getInstance().correlation(a, b), 0);
}


int main(int argc, char** argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}