//
// Created by haohanwang on 1/24/16.
//

#ifndef ALGORITHMS_TREELASSO_HPP
#define ALGORITHMS_TREELASSO_HPP

#include "Model.hpp"

#ifdef BAZEL
#include "Math/Math.hpp"
#else
#include "../Math/Math.hpp"
#endif

using namespace std;
using namespace Eigen;


class TreeLasso :public Model {
private:
    Tree* T;
    string clusteringMethod;
    float threshold;
    MatrixXf mD;
    MatrixXf mD_;
    MatrixXf XX;
    float lambda;
    bool initGradientFlag;

    MatrixXf XY;
    MatrixXf mTw;
    MatrixXf mT;
    MatrixXf C;
    MatrixXi gIdx;
    float tauNorm;
    float L;
    float mu;

    void removeRow(MatrixXf*, long);
    void removeCol(MatrixXf*, long);
    minXY searchMin(MatrixXf);

    MatrixXf appendColRow(MatrixXf, minXY);
    void removeColRow(MatrixXf*, minXY);
    void updateMap(unordered_map<long, treeNode*>*, minXY);

    void setWeight();
    float penalty_cost();

    float l1NormIndex(vector<long>);
    float l2NormIndex(vector<long>);
    float l2NormIndexIndex(long, vector<long>);

    float updateMD_denominator();

    void prune();
    void penaltyWeights();
    void initMatrixD();

    long countNodes();
    long countNoneZeroNodes();

    static constexpr float default_lambda = 0;
    static constexpr const char* default_clustering_method = "single";
    static constexpr float default_threshold = 1;
    static constexpr float default_mu = 0.01;

public:
    void setX(MatrixXf);
    void setY(MatrixXf);
    void setXY(MatrixXf, MatrixXf);
    void setTree(Tree*);
    void setLambda(float);
    void setMu(float);
    void initBeta();
    void assertReadyToRun();

    void initIterativeUpdate();
    void initGradientUpdate();

    Tree* getTree();

    void hierarchicalClustering();

    void setClusteringMethod(string);
    void setThreshold(float);

    float cost();

    void updateMD();
    void updateBeta();
    void updateBeta(MatrixXf);

    float getL();

    MatrixXf proximal_derivative();
    MatrixXf proximal_operator(MatrixXf, float);

    TreeLasso();
    TreeLasso(const unordered_map<string, string>&);
    ~TreeLasso();
};

#endif //ALGORITHMS_TREELASSO_HPP
