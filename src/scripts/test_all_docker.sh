#!/bin/bash
set -e
# Should be run from INSIDE a Docker container
cpp_tests=1
rebuild_node=1
node_tests=1

if [ $cpp_tests -eq 1 ]
	then tests=(//Scheduler:Scheduler_Tests)
	bazel=/usr/src/genamap/depends/bazel_install/binary/bazel
	flags="--spawn_strategy=standalone --test_output=all --color=yes --ignore_unsupported_sandboxing"
	for test in "${tests[@]}"; do
		cmd="${bazel} test $test ${flags}"
		eval "$cmd 2>&1"
	done
fi

if [ $rebuild_node -eq 1 ]
	then cd /usr/src/genamap/src/Scheduler/node
	node-gyp rebuild
fi

if [ $node_tests -eq 1 ]
	then cd /usr/src/genamap/src/frontend/genamapApp
	eval "npm install"
	eval "mocha"
fi
