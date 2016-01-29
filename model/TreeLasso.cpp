//
// Created by haohanwang on 1/24/16.
//

#include "TreeLasso.hpp"

Tree::Tree() {
    root = NULL;
}

Tree::~Tree() {
    if (root == NULL){
    }
    else{
        treeNode * tmp = root;
        vector<treeNode*> tmplist = tmp->children;
        while (tmplist.size()>0){
            delete tmp;
            tmp = tmplist[0];
            if (tmp->children.size()!=0){
                tmplist.insert(tmplist.end(), tmp->children.begin(), tmp->children.end());
            }
            tmplist.erase(tmplist.begin());
        }
    }
}

treeNode* Tree::getRoot() {
    return root;
}

void Tree::setRoot(treeNode * r) {
    root = r;
}

treeNode* Tree::buildParentFromChildren(vector<treeNode *> chd) {
    treeNode* par = new treeNode();
    vector<long> tmp;
    par->trait = tmp;
    for (long i=0;i<chd.size();i++){
        par->trait.insert(par->trait.end(), chd[i]->trait.begin(), chd[i]->trait.end());
    }
    par->children = chd;
    par->s = chd[0]->s + 1;
    return par;
}

treeNode* Tree::buildLeafNode(long t) {
    treeNode* n = new treeNode();
    vector<long> tmp1;
    vector<treeNode*> tmp2;
    n->trait = tmp1;
    n->trait.push_back(t);
    n->children = tmp2;
    n->s = 1;
    return n;
}

void Tree::setWeight() {
    double n = root->s;
    treeNode * tmp = root;
    vector<treeNode*> tmplist = tmp->children;
    while (tmplist.size()>0){
        tmp->s = tmp->s/n;
        tmp = tmplist[0];
        if (tmp->children.size()!=0){
            tmplist.insert(tmplist.end(), tmp->children.begin(), tmp->children.end());
        }
        tmplist.erase(tmplist.begin());
    }
}

void TreeLasso::setX(MatrixXd x) {
    try{
        throw 20;
    }
    catch (int){
        cerr << "TreeLasso does not support setX() and setY() individually, please use setXY instead";
    }
}

void TreeLasso::setY(MatrixXd x) {
    try{
        throw 20;
    }
    catch (int){
        cerr << "TreeLasso does not support setX() and setY() individually, please use setXY instead";
    }
}

void TreeLasso::setXY(MatrixXd m, MatrixXd n) {
    X = m;
    y = n;
    initBeta();
}

void TreeLasso::initBeta() {
    long c = X.cols();
    long d = y.cols();
    beta = MatrixXd::Random(c, d);
}

void TreeLasso::hierarchicalClustering() {
    long n = y.rows();
    MatrixXd weights(n, n, 0);
    vector<treeNode*> ptrs;
    T = new Tree();
    for (long i = 0; i<n; i++){
        ptrs.push_back(T->buildLeafNode(i));
        weights.row(i) =(y.rowwise() - y.row(i)).rowwise().squaredNorm();
    }

}

TreeLasso::~TreeLasso() {
    delete T;
}
