//
// Created by haohanwang on 2/8/16.
//

#include "Math.hpp"
#include <queue>

Tree::Tree() {
    root = 0;
}

Tree::~Tree() {
    if (root == 0) {
    }
    else {
        treeNode *tmp = root;
        vector<treeNode *> tmplist = tmp->children;
        while (tmplist.size() > 0) {
            delete tmp;
            tmp = tmplist[0];
            if (tmp->children.size() != 0) {
                tmplist.insert(tmplist.end(), tmp->children.begin(), tmp->children.end());
            }
            tmplist.erase(tmplist.begin());
        }
    }
}

treeNode *Tree::getRoot() {
    return root;
}

void Tree::setRoot(treeNode *r) {
    root = r;
}

treeNode *Tree::buildParentFromChildren(vector<treeNode *> chd) {
    treeNode *par = new treeNode();
    vector<long> tmp;
    par->trait = tmp;
    par->s = 0;
    for (unsigned long i = 0; i < chd.size(); i++) {
        par->trait.insert(par->trait.end(), chd[i]->trait.begin(), chd[i]->trait.end());
        par->s = max(chd[i]->s + 1, par->s);
    }
    par->children = chd;
    par->weight = 0;
    return par;
}

treeNode *Tree::buildLeafNode(long t) {
    treeNode *n = new treeNode();
    vector<long> tmp1;
    vector<treeNode *> tmp2;
    n->trait = tmp1;
    n->trait.push_back(t);
    n->children = tmp2;
    n->s = 1;
    n->weight = 0;
    return n;
}

void Tree::setWeight() {
    double n = root->s;
    double prev_s = 0;
    queue<treeNode *> nodes;
    nodes.push(root);
    while (nodes.size()>0){
        treeNode * node = nodes.front();
        prev_s = node->s;
        node->s = node->s / n;
        for (unsigned int i=0;i<node->children.size(); i++){
            node->children[i]->s = prev_s - 1;
            nodes.push(node->children[i]);
        }
        nodes.pop();
    }
}

double Math::variance(VectorXd v) {
    double mean = v.mean();
    v = (v.array() - mean).matrix();
    return v.squaredNorm() / v.size();
}

double Math::covariance(VectorXd v1, VectorXd v2) {
    double m1 = v1.mean();
    double m2 = v2.mean();
    return ((v1.array() - m1) * (v2.array() - m2)).matrix().mean();
}

double Math::correlation(VectorXd v1, VectorXd v2) {
    double cov = covariance(v1, v2);
    double var1 = std(v1);
    double var2 = std(v2);
    if (var1 == 0 or var2 == 0){
        return 0;
    }
    return cov / (var1 * var2);
}

double Math::std(VectorXd v) {
    double mean = v.mean();
    v = (v.array() - mean).matrix();
    return sqrt(v.squaredNorm() / v.size());
}

void Math::removeCol(MatrixXf *mptr, long y) {
    long numRows = mptr->rows();
    long numCols = mptr->cols() - 1;

    if (y < numCols)
        mptr->block(0, y, numRows, numCols - y) = mptr->block(0, y + 1, numRows, numCols - y);

    mptr->conservativeResize(numRows, numCols);
}

VectorXd Math::L2Thresholding(VectorXd in) {
    if (in.norm()>1){
        return in/in.norm();
    }
    else{
        return in;
    }
}

Tree *Math::hierarchicalClustering(MatrixXf X) {
    Tree * T;
    long n = X.cols();
    MatrixXf weights = MatrixXf::Zero(n, n);
    T = new Tree();
    unordered_map<long, treeNode *> maps;
    for (long i = 0; i < n; i++) {
        treeNode *t = T->buildLeafNode(i);
        maps.insert({i, t});
        weights.row(i) = (X.colwise() - X.col(i)).colwise().squaredNorm();
    }
    minXY xy;
    while (maps.size() > 1) {
        xy = searchMin(weights);
        treeNode *t1 = maps.at(xy.x);
        treeNode *t2 = maps.at(xy.y);
        vector<treeNode *> tv;
        tv.push_back(t1);
        tv.push_back(t2);
        treeNode *p = T->buildParentFromChildren(tv);
        maps.insert({maps.size(), p});
        weights = appendColRow(weights, xy);
        removeColRow(&weights, xy);
        updateMap(&maps, xy);
    }
    treeNode *root = maps.at(0);
    T->setRoot(root);
    return T;
}

void Math::removeRow(MatrixXf *mptr, long x) {
    long numRows = mptr->rows() - 1;
    long numCols = mptr->cols();

    if (x < numRows)
        mptr->block(x, 0, numRows - x, numCols) = mptr->block(x + 1, 0, numRows - x, numCols);

    mptr->conservativeResize(numRows, numCols);
}

void Math::updateMap(unordered_map<long, treeNode *> *mptr, minXY xy) {
    long n = mptr->size();
    mptr->erase(xy.x);
    mptr->erase(xy.y);
    long k;
    treeNode *t;
    for (long i = xy.x + 1; i < n; i++) {
        if (i != xy.y) {
            t = mptr->at(i);
            if (i < xy.y) {
                k = i - 1;
            }
            else if (i > xy.y) {
                k = i - 2;
            }
            mptr->erase(i);
            mptr->insert({k, t});
        }
    }
}

MatrixXf Math::appendColRow(MatrixXf mat, minXY xy) {
    long r = mat.rows();
    MatrixXf result = MatrixXf::Zero(r + 1, r + 1);
    VectorXd col = VectorXd::Zero(r);
    col = ((mat.col(xy.x).array()).max(mat.col(xy.y).array())).matrix();
    result.block(0, 0, r, r) = mat;
    result.block(0, r, r, 1) = col;
    result.block(r, 0, 1, r) = col.transpose();
    return result;
}

minXY Math::searchMin(MatrixXf m) {
    long r = m.rows();
    minXY xy;
    xy.x = 0;
    xy.y = 0;
    double tmpV = numeric_limits<double>::max();
    for (long i = 0; i < r; i++) {
        for (long j = i + 1; j < r; j++) {
            if (m(i, j) < tmpV) {
                tmpV = m(i, j);
                xy.x = i;
                xy.y = j;
            }
        }
    }
    return xy;
}

void Math::removeColRow(MatrixXf *mptr, minXY xy) {
    removeRow(mptr, xy.y);
    removeRow(mptr, xy.x);
    removeCol(mptr, xy.y);
    removeCol(mptr, xy.x);
}