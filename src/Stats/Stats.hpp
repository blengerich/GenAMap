
#ifndef STATS_STATS_HPP
#define STATS_STATS_HPP

#include <Eigen/Dense>
#include <unordered_map>
#include <string>
#ifdef BAZEL
#include "Models/Model.hpp"
#else
#include "../Models/Model.hpp"
#endif

using namespace Eigen;
using namespace std;

namespace Stats {
//public:
    double ChiSquaredTest(MatrixXd, MatrixXd);
    double ChiToPValue(double, int);
    double WaldTest(double mle, double var, double candidate);
    double FisherExactTest(MatrixXd);
    double BonCorrection(double, int);
    double get_ts(double beta, double var, double sigma);
    double get_qs(double ts, int N, int q);
};

class StatsBasic : public Model{
protected:
    bool correct;
    int genoType;

    // algorithm use
    double progress;
    bool isRunning;
    bool shouldStop;

    void checkGenoType();
public:
    virtual void setAttributeMatrix(const string&, MatrixXd*);

    void BonferroniCorrection();

    virtual void assertReadyToRun();
    virtual void run() {};
    virtual void setUpRun();
    virtual void finishRun();

    StatsBasic();
    StatsBasic(const unordered_map<string, string>&);

    // algorithm replacement
    double getProgress();
    bool getIsRunning();
    void stop();

    virtual ~StatsBasic(){};
};

#endif //STATS_STATS_HPP