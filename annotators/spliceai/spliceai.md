# SpliceAI: A deep learning tool to identify splice variants 

The splicing of pre-mRNAs into mature transcripts is remarkable for its precision, but the mechanisms by which the cellular machinery achieves such specificity are incompletely understood. Here, we describe a deep neural network that accurately predicts splice junctions from an arbitrary pre-mRNA transcript sequence, enabling precise prediction of noncoding genetic variants that cause cryptic splicing. Synonymous and intronic mutations with predicted splice-altering consequence validate at a high rate on RNA-seq and are strongly deleterious in the human population. De novo mutations with predicted splice-altering consequence are significantly enriched in patients with autism and intellectual disability compared to healthy controls and validate against RNA-seq in 21 out of 28 of these patients. We estimate that 9%–11% of pathogenic mutations in patients with rare genetic disorders are caused by this previously underappreciated class of disease variation.

## Scoring

Delta score of a variant, defined as the maximum of (Acceptor Gain, Acceptor Loss, Donor Gain, Donor Loss), ranges from 0 to 1 and can be interpreted as the probability of the variant being splice-altering. Delta position conveys information about the location where splicing changes relative to the variant position (positive values are downstream of the variant, negative values are upstream).

## Examples

The output for the following variant 19:38958362 C>T can be interpreted as follows:

|Acceptor Gain Score| Acceptor Loss Score| Donor Gain Score| Donor Loss Score|Acceptor Gain Position| Acceptor Loss Position| Donor Gain Position| Donor Loss Position|
|-------------------|:-------------------|:----------------|:----------------|:---------------------|:----------------------|:-------------------|:-------------------|
|0.00|0.00|0.91|0.08|-28|-46|-2|-31|

* The probability that the position 19:38958360 (=38958362-2) is used as a splice donor increases by 0.91.
* The probability that the position 19:38958331 (=38958362-31) is used as a splice donor decreases by 0.08.

Similarly, the output for the variant 2:179415988 C>CA has the following interpretation:

|Acceptor Gain Score| Acceptor Loss Score| Donor Gain Score| Donor Loss Score|Acceptor Gain Position| Acceptor Loss Position| Donor Gain Position| Donor Loss Position|
|-------------------|:-------------------|:----------------|:----------------|:---------------------|:----------------------|:-------------------|:-------------------|
|0.07|1.00|0.00|0.00|-7|-1|35|-29|

* The probability that the position 2:179415981 (=179415988-7) is used as a splice acceptor increases by 0.07.
* The probability that the position 2:179415987 (=179415988-1) is used as a splice acceptor decreases by 1.00.


Information from https://github.com/Illumina/SpliceAI/blob/master/README.md


