#!/bin/bash
set -e
# Should be run from INSIDE a Docker container
rebuild_node=1

tests=(//Scheduler:Scheduler_Tests)
bazel=/usr/src/genamap/depends/bazel_install/binary/bazel
flags="--spawn_strategy=standalone --test_output=all --color=yes --ignore_unsupported_sandboxing"
for test in "${tests[@]}"; do
	cmd="${bazel} test $test ${flags}"
	eval "$cmd 2>&1"
done

if [ $rebuild_node -eq 1 ]
	then cd /usr/src/genamap/src/Scheduler/node
	node-gyp rebuild
fi
