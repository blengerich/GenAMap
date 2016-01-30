#ifndef PROGRESSSTATE_H_
#define PROGRESSSTATE_H_

class ProgressState {
public:
	ProgressState(unsigned int target);
	virtual ~ProgressState();

	unsigned int getPercentage();
	void setValue(int value);
private:
	unsigned int m_value;
	unsigned int m_target;
};

#endif /* PROGRESSSTATE_H_ */
