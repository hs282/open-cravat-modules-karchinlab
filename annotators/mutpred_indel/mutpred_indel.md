# MuPred-Indel

MutPred-Indel is a machine learning-based method and software package that integrates genetic and molecular data to reason probabilistically about the pathogenicity of nonframeshifting indel variants. The model provides both pathogenicity prediction and a ranked list of molecular alterations potentially affecting phenotype. It is trained on a set of pathogenic and unlabeled (putatively neutral) variants obtained from the Human Gene Mutation Database (HGMD) [1] and ExAC [2]. MutPred-Indel is a bagged ensemble of 100 feed-forward neural networks, each trained on a balanced subset of pathogenic and putatively neutral variants.

MutPred-Indel was developed by Kymberleigh Pagel at Indiana University Bloomington, and was a joint project of the Mooney group at the University of Washington and the Radivojac group at Indiana University.

## Interpreting The Results

The output of MutPred-Indel consists of a general score (g), i.e., the probability that the framshifting or stop gain variant is pathogenic. This score is the average of the scores from all neural networks in MutPred-Indel. If interpreted as a probability, a score threshold of 0.50 would suggest pathogenicity. However, in our evaluations, we have estimated that a threshold of 0.50 yields a false positive rate (fpr) of 10% and that of 0.70 yields an fpr of 5%.

MutPred-Indel also outputs property scores that reflect the impact of a variant on different properties. An empirical P-value (P) is calculated as the fraction of putatively neutral variants in MutPred-Indel's training set with an amount of impacted residues >= to that amount for the given variant. A P-value threshold of 0.05 means that, under the null hypothesis, we expect 5% of putatively neutral variants to impact the particular property to the extent that the given variant does. These P-values are specific to each property.

Information from http://mutpredindel.cs.indiana.edu/index.html

