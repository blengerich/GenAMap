//
// Created by haohanwang on 2/20/16.
//

#include <stdio.h>
#include "gtest/gtest.h"
#include <queue>

#include "Model.hpp"
#include "LinearRegression.hpp"
#include "TreeLasso.hpp"
#include "MultiPopLasso.hpp"

void TEST_VECTOR_NEAR(VectorXd a, VectorXd b, float v) {
    long l = a.size();
    ASSERT_EQ(l, b.size());
    for (long i=0;i<l;i++){
        EXPECT_NEAR(a(i), b(i), v);
    }
}

void TEST_VECTOR_DOUBLE_EQ(VectorXd a, VectorXd b) {
    long l = a.size();
    ASSERT_EQ(l, b.size());
    for (long i=0;i<l;i++){
        EXPECT_DOUBLE_EQ(a(i), b(i));
    }
}

void TEST_MATRIX_NEAR(MatrixXd m, MatrixXd n, float v) {
    long r = m.rows();
    long c = m.cols();
    ASSERT_EQ(r, n.rows());
    ASSERT_EQ(c, n.cols());
    for (long i=0;i<r;i++){
        TEST_VECTOR_NEAR(m.row(i), n.row(i), v);
    }
}

void TEST_MATRIX_DOUBLE_EQ(MatrixXd m, MatrixXd n) {
    long r = m.rows();
    long c = m.cols();
    ASSERT_EQ(r, n.rows());
    ASSERT_EQ(c, n.cols());
    for (long i=0;i<r;i++){
        TEST_VECTOR_DOUBLE_EQ(m.row(i), n.row(i));
    }
}

void TEST_TREE_NEAR(Tree * m, Tree * n, float v){
    queue<treeNode*> nm;
    queue<treeNode*> nn;
    treeNode * root1 = m->getRoot();
    treeNode * root2 = n->getRoot();
    nm.push(root1);
    nn.push(root2);
    while (nm.size()>0 && nn.size()>0){
        treeNode* mt = nm.front();
        treeNode* nt = nn.front();

        vector<long> ms = mt->trait;
        vector<long> ns = nt->trait;

        ASSERT_DOUBLE_EQ(ms.size(), ns.size());

        for (unsigned long i=0;i<ns.size();i++){
            EXPECT_DOUBLE_EQ(ms.at(i), ns.at(i));
        }

        if (mt->children.size()==0){
        }
        else{
            for (int i=0; i<mt->children.size();i++){
                nm.push(mt->children[i]);
            }
        }
        if (nt->children.size()==0){
        }
        else{
            for (int i=0; i<nt->children.size();i++){
                nn.push(nt->children[i]);
            }
        }
        nm.pop();
        nn.pop();
    }

    EXPECT_DOUBLE_EQ(nm.size(), 0);
    EXPECT_DOUBLE_EQ(nn.size(), 0);
}


TEST(MODEL_BASE, CostFunction){
    MatrixXd X(10, 5);
    X << 0.8147,    0.1576,    0.6557,    0.7060,    0.4387,
    0.9058,    0.9706,    0.0357,    0.0318,    0.3816,
    0.1270,    0.9572,    0.8491,    0.2769,    0.7655,
    0.9134,    0.4854,    0.9340,    0.0462,    0.7952,
    0.6324,    0.8003,    0.6787,    0.0971,    0.1869,
    0.0975,    0.1419,    0.7577,    0.8235,    0.4898,
    0.2785,    0.4218,    0.7431,    0.6948,    0.4456,
    0.5469,    0.9157,    0.3922,    0.3171,    0.6463,
    0.9575,    0.7922,    0.6555,    0.9502,    0.7094,
    0.9649,    0.9595,    0.1712,    0.0344,    0.7547;
    MatrixXd y(10, 1);
    y << 0.4173,
    0.0497,
    0.9027,
    0.9448,
    0.4909,
    0.4893,
    0.3377,
    0.9001,
    0.3692,
    0.1112;
    Model m = Model();
    m.setX(X);
    m.setY(y);
    MatrixXd beta(5, 1);
    beta << -0.2106,
    0.0919,
    0.7380,
    -0.3055,
    0.4659;
    m.updateBeta(beta);
    double r = m.cost();
    EXPECT_NEAR(r, 0.0152, 1e-3);
}

