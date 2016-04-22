#!/bin/bash
tests=(//Scheduler:Scheduler_Tests)
result=0
bazel=../depends/bazel_install/binary/bazel
flags="--spawn_strategy=standalone --test_output=errors --verbose_failures"
for test in "${tests[@]}"; do
	OUTPUT="$(${bazel} test $test ${flags})"
	cur_result=$?
	echo $OUTPUT
	if [ $? -ne 0 ]
		then result=1
	fi
done

exit ${result}
