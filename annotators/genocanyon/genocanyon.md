# GenoCanyon

GenoCanyon is a whole-genome functional annotation approach based on unsupervised statistical learning. It integrates genomic conservation measures and biochemical annotation data to predict the functional potential at each nucleotide.

## Method

The posterior probability we used to measure the functional potential of each nucleotide has a very clear bimodal distribution. This can be seen from Fig.2a in our paper. For example, the panel on the left of Fig.2a shows the histogram of posterior score on the entire chromosome 11. We can see that about 60% of the nucleotides have a very low score, while about 30% of chr11 have a score above 0.9. This means that although our functional score has a very nice probabilistic interpretation, the algorithm is essentially doing model-based clustering. Whether a genomic locus is functional or non-functional is pretty clear based on our prediction, and is not sensitive to the choice of cutoff.

Information from http://zhaocenter.org/GenoCanyon_Index.html