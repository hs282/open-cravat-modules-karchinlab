# ACMG Pathogenicity guidance using ClinVar
The American College of Medical Genetics and Genomics (ACMG) develops [a set of guidelines](https://www.acmg.net/docs/Standards_Guidelines_for_the_Interpretation_of_Sequence_Variants.pdf) for the interpretation of sequence variants. This annotator finds variants which meet one of the PS1 and PM5 standards, based on pathogenic variants found in ClinVar.

- PS1: Same amino acid change as a previously established pathogenic variant regardless of nucleotide change
- PM5: Novel missense change at an amino acid residue where a different missense change determined to be pathogenic has been seen before.

[ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/) is a freely accessible, public archive of reports of the relationships among human variations and phenotypes, with supporting evidence. 
 
Variants which meet one of the guidelines will have the ClinVar ID of the variant they align to listed in the results.