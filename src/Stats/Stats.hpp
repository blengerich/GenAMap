
#ifndef STATS_STATS_HPP
#define STATS_STATS_HPP

#include <Eigen/Dense>
#include <unordered_map>
#include <string>
#include <math.h>
#ifdef BAZEL
#include "Models/Model.hpp"
#else
#include "../Models/Model.hpp"
#endif

using namespace Eigen;
using namespace std;

namespace Stats {
//public:
    float ChiSquaredTest(MatrixXf, MatrixXf);
    float ChiToPValue(float, int);
    float WaldTest(float mle, float var, float candidate);
    float FisherExactTest(MatrixXf);
    float BonCorrection(float, int);
    float get_ts(float beta, float var, float sigma);
    float get_qs(float ts, int N, int q);
};

class StatsBasic : public Model{
protected:
    bool shouldCorrect;
    int genoType;

    // algorithm use
    float progress;
    bool isRunning;
    bool shouldStop;

    void checkGenoType();
public:
    virtual void setAttributeMatrix(const string&, MatrixXf*);

    void BonferroniCorrection();

    MatrixXf getBeta();

    virtual void assertReadyToRun();
    virtual void run() {};
    virtual void setUpRun();
    virtual void finishRun();

    StatsBasic();
    StatsBasic(const unordered_map<string, string>&);

    // algorithm replacement
    float getProgress();
    bool getIsRunning();
    void stop();

    virtual ~StatsBasic(){};
};

#endif //STATS_STATS_HPP