from __future__ import print_function
import random

def generate_markers(n_samples, n_markers, file_name):
	with open(file_name + "_markerLabels.csv", 'w') as label_file:
		for j in xrange(n_markers):
			print('M{}'.format(j), file=label_file)

	with open(file_name + "_markerVals.csv", 'w') as value_file:
		for i in xrange(n_samples):
			for j in xrange(n_markers-1):
				print('{}'.format(random.randint(0, 2)), file=value_file, end=',')
			print('{}'.format(random.randint(0, 2)), file=value_file)


def generate_traits(n_samples, n_traits, file_name):
	with open(file_name + "_traitLabels.csv", 'w') as label_file:
		for j in xrange(n_traits):
			print('T{}'.format(j), file=label_file)

	with open(file_name + "_traitVals.csv", 'w') as value_file:
		for i in xrange(n_samples):
			for j in xrange(n_traits-1):
				print('{:.3f}'.format(random.random()), file=value_file, end=',')
			print('{:.3f}'.format(random.random()), file=value_file)


def generate_snps_features(n_markers, n_features, file_name):
	with open(file_name + "_snpsFeatures.csv", 'w') as snp_file:
		for i in xrange(n_markers):
			for j in xrange(n_features-1):
				print('{:.3f}'.format(random.random()), file=snp_file, end=',')
			print('{:.3f}'.format(random.random()), file=snp_file)


def generate_populations(n_markers, n_populations, file_name):
	with open(file_name + "_population.csv", 'w') as pop_file:
		for i in xrange(n_markers):
			print('{:d}'.format(random.randint(0, n_populations-1)), file=pop_file)


def generate_all(n_samples, n_markers, n_traits, n_features, n_populations, base_file_name):
	generate_markers(n_samples, n_markers, base_file_name)
	generate_traits(n_samples, n_traits, base_file_name)
	generate_snps_features(n_markers, n_features, base_file_name)
	generate_populations(n_markers, n_populations, base_file_name)


print("making tiny")
generate_all(n_samples=5, n_markers=1, n_traits=1, n_features=1, n_populations=1, base_file_name='tiny')
print("making small")
generate_all(n_samples=10, n_markers=10, n_traits=2, n_features=2, n_populations=2, base_file_name='small')
print("making medium")
generate_all(n_samples=100, n_markers=100, n_traits=5, n_features=5, n_populations=5, base_file_name='medium')
print("making large")
generate_all(n_samples=1000, n_markers=10000, n_traits=10, n_features=5, n_populations=10, base_file_name='large')
