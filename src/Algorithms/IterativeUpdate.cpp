//
// Created by haohanwang on 1/31/16.
//

#include "IterativeUpdate.hpp"
#include <limits>
#include <map>

using namespace std;

IterativeUpdate::IterativeUpdate(const unordered_map<string, string>& options) {
    try {
        setTolerance(stof(options.at("tolerance")));
    } catch (std::out_of_range& oor) {
        setTolerance(default_tolerance);
    }
}

void IterativeUpdate::setTolerance(float t) {tol = t;}

/*void IterativeUpdate::setUpRun() {
    mtx.lock();
}
void IterativeUpdate::finishRun() {
    mtx.unlock();
}*/

void IterativeUpdate::assertReadyToRun() {
    throw runtime_error("Iterative Update not implemented yet");
}

void IterativeUpdate::run(shared_ptr<Model> model) {
    if (!model.get()) {
        throw runtime_error("Model not initialized");
    } else if (shared_ptr<TreeLasso> model = dynamic_pointer_cast<TreeLasso>(model)) {
        run(model);
    } else {
        throw runtime_error("Bad type of model for Algorithm: IterativeUpdate");
    }
}

void IterativeUpdate::run(shared_ptr<TreeLasso> tl) {
    float i = 0;
    MatrixXf bestBeta = tl->getBeta();
    tl->initIterativeUpdate();
    while (!shouldStop && i < maxIteration){
        progress = i/maxIteration;
        residue = tl->cost();
        if (residue < prev_residue){
            bestBeta = tl->getBeta();
        }
        if (abs(prev_residue-residue)<tol){
            break;
        }
        else{
            prev_residue = residue;
        }
        tl->updateMD();
        tl->updateBeta();
        i +=1;
    }
    tl->updateBeta(bestBeta);
}

IterativeUpdate::IterativeUpdate() {
    tol = 1e-5;
    prev_residue = numeric_limits<float>::max();
}
