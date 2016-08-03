from __future__ import print_function
import random

def generate_markers(n_samples, n_markers, file_name):
	with open(file_name + "_markerLabels.csv", 'w') as label_file:
		for j in xrange(n_markers):
			print('M{}'.format(j), file=label_file)

	with open(file_name + "_markerVals.csv", 'w') as value_file:
		for i in xrange(n_samples):
			for j in xrange(n_markers):
				print('{}'.format(random.randint(0, 2)), file=value_file, end=',')
			print('', file=value_file)


def generate_traits(n_samples, n_traits, file_name):
	with open(file_name + "_traitLabels.csv", 'w') as label_file:
		for j in xrange(n_traits):
			print('T{}'.format(j), file=label_file)

	with open(file_name + "_traitVals.csv", 'w') as value_file:
		for i in xrange(n_samples):
			for j in xrange(n_traits):
				print('{:.3f}'.format(random.random()), file=value_file, end=',')
			print('', file=value_file)


def generate_snps_features(n_markers, n_features, file_name):
	with open(file_name + "_snpsFeatures.csv", 'w') as snp_file:
		for i in xrange(n_markers):
			for j in xrange(n_features):
				print('{:.3f}'.format(random.random()), file=snp_file, end=',')
			print('', file=snp_file)


def generate_all(n_samples, n_markers, n_traits, n_features, base_file_name):
	generate_markers(n_samples, n_markers, base_file_name)
	generate_traits(n_samples, n_traits, base_file_name)
	generate_snps_features(n_markers, n_features, base_file_name)

# Tiny
generate_all(n_samples=5, n_markers=1, n_traits=1, n_features=1, base_file_name='tiny')
