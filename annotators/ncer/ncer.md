# ncER: non-coding essential regulation

In summary, ncER has a good performance for the identification of deleterious variants in the non-coding genome. ncER can also identify non-coding regions associated with cell viability, an in vitro surrogate of essentiality, and with regulation of an essential gene. Thus, we speculated that ncER may help map critical regulatory and structural elements of the non-coding genome in the setting of human disease. Of note, the model is trained to assess variants and regions of the non-coding genome, and therefore is not relevant for the scoring of protein coding regions

## ncER Percentile

Two sets of ncER percentile scores were computed. The first with nucleotide resolution and the second where raw ncER scores were averaged over 10 bp bins and then expressed as percentiles genome-wide. To explore ncER percentile distribution of highly likely pathogenic variants, we used a manually curated set of pathogenic non-coding variants associated with Mendelian traits24, and selected those falling at least 500 bp from any pathogenic variants from the training/test sets, yielding a set of 85 dominant and 52 recessive non-coding pathogenic variants.The control genomic variants (N = 13,659) consisted of singleton variants from the gnomAD whole-genome sequencing datasets matched to the pathogenic sets for the distance to the nearest splice sites and genomic elements.

Information from https://www.nature.com/articles/s41467-019-13212-3