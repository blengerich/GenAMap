# GenAMap Input File Descriptions


## Marker Data
Marker data files contain the genotype information. In a true GWAS, these are SNP data files, although the association mapping methods can also be used for different types of data.

### Marker File
The marker file contains the genotype information for each sample. GenAMap expects a CSV file that represents a data matrix. Each row is a sample, each column is a value. The values should be integers (0,1,2) for SNP data, although the association mapping methods can be used for other datatypes.

### Marker Label File
The marker label file contains the names of each marker. This file is a list (one value per line) of names, where the order corresponds to the order of the columns in the marker file.


## Trait Data
Trait data files contain the phenotype information. These can be binary valued for case-control studies, or real-valued for eQTL studies.


### Trait File
The trait file contains the phenotype information for each sample. GenAMap expects a CSV file that represents a data matrix. Each row is a sample, each column is a trait to be mapped.


### Trait Label File
The trait label file contains the names of each trait. This file is a list (one value per line) of names, where the order corresponds to the order of the columns in the trait file.


## Population File
Population data can be used for the Multi-Population Lasso. This file is a list (one value per line) of values, where the order corresponds to the order of the rows of the marker/trait files. Each value indicates which population a sample belongs to.


## SNPs Feature File
Used for the "Adaptive Multi-task Lasso" algorithm to reweight the regularization parameter for each SNP by the amount of prior information. For CSV format, this file should have 1 float value per line, where each line corresponds to a marker.