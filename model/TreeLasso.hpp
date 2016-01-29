//
// Created by haohanwang on 1/24/16.
//

#ifndef ALGORITHMS_TREELASSO_HPP
#define ALGORITHMS_TREELASSO_HPP

#include <vector>
#include <iostream>
#include "Model.hpp"

using namespace std;

struct treeNode{
    vector<long> trait;
    vector<treeNode*> children;
    double s;
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
public:
    void setX(MatrixXd);
    void setY(MatrixXd);
    void setXY(MatrixXd, MatrixXd);
    void setTree(Tree);
    void initBeta();

    void hierarchicalClustering();
    ~TreeLasso();
};

#endif //ALGORITHMS_TREELASSO_HPP
