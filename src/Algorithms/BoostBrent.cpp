/*
 * BoostBrent.cpp
 *
 * Created on: April 10, 2017
 * Author: Jie Xie (jiexie@andrew.cmu.edu)
 */

#include "BoostBrent.hpp"

#ifdef BAZEL
#include "Models/lmm.hpp"
#else
#include "../Models/lmm.hpp"
#endif

BoostBrent::BoostBrent() {
	ldelta_start = default_ldelta_start;
	ldelta_end = default_ldelta_end;
	ldelta_interval = default_ldelta_interval;
}

BoostBrent::BoostBrent(const unordered_map<string, string> opts) {
	try {
        	ldelta_start = stod(opts.at("ldelta_start"));
    	} catch (std::out_of_range& oor) {
        	ldelta_start = default_ldelta_start;
    	}
    	try {
        	ldelta_end = stod(opts.at("ldelta_end"));
    	} catch (std::out_of_range& oor) {
        	ldelta_end = default_ldelta_end;
    	}
    	try {
        	ldelta_interval = stod(opts.at("ldelta_interval"));
    	} catch (std::out_of_range& oor) {
        	ldelta_interval = default_ldelta_interval;
    	}
}

void BoostBrent::set_ldelta_start(float start) {
	this->ldelta_start = start;
}

void BoostBrent::set_ldelta_end(float end) {
	this->ldelta_end = end;
}

void BoostBrent::set_ldelta_interval(float interval) {
	this->ldelta_interval = interval;
}

float BoostBrent::get_ldelta_start() {
	return this->ldelta_start;
}

float BoostBrent::get_ldelta_end() {
	return this->ldelta_end;
}

float BoostBrent::get_ldelta_interval() {
	return this->ldelta_interval;
}

void BoostBrent::run(shared_ptr<Model> model) {
	if (!model) {
        	throw runtime_error("Model not initialized");
    	} else if (shared_ptr<FaSTLMM> model = dynamic_pointer_cast<FaSTLMM>(model)) {
        	run(model);
    	} else {
        	throw runtime_error("Bad type of model for Algorithm: BoostBrent");
    	}
}

void BoostBrent::run(shared_ptr<FaSTLMM> model) {
	mtx.lock();
	float start_val = this->get_ldelta_start();
	float end_val = this->get_ldelta_end();
	float interval = this->get_ldelta_interval();

	model->init();
	model->train(interval, start_val, end_val);
	mtx.unlock();
	return;
}


