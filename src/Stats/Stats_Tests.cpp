#include <Eigen/Dense>
#include <stdio.h>
#include "gtest/gtest.h"


#ifdef BAZEL
#include "Stats/Stats.hpp"
#else
#include "Stats.hpp"
#endif


using namespace std;
using namespace Eigen;

TEST(ChiSquaredTest, BasicTest) {
    MatrixXf observed = MatrixXf::Constant(1,1,1);
    MatrixXf expected = MatrixXf::Constant(1,1,1);
    EXPECT_NEAR(0, Stats::ChiSquaredTest(observed, expected), 0.001);

    observed = MatrixXf::Constant(1,1,2);
    expected = MatrixXf::Constant(1,1,1);
    EXPECT_NEAR(1, Stats::ChiSquaredTest(observed, expected), 0.001);

    observed = MatrixXf::Constant(2,2,2);
    expected = MatrixXf::Constant(2,2,1);
    EXPECT_NEAR(4, Stats::ChiSquaredTest(observed, expected), 0.001);
}


TEST(ChiToPValue, BasicTest) {
    EXPECT_NEAR(1, Stats::ChiToPValue(0, 1), 0.001);
    EXPECT_GE(0.022587+1e-5, Stats::ChiToPValue(5.2, 1));
    EXPECT_LE(0.022587-1e-5, Stats::ChiToPValue(5.2, 1));
    EXPECT_GE(0.391963+1e-5, Stats::ChiToPValue(5.2, 5));
    EXPECT_LE(0.391963-1e-5, Stats::ChiToPValue(5.2, 5));
}

TEST(ChiSquared, IntegrationTest) {
    MatrixXf observed = MatrixXf::Constant(2,2,2);
    MatrixXf expected = MatrixXf::Constant(2,2,1);
    EXPECT_GE(0.0455+1e-5, Stats::ChiToPValue(Stats::ChiSquaredTest(observed, expected), 1));
    EXPECT_LE(0.0445-1e-5, Stats::ChiToPValue(Stats::ChiSquaredTest(observed, expected), 1));
}

TEST(FisherExactTest, BasicTest) {
    MatrixXf X = MatrixXf::Constant(1,1,1);
    EXPECT_NEAR(1, Stats::FisherExactTest(X), 0.01);
    MatrixXf m(2, 2);
    m(0, 0) = 1;
    m(0, 1) = 1;
    m(1, 0) = 1;
    m(1, 1) = 1;
    EXPECT_LE(0.66, Stats::FisherExactTest(m));
    EXPECT_GE(0.67, Stats::FisherExactTest(m));
    MatrixXf m1(2, 2);
    m1(0, 0) = 1.2;
    m1(0, 1) = 1.3;
    m1(1, 0) = 1.1;
    m1(1, 1) = 1.1;
    EXPECT_LE(0.66, Stats::FisherExactTest(m1));
    EXPECT_GE(0.67, Stats::FisherExactTest(m1));
    MatrixXf m2(2, 2);
    m2(0, 0) = 1.2;
    m2(0, 1) = 1.3;
    m2(1, 0) = 1.7;
    m2(1, 1) = 1.5;
    EXPECT_NEAR(0.4, Stats::FisherExactTest(m2), 0.001);

}

TEST(BonCorrection, BasicTest){
    EXPECT_NEAR(0.05, Stats::BonCorrection(0.5, 10), 0.001);
    EXPECT_NEAR(0.001, Stats::BonCorrection(0.1, 100), 0.001);

}

int main(int argc, char **argv) {
  ::testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}