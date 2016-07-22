#!/bin/bash
set -e
# Should be run from INSIDE a Docker container
cpp_tests=1
rebuild_node=1
node_tests=1

cd /usr/src/genamap/src
if [ $cpp_tests -eq 1 ]
	then tests=(//Models:Model_Tests //Stats:Stats_Tests //Scheduler:Scheduler_Tests)
	flags="--test_verbose_timeout_warnings --spawn_strategy=standalone --test_output=all --color=yes --ignore_unsupported_sandboxing"
	eval "bazel clean --spawn_strategy=standalone --ignore_unsupported_sandboxing 2>&1"
	for test in "${tests[@]}"; do
		cmd="bazel test $test ${flags}"
		eval "$cmd 2>&1"
	done
fi

if [ $rebuild_node -eq 1 ]
	then cd /usr/src/genamap/src/Scheduler/node
	node-gyp rebuild
fi

if [ $node_tests -eq 1 ]
	then cd /usr/src/genamap/src/frontend
	eval "npm install"
	eval "mocha"
fi
