//
// Created by haohanwang on 1/24/16.
//

#ifndef ALGORITHMS_TREELASSO_HPP
#define ALGORITHMS_TREELASSO_HPP

#include "Model.hpp"

#include <iostream>
#include <unordered_map>
#include <vector>

using namespace std;
using namespace Eigen;

struct treeNode{
    vector<long> trait;
    vector<treeNode*> children;
    double s;
    double weight;
};

struct minXY{
    long x;
    long y;
};

class Tree{
private:
    treeNode* root;
public:
    treeNode* getRoot();
    treeNode* buildParentFromChildren(vector<treeNode*>);
    treeNode* buildLeafNode(long);

    void setRoot(treeNode*);

    void setWeight();

    Tree();
    ~Tree();
};

class TreeLasso :public Model {
private:
    Tree* T;
    string clusteringMethod;
    double threshold;
    MatrixXd mD;
    MatrixXd mD_;
    MatrixXd XX;
    double lambda;
    bool initGradientFlag;

    MatrixXd XY;
    MatrixXd mTw;
    MatrixXd mT;
    MatrixXd C;
    MatrixXi gIdx;
    double tauNorm;
    double L;
    double mu;

    void removeRow(MatrixXd*, long);
    void removeCol(MatrixXd*, long);
    minXY searchMin(MatrixXd);

    MatrixXd appendColRow(MatrixXd, minXY);
    void removeColRow(MatrixXd*, minXY);
    void updateMap(unordered_map<long, treeNode*>*, minXY);

    void setWeight();
    double penalty_cost();

    double l1NormIndex(vector<long>);
    double l2NormIndex(vector<long>);
    double l2NormIndexIndex(long, vector<long>);

    double updateMD_denominator();

    void prune();
    void penaltyWeights();
    void initMatrixD();

    long countNodes();
    long countNoneZeroNodes();

    static constexpr double default_lambda = 0;
    static constexpr const char* default_clustering_method = "single";
    static constexpr double default_threshold = 1;
    static constexpr double default_mu = 0.01;

public:
    void setX(MatrixXd);
    void setY(MatrixXd);
    void setXY(MatrixXd, MatrixXd);
    void setTree(Tree*);
    void setLambda(double);
    void setMu(double);
    void initBeta();
    void assertReadyToRun();

    void initIterativeUpdate();
    void initGradientUpdate();

    Tree* getTree();

    void hierarchicalClustering();

    void setClusteringMethod(string);
    void setThreshold(double);

    double cost();

    void updateMD();
    void updateBeta();
    void updateBeta(MatrixXd);

    double getL();

    MatrixXd proximal_derivative();
    MatrixXd proximal_operator(MatrixXd, float);

    TreeLasso();
    TreeLasso(const unordered_map<string, string>&);
    ~TreeLasso();
};

#endif //ALGORITHMS_TREELASSO_HPP
