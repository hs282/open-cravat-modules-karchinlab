# About CHASMplus

CHASMplus is a computational tool to classify missense mutations as drivers or passengers in human cancers. Driver mutations provide a selective advantage to cancer cells, while passenger mutations do not. CHASMplus is based on a set of 95 features, characterizing mutational hotspots, evolutionary conservation/human germline variation, molecular function annotations (e.g., protein-protein interface annotations, sequence biased regions, and relevant covariates (e.g., replication timing). It was trained using somatic mutations from whole-exome sequencing of a larger number of tumors in The Cancer Genome Atlas (TCGA). CHASMplus can score mutations in either a cancer type-specific manner or "pan-cancer", which is a useful default for many cancer types. 

Please check out the [CHASMplus website](https://chasmplus.readthedocs.io) for more information.

## How do I interpret the results?

The CHASMplus output contains two main components: a score and a p-value. High scores reflect a greater likelihood that a mutation is a driver (scores range from 0.0 to 1.0). The P-value reflects the statistical significance of obtaining the acheived or higher CHASMplus score. We recommend that driver mutations are called based on the False Discovery Rate, preferably by using the Benjamini-Hochberg method through a function like the `p.adjust` function in the R programming language. Possible thresholds include a false discovery rate of 0.1 or 0.01, depending on the need to constrain false positives. NOTE: P-values are calibrated for whole-exome sequencing studies. If you are using a targeted gene panel or focusing on only a specific subset of genes, then please use the gene panel version of CHASMplus.

## How are CHASMplus scores generated?

CHASMplus scores all possible missense mutations on all transcripts. Therefore keep in mind that the same genomic mutation may have slightly varying scores depending on the transcript. OpenCRAVAT decides which among many transcripts will be chosen as the default. All scores provided through OpenCRAVAT are weighted by their respective gene based on 20/20+ (gene weighted CHASMplus scores). 

## Cancer Type Abbreviations Guide

| Abbr. | Full | Abbr. | Full | Abbr. | Full | Abbr. | Full | Abbr. | Full |
|--------------|------------------------------------------------------------------|--------------|---------------------------------------|--------------|------------------------------------|--------------|--------------------------------------|--------------|----------------|
| ACC | Adrenocortical carcinoma | HNSC | Head and Neck squamous cell carcinoma | LUSC | Lung squamous cell carcinoma | SARC | Sarcoma | UVM | Uveal Melanoma |
| BLCA | Bladder Urothelial Carcinoma | KICH | Kidney Chromophobe | MESO | Mesothelioma | SKCM | Skin Cutaneous Melanoma |  |  |
| CESC | Cervical squamous cell carcinoma and endocervical adenocarcinoma | KIRC | Kidney renal clear cell carcinoma | OV | Ovarian serous cystadenocarcinoma | STAD | Stomach adenocarcinoma |  |  |
| CHOL | Cholangiocarcinoma | KIRP | Kidney renal papillary cell carcinoma | PAAD | Pancreatic adenocarcinoma | TGCT | Testicular Germ Cell Tumors |  |  |
| COAD | Colon adenocarcinoma | LAML | Acute Myeloid Leukemia | PANCAN | PAN Cancer | THCA | Thyroid carcinoma |  |  |
| DLBC | Lymphoid Neoplasm Diffuse Large B-cell Lymphoma | LGG | Brain Lower Grade Glioma | PCPG | Pheochromocytoma and Paraganglioma | THYM | Thymoma |  |  |
| ESCA | Esophageal carcinoma | LIHC | Liver hepatocellular carcinoma | PRAD | Prostate adenocarcinoma | UCEC | Uterine Corpus Endometrial Carcinoma |  |  |
| GBM | Glioblastoma multiforme | LUAD | Lung adenocarcinoma | READ | Rectum adenocarcinoma | UCS | Uterine Carcinosarcoma |  |  |

## Support

This work was supported by:

* F31CA200266 (to Collin Tokheim) 
* U24CA204817 (to Rachel Karchin)

## Citation

Tokheim C, Karchin R. CHASMplus reveals the scope of somatic missense mutations driving human cancers. bioRxiv. 2018:313296.

## Contact Us

Collin Tokheim ctokhei1@alumni.jhu.edu
Rachel Karchin karchin@jhu.edu
