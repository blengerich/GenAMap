#include "ProgressState.h"

ProgressState::ProgressState(unsigned int target)
	: m_value(0), m_target(target)
{
}

ProgressState::~ProgressState()
{
}

void ProgressState::setValue(int value)
{
	if(value < 0)
	{
		m_value = 0;
	}
	else if(value > (int)m_target)
	{
		m_value = m_target;
	}
	else
	{
		m_value = value;
	}

}

unsigned int ProgressState::getPercentage()
{
	return m_value * 100 / m_target;
}
