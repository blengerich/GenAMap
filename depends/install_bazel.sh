set -e

# Install JDK 8
# sudo apt-get-repository ppa:webupd8team/java
# sudo apt-get update
# sudo apt-get install oracle-java8-installer

if [ -e bazel-installer ]
then	
	exit 0
fi

BAZEL_VERSION=0.1.4
INSTALLER_PLATFORM=linux-x86_64

# Fetch the Bazel installer
URL=https://github.com/bazelbuild/bazel/releases/download/${BAZEL_VERSION}/bazel-${BAZEL_VERSION}-installer-${INSTALLER_PLATFORM}.sh
export BAZEL_INSTALLER=${PWD}/bazel-installer/install.sh
mkdir bazel-installer
curl -L -o ${BAZEL_INSTALLER} ${URL}
BASE="${PWD}/bazel_install"

# Install bazel inside ${BASE}
bash "${BAZEL_INSTALLER}" \
  --base="${BASE}" \
  --bazelrc="${BASE}/bin/bazel.bazelrc" \
  --bin="${BASE}/binary"

# Run the build
BAZEL="${BASE}/binary/bazel --bazelrc=${BASE}/bin/bazel.bazelrc"
# ${BAZEL} test //...
