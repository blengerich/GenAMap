#!/bin/bash
tests=(//Scheduler:Scheduler_Tests //examples:my_test)
result=0
bazel=../depends/bazel_install/binary/bazel
for test in $tests; do
	OUTPUT="$(${bazel} test ${test} --test_output=errors)"
	cur_result=$?
	echo $OUTPUT
	if [ $? -ne 0 ]
		then result=1
	fi
done

exit ${result}