TEST(MODEL_BASE, Prediction){
    MatrixXd X(10, 5);
    X << 0.8147,    0.1576,    0.6557,    0.7060,    0.4387,
    0.9058,    0.9706,    0.0357,    0.0318,    0.3816,
    0.1270,    0.9572,    0.8491,    0.2769,    0.7655,
    0.9134,    0.4854,    0.9340,    0.0462,    0.7952,
    0.6324,    0.8003,    0.6787,    0.0971,    0.1869,
    0.0975,    0.1419,    0.7577,    0.8235,    0.4898,
    0.2785,    0.4218,    0.7431,    0.6948,    0.4456,
    0.5469,    0.9157,    0.3922,    0.3171,    0.6463,
    0.9575,    0.7922,    0.6555,    0.9502,    0.7094,
    0.9649,    0.9595,    0.1712,    0.0344,    0.7547;
    Model m = Model();
    m.setX(X);
    MatrixXd beta(5, 1);
    beta << -0.2106,
    0.0919,
    0.7380,
    -0.3055,
    0.4659;
    m.updateBeta(beta);
    MatrixXd y(10, 1);
    y << 0.3156,
    0.0929,
    0.9600,
    0.8980,
    0.4987,
    0.5284,
    0.5239,
    0.4627,
    0.3952,
    0.3525;
    MatrixXd p = m.predict();
    TEST_MATRIX_NEAR(p, y, 1e-3);
    p = m.predict(X);
    TEST_MATRIX_NEAR(p, y, 1e-3);
}

TEST(LINEAR_REGRESSION, CostFunction){
    MatrixXd X(10, 5);
    X << 0.8147,    0.1576,    0.6557,    0.7060,    0.4387,
    0.9058,    0.9706,    0.0357,    0.0318,    0.3816,
    0.1270,    0.9572,    0.8491,    0.2769,    0.7655,
    0.9134,    0.4854,    0.9340,    0.0462,    0.7952,
    0.6324,    0.8003,    0.6787,    0.0971,    0.1869,
    0.0975,    0.1419,    0.7577,    0.8235,    0.4898,
    0.2785,    0.4218,    0.7431,    0.6948,    0.4456,
    0.5469,    0.9157,    0.3922,    0.3171,    0.6463,
    0.9575,    0.7922,    0.6555,    0.9502,    0.7094,
    0.9649,    0.9595,    0.1712,    0.0344,    0.7547;
    MatrixXd y(10, 1);
    y << 0.4173,
    0.0497,
    0.9027,
    0.9448,
    0.4909,
    0.4893,
    0.3377,
    0.9001,
    0.3692,
    0.1112;
    LinearRegression lr = LinearRegression();
    lr.setX(X);
    lr.setY(y);
    MatrixXd beta(5, 1);
    beta << -0.2106,
    0.0919,
    0.7380,
    -0.3055,
    0.4659;
    lr.updateBeta(beta);
    double r = lr.cost();
    EXPECT_NEAR(r, 0.0152, 1e-3);
    double l1 = 0.1;
    lr.setL1_reg(l1);
    r = lr.cost();
    EXPECT_NEAR(r, 0.0152+0.18119, 1e-3);
    double l2 = 0.2;
    lr.setL1_reg(0);
    lr.setL2_reg(l2);
    r = lr.cost();
    EXPECT_NEAR(r, 0.0152+0.1816, 1e-3);
    lr.setL1_reg(l1);
    r = lr.cost();
    EXPECT_NEAR(r, 0.0152+0.18119+0.1816, 1e-3);
}

TEST(LINEAR_REGRESSION, ProximalDerivative){
    MatrixXd X(4, 3);
    X << 0.7803,    0.0965,    0.5752,
    0.3897,    0.1320,    0.0598,
    0.2417,    0.9421,    0.2348,
    0.4039,    0.9561,    0.3532;
    MatrixXd y(4, 1);
    y << 0.8212,
    0.0154,
    0.0430,
    0.1690;
    MatrixXd beta(3,1);
    beta << 0.6491,
    0.7317,
    0.6477;
    MatrixXd pd(3, 1);
    pd << 0.8890,
    1.9383,
    0.6812;
    LinearRegression lr = LinearRegression();
    lr.setX(X);
    lr.setY(y);
    lr.updateBeta(beta);
    MatrixXd r = lr.proximal_derivative();
    TEST_MATRIX_NEAR(r, pd, 1e-3);
}

TEST(LINEAR_REGRESSION, ProximalOperator){
    MatrixXd beta(3,1);
    beta << -0.7491,
    0.7317,
    0.6477;
    MatrixXd pd(3, 1);
    pd << -0.0491,
    0.0317,
    0.0;
    LinearRegression lr = LinearRegression();
    lr.updateBeta(beta);
    MatrixXd a = lr.proximal_operator(beta, 1);
    TEST_MATRIX_NEAR(a, beta, 1e-3);
    lr.setL1_reg(7);
    a = lr.proximal_operator(beta, 0.1);
    TEST_MATRIX_NEAR(a, pd, 0.1);
}

