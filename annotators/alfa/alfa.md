# ALFA: Allele Frequency Aggregator

## ALFA at a glance:

* The aim is to provide allele frequency from more than 1 million subjects by adding 100-200K new subjects available in dbGaP with each ALFA quarterly release.
* The initial release of ~100 thousand subjects included allele counts and frequency for 447 million rs site including 4 million novel ones aggregated from 551 billion genotypes.
* The dbGaP studies include chip array, exome, and genomic sequencing data with subjects from 12 diverse populations including European, African, Asian, Latin American, and others.
* The data will be integrated with dbSNP regular build release with assigned RS accessions for variants and available for access by web, FTP, and API.

## Background

NCBI database of Genotypes and Phenotypes (dbGaP) contains the results of over 1,200 studies that have investigated the interaction of genotype and phenotype. The database has over two million subjects and hundreds of millions of variants along with thousands of phenotypes and molecular assay data. This unprecedented volume and variety of data promise huge opportunities to identify genetic factors that influence health and disease. NIH has recently lifted the restriction on Genomic Summary Results (GSR) access for responsible sharing and use of the data. In fulfilling this updated GSR policy and to promote research toward identifying genetic variants that contribute to health and disease, NCBI developed the Allele Frequency Aggregator (ALFA) pipeline to compute allele frequency for variants in dbGaP across approved un-restricted studies and to provide the data as open-access to the public through dbSNP. The goal of the ALFA project is to make frequency data from over 1M dbGaP subjects open-access in future releases to facilitate discoveries and interpretations of common and rare variants with biological impacts or causing diseases. Toward that goal, over 925K dbGaP subjects with genotype data have been analyzed using GRAF-pop as candidates for the ALFA project, pending study approval and processing.

## Populations

[Sample](https://www.ncbi.nlm.nih.gov/snp/docs/gsr/data_inclusion/#Sample) ancestries are validated using [GRAF-pop](https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/Software.cgi) and assigned to [12 major populations](https://www.ncbi.nlm.nih.gov/snp/docs/gsr/data_inclusion/#population) including European, Hispanic, African, Asian, and others ([Jin et al., 2019](https://www.g3journal.org/content/9/8/2447)).

Information from https://www.ncbi.nlm.nih.gov/snp/docs/gsr/alfa/#citing-this-project