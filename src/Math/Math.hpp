//
// Created by haohanwang on 2/8/16.
//

#ifndef ALGORITHMS_MATH_HPP
#define ALGORITHMS_MATH_HPP

#include <Eigen/Dense>
#include <vector>
#include <unordered_map>

using namespace Eigen;
using namespace std;

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

class Math {
private:
    Math() {};
    Math(Math const &);  // don't implement
    void operator=(Math const &); // don't implement

    minXY searchMin(MatrixXf);
    MatrixXf appendColRow(MatrixXf, minXY);
    void updateMap(unordered_map<long, treeNode*>*, minXY);


public:
    static Math &getInstance() {
        static Math instance;
        return instance;
    }
    // statistics
    double variance(VectorXd);
    double std(VectorXd);
    double covariance(VectorXd, VectorXd);
    double correlation(VectorXd, VectorXd);
    // matrix
    void removeCol(MatrixXf*, long);
    void removeRow(MatrixXf*, long);
    void removeColRow(MatrixXf*, minXY);


    VectorXd L2Thresholding(VectorXd in);

    Tree* hierarchicalClustering(MatrixXf);
};


#endif //ALGORITHMS_MATH_HPP
