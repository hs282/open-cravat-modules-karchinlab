# CardioBoost

CardioBoost is a disease-specific machine learning classifier to predict the pathogenicity of rare (gnomAD Allele Frequency <=0.1%) missense variant in genes associated with cardiomyopathies and arrhythmias that outperforms existing genome-wide prediction tools.

## Inherited Cardiac Conditions

We consider two types of conditions:
* __Cardiomyopathies__: dilated cardiomyopathy and hypertrophic cardiomyopathy
* __Inherited Arrhythmia Syndromes__: Long QT syndrome and Brugada syndrome

## Inherited Cardiac Conditions Related Genes
The following tables display the genes related to the conditions and only the genes with known pathogenic variants in our curated data sets would be included.

### __Cardiomyopathies__

|Gene Symbol|	 Ensemble Gene ID|	Ensemble Transcript ID|	Ensemble Protein ID|
| ----------|:-------------------|:-----------------------|:--------------------|
|ACTC1|	ENSG00000159251|	ENST00000290378| ENSP00000290378|
|DES|	ENSG00000175084|	ENST00000373960| ENSP00000363071|
|GLA|	ENSG00000102393|	ENST00000218516|	ENSP00000218516|
|LAMP2|	ENSG00000005893|	ENST00000200639|	ENSP00000200639|
|LMNA|	ENSG00000160789|	ENST00000368300|	ENSP00000357283|
|MYBPC3|	ENSG00000134571|	ENST00000545968|	ENSP00000442795|
|MYH7|	ENSG00000092054| ENST00000355349|	ENSP00000347507|
|MYL2|	ENSG00000111245|	ENST00000228841|	ENSP00000228841|
|MYL3|	ENSG00000160808|	ENST00000395869|	ENSP00000379210|
|PLN|	ENSG00000198523|	ENST00000357525|	ENSP00000350132|
|PRKAG2|	ENSG00000106617|	ENST00000287878|	ENSP00000287878|
|PTPN11|	ENSG00000179295|	ENST00000351677|	ENSP00000340944|
|SCN5A|	ENSG00000183873|	ENST00000333535|	ENSP00000328968|
|TNNI3|	ENSG00000129991|	ENST00000344887|	ENSP00000341838|
|TNNT2|	ENSG00000118194|	ENST00000367318|	ENSP00000356287|
|TPM1|	ENSG00000140416|	ENST00000403994|	ENSP00000385107|

### __Inherited Arrhthymias Syndromes__

|Gene Symbol|	 Ensemble Gene ID|	Ensemble Transcript ID|	Ensemble Protein ID|
| ----------|:-------------------|:-----------------------|:--------------------|
|CACNA1C|	ENSG00000151067|	ENST00000399655|	ENSP00000382563|
|CALM1|	ENSG00000198668|	ENST00000356978|	ENSP00000349467|
|CALM2|	ENSG00000143933| ENST00000272298|	ENSP00000272298|
|CALM3|	ENSG00000160014|	ENST00000291295|	ENSP00000291295|
|KCNH2|	ENSG00000055118|	ENST00000262186|	ENSP00000262186|
|KCNQ1|	ENSG00000053918|	ENST00000155840|	ENSP00000155840|
|SCN5A|	ENSG00000183873|	ENST00000333535|	ENSP00000328968|

## Classification Criteria

Variant classification is based on the pathogenic probability predicted by CardioBoost. According to the ACMG guidelines, we use Pr>=0.9 as the high classification certainty threshold to classify variants. A variant with lower than 90% classification probability is considered as indeterminate with low classification confidence level. In short, a variant is classified given its predicted pathogenicity:

* pathogenicity>=0.9: Pathogenic/Likely pathogenic
* pathogenicity<=0.1: Benign/Likely benign
* pathogenicity>0.1 and <0.9: Variant of Uncertain Significance (VUS)

## Why does CardioBoost not output predictions on my input list of variants?

There are mainly three reasons that CardioBoost would not return any prediction:
* The gene is not included as disease-related genes described above. Please check the gene lists above.
* The mutation is not a valid missense change on the gene's canonical transcript (shown in the gene lists above).
* The variant's gnomAD allele frequency is larger than 0.1%, which can be considered as a common variant and highly likely benign to cardiomyopathies and arrhythmias.

Information from https://www.cardiodb.org/cardioboost/