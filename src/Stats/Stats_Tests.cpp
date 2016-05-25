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
    MatrixXd observed = MatrixXd::Constant(1,1,1);
    MatrixXd expected = MatrixXd::Constant(1,1,1);
    EXPECT_EQ(0, Stats::ChiSquaredTest(observed, expected));

    observed = MatrixXd::Constant(1,1,2);
    expected = MatrixXd::Constant(1,1,1);
    EXPECT_EQ(1, Stats::ChiSquaredTest(observed, expected));

    observed = MatrixXd::Constant(2,2,2);
    expected = MatrixXd::Constant(2,2,1);
    EXPECT_EQ(4, Stats::ChiSquaredTest(observed, expected));
}


TEST(ChiToPValue, BasicTest) {
    EXPECT_EQ(1, Stats::ChiToPValue(0, 1));
    EXPECT_GE(0.022587+1e-5, Stats::ChiToPValue(5.2, 1));
    EXPECT_LE(0.022587-1e-5, Stats::ChiToPValue(5.2, 1));
    EXPECT_GE(0.391963+1e-5, Stats::ChiToPValue(5.2, 5));
    EXPECT_LE(0.391963-1e-5, Stats::ChiToPValue(5.2, 5));
}

TEST(ChiSquared, IntegrationTest) {
    MatrixXd observed = MatrixXd::Constant(2,2,2);
    MatrixXd expected = MatrixXd::Constant(2,2,1);
    EXPECT_GE(0.0455+1e-5, Stats::ChiToPValue(Stats::ChiSquaredTest(observed, expected), 1));
    EXPECT_LE(0.0445-1e-5, Stats::ChiToPValue(Stats::ChiSquaredTest(observed, expected), 1));
}

TEST(FisherExactTest, BasicTest) {
    MatrixXd X = MatrixXd::Constant(1, 1);
    EXPECT_EQ(1, Stats::FisherExactTest(X));
    MatrixXd m(2, 2);
    m(0, 0) = 1;
    m(0, 1) = 1;
    m(1, 0) = 1;
    m(0, 1) = 1;
    EXPECT_GE(0.66, Stats::FisherExactTest(m));
    EXPECT_LE(0.67, Stats::FisherExactTest(m));
}

int main(int argc, char **argv) {
  ::testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}