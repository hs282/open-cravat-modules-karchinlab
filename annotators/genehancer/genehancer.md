# GeneHancer
GeneHancer is a database of genome-wide enhancer-to-gene and promoter-to-gene associations, embedded in GeneCards. Regulatory elements were mined from the following sources:

* The [ENCODE project](https://www.encodeproject.org/) (see [paper](https://www.nature.com/articles/nature11247)) [Z-Lab](http://zlab-annotations.umassmed.edu/enhancers/) Enhancer-like regions
* [Ensembl regulatory build](http://useast.ensembl.org/info/genome/funcgen/index.html) (see [paper](https://genomebiology.biomedcentral.com/articles/10.1186/s13059-015-0621-5))
* FANTOM5 [atlas of active enhancers](http://pressto.binf.ku.dk/) (see [paper](https://www.nature.com/articles/nature12787))
* [VISTA Enhancer Browser](https://enhancer.lbl.gov/) enhancers validated by transgenic mouse assays (see [paper](https://academic.oup.com/nar/article/35/suppl_1/D88/1096925)).
* [dbSUPER](http://asntech.org/dbsuper/) super-enhancers (see [paper](https://academic.oup.com/nar/article/44/D1/D164/2502575)).
* [EPDnew](https://epd.epfl.ch//EPDnew_database.php) promoters (see [paper](https://academic.oup.com/nar/article/41/D1/D157/1070274)).
* [UCNEbase](https://ccg.epfl.ch//UCNEbase/) ultra-conserved noncoding elements (see [paper](https://academic.oup.com/nar/article/41/D1/D101/1057253)).
* [CraniofacialAtlas](https://cotney.research.uchc.edu/data/) (see [paper](https://www.sciencedirect.com/science/article/pii/S2211124718305175?via%3Dihub)).

The GeneHancer table lists a set of enhancers and promoters associated with the gene. Gene-GeneHancer associations and likelihood-based scores were generated using information that helps link regulatory elements to genes:

* eQTLs (expression quantitative trait loci) from [GTEx](https://www.gtexportal.org/home/) (see [paper](https://www.nature.com/articles/nrg3969))
* Capture Hi-C promoter-enhancer long range interactions (see [paper](https://www.nature.com/articles/ng.3286))
* Expression correlations between eRNAs and candidate target genes from FANTOM5 (see [paper](https://www.nature.com/articles/nature12787))
* Cross-tissue expression correlations between a transcription factor interacting with an enhancer and a candidate target gene
* GeneHancer-gene distance-based associations, scored utilizing inferred distance distributions. Associations include several approaches: (a) Nearest neighbors, where each GeneHancer is associated with its two proximal genes (from all gene categories). In cases where a proximal gene is not protein coding, the nearest protein coding gene is also included; (b) Overlaps with the gene territory (Intragenic); (c) Proximity (<2kb) to the gene TSS (transcription start site). TSS proximity scores are boosted to elevate Gene-GeneHancer associations in the vicinity of the gene TSS.

## GeneHancer Identifier 
GeneHancer elements have unique, informative and persistent GeneHancer identifiers (GHids). The id begins with GH, which is followed by the chromosome number, a single letter related to the GeneHancer version (constant since version 4.8, ‘J’), and approximate kilobase start coordinate. Example: GH0XJ101383 is located on chromosome X, with starting position (in kb) of 101383.

Each GeneHancer has a confidence score which is computed based on a combination of evidence annotations: (1) Number of sources; (2) Source scores; (3) TFBSs (from ENCODE). GeneHancers supported by two or more evidence sources were defined as elite and annotated accordingly with an asterisk. For every GeneHancer, the following annotations are included: GH id, GH type (promoter, enhancer or both), the sources with evidence for the GeneHancer, genomic size, GeneHancer confidence score, and a list of TFs (Transcription Factors) having TFBSs (Transcription Factor Binding Sites) within the GeneHancer (based on ChIP-Seq evidence).

Disease-GeneHancer associations: GeneHancer-gene pairs were associated to diseases by integrating manually curated disease-associated variants within regulatory elements from (1) DiseaseEnhancer, PMID:29059320; (2) PMID:27569544.

GWAS phenotypes: GeneHancer elements were associated to phenotypes by mapping GWAS SNPs from the GWAS Catalog (PMID: 27899670)

Information from https://www.genecards.org/Guide/GeneCard#enhancers
