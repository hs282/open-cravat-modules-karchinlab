## Defining the Regulatory Build

We first determine a cell type independent functional annotation of the genome, referred to as the Regulatory Build, which summarises the function of genomic regions, known as regulatory features.

To determine whether a state is useful in practice, it is compared to the overall density of transcription factor binding, as these is measured by the TF ChIP-seq datasets included in the Ensembl Regulation resources. Applying increasing integer cutoffs to this signal, we define progressively smaller regions. If these regions reach a two-fold enrichment in transcription factor binding signal, then the state is retained for the build. This means that although all states are annotated, not all are used to build the Regulatory Build.

For any given segmentation, we define initial regions. For every functional label, all the state summaries that were assigned that labelled and judged informative are summed into a single function. Using the overall TF binding signal as true signal, we select the threshold which produces the highest F-score.

We then merge the regulatory features across segmentations by annotation.

Some simplifications are applied a posteriori:
* Distal enhancers which overlap promoter flanking regions are merged into the latter.
* Promoter flanking regions which overlap transcription start sites are incorporated into the flanking regions of the latter features.

## Regulatory Features

Regions that are predicted to regulate gene expression are called Regulatory features in Ensembl. The different types of regulatory features annotated include:

* Promoters (regions at the 5' end of genes where transcription factors and RNA polymerase bind to initiate transcription)
* Promoter flanking regions (transcription factor binding regions that flank the above)
* Enhancers (regions that bind transcription factors and interact with promoters to stimulate transcription of distant genes)
* CTCF binding sites (regions that bind CTCF, the insulator protein that demarcates open and closed chromatin)
* Transcription factor binding sites (sites which bind transcription factors, for which no other role can be determined as yet)
* Open chromatin regions (regions of spaced out histones, making them accessible to protein interactions)

## Ensembl ID

An Ensembl stable ID consists of five parts: ENS(species)(object type)(identifier).(version).

* The first part, 'ENS', tells you that it's an Ensembl ID
* The second part is a three-letter species code. For human, there is no species code so IDs are in the form ENS(object type)(identifier).(version). A list of the other species codes can be found here.
* The third part is a one- or two-letter object type. For example E for exon, FM for protein family, G for gene, GT for gene tree, P for protein, R for regulatory feature and T for transcript.
* The identifier is the number to that object. Combinations of prefixes and identifiers are unique.
* Versions indicate how many times that model has changed during its time in Ensembl. This document explains how we determine that a model has changed sufficiently to update version number. History pages for features show you when these changes took place.
* Using this information we can make assertions about an Ensembl ID. For example ENSMUSG00000017167.6. From this we can see that it's an Ensembl ID (ENS), from mouse (MUS), it's a gene (G) and it's on its sixth version (.6).

Information from http://www.ensembl.org/info/genome/funcgen/regulatory_build.html