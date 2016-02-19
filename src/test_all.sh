#!/bin/bash
tests=(//Scheduler:Scheduler_Tests)
for test in $tests; do
	echo "$(bazel test $test --test_output=errors)"
done

exit 0