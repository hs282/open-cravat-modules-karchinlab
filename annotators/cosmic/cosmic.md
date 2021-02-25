# COSMIC: Catalogue of Somatic Mutations in Cancer 
COSMIC, the Catalogue of Somatic Mutations in Cancer is a high-resolution resource for exploring targets and trends in the genetics of human cancer. Currently the broadest database of mutations in cancer, the information in COSMIC is curated by expert scientists, primarily by scrutinizing large numbers of scientific publications.  COSMIC now details the genetics of drug resistance, novel somatic gene mutations which allow a tumour to evade therapeutic cancer drugs.  All information from the COSMIC database is available freely on the COSMIC website.

## Variant Matching
In order to maximize the results from COSMIC, OpenCRAVAT matches the variant in multiple ways. First it looks for an genomic location match from the data (chrom, pos, ref, alt), if one is not found next it will look for a match in the protein change, lastly it will look to match at just the position (chrom, pos). What format was utilized to get your results from COSMIC will be shown under the column *Match* in the result viewer.

![Screenshot](cosmic_screenshot_1.png)
![Screenshot](cosmic_screenshot_2.png)
<br />