TEST(TREE_LASSO, CostFunction){
    MatrixXd X(4, 6);
    X << 0.4509,    0.1890,    0.6256,    0.7757,    0.3063,    0.7948,
    0.5470,    0.6868,    0.7802,    0.4868,    0.5085,    0.6443,
    0.2963,    0.1835,    0.0811,    0.4359,    0.5108,    0.3786,
    0.7447,    0.3685,    0.9294,    0.4468,    0.8176,    0.8116;
    MatrixXd y(4, 5);
    y << -1.3302,   -0.8198,    0.9233,    0.8666,    2.3260,
    -1.0999,   -0.8959,    2.2639,    2.0579,   -0.2151,
    -0.0032,    0.3647,    0.7551,    0.7000,   -0.6198,
    -0.9786,   -0.8553,    1.6659,    1.5554,    0.9160;

    // clustering relationship of y is (((2,3),4),(0,1))

    MatrixXd beta(6, 5);
    beta << 0,         0,    1.0000,    1.0000,         0,
    0,         0,    2.5000,    2.2000,   -4.0000,
    -1.5000,   -1.8000,         0,         0,    3.0000,
    -0.9000,         0,         0,         0,    1.5000,
    1.0000,     1.0000,         0,         0,   -2.2000,
    0,         0,         0,         0,    0.9000;
    TreeLasso tl = TreeLasso();
    tl.setXY(X, y);
    tl.updateBeta(beta);

    Tree* tr = new Tree();
    treeNode* nd1 = tr->buildLeafNode(2);
    treeNode* nd2 = tr->buildLeafNode(3);
    vector<treeNode*> ch1;
    ch1.push_back(nd1);
    ch1.push_back(nd2);
    treeNode* mid1 = tr->buildParentFromChildren(ch1);
    treeNode* nd3 = tr->buildLeafNode(4);
    vector<treeNode*> ch4;
    ch4.push_back(nd3);
    ch4.push_back(mid1);
    treeNode* mid4 = tr->buildParentFromChildren(ch4);

    treeNode* nd4 = tr->buildLeafNode(0);
    treeNode* nd5 = tr->buildLeafNode(1);
    vector<treeNode*> ch3;
    ch3.push_back(nd4);
    ch3.push_back(nd5);
    treeNode* mid3 = tr->buildParentFromChildren(ch3);
    vector<treeNode*> ch6;
    ch6.push_back(mid3);
    ch6.push_back(mid4);
    treeNode * root = tr->buildParentFromChildren(ch6);
    tr->setRoot(root);

    tl.setTree(tr);

    double r = tl.cost();
    EXPECT_NEAR(r, 6.4982, 1e-3);

    TreeLasso tl2 = TreeLasso();
    tl2.setXY(X, y);
    tl2.updateBeta(beta);
    tl2.setMu(0.01);
    tl2.setLambda(10);
    tl2.setThreshold(0.5);
    tl2.hierarchicalClustering();
    tl2.initGradientUpdate();
    r = tl2.cost();
    EXPECT_NEAR(r, 1.77914, 1e-3);
}

TEST(TREE_LASSO, HierarchicalClustering){
    MatrixXd X(4, 6);
    X << 0.4509,    0.1890,    0.6256,    0.7757,    0.3063,    0.7948,
    0.5470,    0.6868,    0.7802,    0.4868,    0.5085,    0.6443,
    0.2963,    0.1835,    0.0811,    0.4359,    0.5108,    0.3786,
    0.7447,    0.3685,    0.9294,    0.4468,    0.8176,    0.8116;
    MatrixXd y(4, 5);
    y << -1.3302,   -0.8198,    0.9233,    0.8666,    2.3260,
    -1.0999,   -0.8959,    2.2639,    2.0579,   -0.2151,
    -0.0032,    0.3647,    0.7551,    0.7000,   -0.6198,
    -0.9786,   -0.8553,    1.6659,    1.5554,    0.9160;

    // clustering relationship of y is (((2,3),4),(0,1))

    MatrixXd beta(6, 5);
    beta << 0,         0,    1.0000,    1.0000,         0,
    0,         0,    2.5000,    2.2000,   -4.0000,
    -1.5000,   -1.8000,         0,         0,    3.0000,
    -0.9000,         0,         0,         0,    1.5000,
    1.0000,     1.0000,         0,         0,   -2.2000,
    0,         0,         0,         0,    0.9000;
    TreeLasso tl = TreeLasso();
    tl.setXY(X, y);
    tl.updateBeta(beta);
    tl.hierarchicalClustering();

    Tree * rtr = tl.getTree();

    Tree* tr = new Tree();
    treeNode* nd1 = tr->buildLeafNode(2);
    treeNode* nd2 = tr->buildLeafNode(3);
    vector<treeNode*> ch1;
    ch1.push_back(nd1);
    ch1.push_back(nd2);
    treeNode* mid1 = tr->buildParentFromChildren(ch1);
    treeNode* nd3 = tr->buildLeafNode(4);
    vector<treeNode*> ch4;
    ch4.push_back(nd3);
    ch4.push_back(mid1);
    treeNode* mid4 = tr->buildParentFromChildren(ch4);

    treeNode* nd4 = tr->buildLeafNode(0);
    treeNode* nd5 = tr->buildLeafNode(1);
    vector<treeNode*> ch3;
    ch3.push_back(nd4);
    ch3.push_back(nd5);
    treeNode* mid3 = tr->buildParentFromChildren(ch3);
    vector<treeNode*> ch6;
    ch6.push_back(mid3);
    ch6.push_back(mid4);
    treeNode * root = tr->buildParentFromChildren(ch6);
    tr->setRoot(root);

    TEST_TREE_NEAR(tr, rtr, 1e-3);
}

