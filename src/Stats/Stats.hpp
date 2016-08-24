
#ifndef STATS_STATS_HPP
#define STATS_STATS_HPP

#include <Eigen/Dense>
#include <unordered_map>

using namespace Eigen;
using namespace std;

namespace Stats {
//public:
    double ChiSquaredTest(MatrixXd, MatrixXd);
    double ChiToPValue(double, int);
    double WaldTest(double mle, double var, double candidate);
    double FisherExactTest(MatrixXd);
    double BonCorrection(double, int);
};

class StatsBasic{
protected:
    MatrixXd X;
    MatrixXd beta;
    MatrixXd y;
    long correctNum;
    int genoType;

    void checkGenoType();
public:
    void setX(const MatrixXd&);
    void setY(const MatrixXd&);
    void setCorrectNum(long);
    virtual void setAttributeMatrix(const string&, MatrixXd*);
    MatrixXd getBeta();

    void BonferroniCorrection();

    virtual void assertReadyToRun();
    virtual void run(){};

    StatsBasic();
    StatsBasic(const unordered_map<string, string>&);

    virtual ~StatsBasic(){};
};

#endif //STATS_STATS_HPP