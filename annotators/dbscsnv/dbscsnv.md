# dbscSNV

dbscSNV includes all potential human SNVs within splicing consensus regions (−3 to +8 at the 5’ splice site and −12 to +2 at the 3’ splice site), i.e. scSNVs, related functional annotations and two ensemble prediction scores for predicting their potential of altering splicing.

Two ensemble learning methods, adaptive boosting and random forests, were used to construct models that take advantage of individual methods. Both models further improved prediction, with outputs of directly interpretable prediction scores.

## Scores
* Both ensemble scores computed using AdaBoost and random forests are the probabilities of a variant being splice-altering. Note that as a probability, the score is not a reflection of the effect size (e.g. how damaging the variant is), but rather the confidence that it alters splicing.

* The scores range 0 to 1. The larger the score the higher probability the scSNV will affect splicing. The suggested cutoff for a binary prediction (affecting splicing vs. not affecting splicing) is 0.6.

Information from http://www.liulab.science/software--databases.html
