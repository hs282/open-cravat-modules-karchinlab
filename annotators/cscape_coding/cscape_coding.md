# CScape Coding

CScape Coding predicts the oncogenic status (disease-driver or neutral) of somatic point mutations specifically in the coding region of the cancer genome.

## Prediction Interpretation 

Predictions are given as p-values in the range [0, 1]: values above 0.5 are predicted to be deleterious, while those below 0.5 are predicted to be neutral or benign. P-values close to the extremes (0 or 1) are the highest-confidence predictions that yield the highest accuracy.

We also apply cautious classification thresholds, defined as those thresholds that yield the highest possible accuracy (see our paper for details). These are reported using different thresholds for coding (0.89 or above) and noncoding (0.70 or above) SNVs.

We use distinct predictors for positions in coding regions (positions within coding-sequence exons).

Information from http://cscape.biocompute.org.uk/