TEST(TREE_LASSO, ProximalDerivative){
    Tree* tr = new Tree();
    treeNode* nd1 = tr->buildLeafNode(2);
    treeNode* nd2 = tr->buildLeafNode(3);
    vector<treeNode*> ch1;
    ch1.push_back(nd1);
    ch1.push_back(nd2);
    treeNode* mid1 = tr->buildParentFromChildren(ch1);
    treeNode* nd3 = tr->buildLeafNode(4);
    vector<treeNode*> ch4;
    ch4.push_back(nd3);
    ch4.push_back(mid1);
    treeNode* mid4 = tr->buildParentFromChildren(ch4);

    treeNode* nd4 = tr->buildLeafNode(0);
    treeNode* nd5 = tr->buildLeafNode(1);
    vector<treeNode*> ch3;
    ch3.push_back(nd4);
    ch3.push_back(nd5);
    treeNode* mid3 = tr->buildParentFromChildren(ch3);
    vector<treeNode*> ch6;
    ch6.push_back(mid3);
    ch6.push_back(mid4);
    treeNode * root = tr->buildParentFromChildren(ch6);
    tr->setRoot(root);

    MatrixXd X(4, 6);
    X << 0.4509,    0.1890,    0.6256,    0.7757,    0.3063,    0.7948,
    0.5470,    0.6868,    0.7802,    0.4868,    0.5085,    0.6443,
    0.2963,    0.1835,    0.0811,    0.4359,    0.5108,    0.3786,
    0.7447,    0.3685,    0.9294,    0.4468,    0.8176,    0.8116;
    MatrixXd y(4, 5);
    y << -1.3302,   -0.8198,    0.9233,    0.8666,    2.3260,
    -1.0999,   -0.8959,    2.2639,    2.0579,   -0.2151,
    -0.0032,    0.3647,    0.7551,    0.7000,   -0.6198,
    -0.9786,   -0.8553,    1.6659,    1.5554,    0.9160;

    // clustering relationship of y is (((2,3),4),(0,1))

    MatrixXd beta(6, 5);
    beta << 0,         0,    1.0000,    1.0000,         0,
    0,         0,    2.5000,    2.2000,   -4.0000,
    -1.5000,   -1.8000,         0,         0,    3.0000,
    -0.9000,         0,         0,         0,    1.5000,
    1.0000,     1.0000,         0,         0,   -2.2000,
    0,         0,         0,         0,    0.9000;
    TreeLasso tl = TreeLasso();
    tl.setXY(X, y);
    tl.updateBeta(beta);
    tl.setMu(0.01);
    tl.setLambda(10);
    tl.setThreshold(1);
    tl.setTree(tr);
    tl.initGradientUpdate();

    MatrixXd grad(6,5);
    grad << -0.0000,    0.0001,    0.4421,    0.4420,   -0.0001,
    -0.0000,    0.0000,    0.4017,    0.3535,   -0.1922,
    -0.1601,   -0.1920,    0.0002,    0.0001,    0.2499,
    -0.2500,    0.0001,    0.0001,    0.0001,    0.2498,
    0.1768,    0.1768,    0.0001,   0.0001,   -0.2501,
    -0.0000,    0.0001,    0.0002,    0.0001,    0.2498;

    MatrixXd r = tl.proximal_derivative();
    TEST_MATRIX_NEAR(r, grad, 1e-3);
}

TEST(MULTI_POP_LASSO, CostFunction){

}

TEST(MULTI_POP_LASSO, Prediction){

}

TEST(MULTI_POP_LASSO, ProximalDerivative){

}

TEST(MULTI_POP_LASSO, ProximalOperator){

}


int main(int argc, char** argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}