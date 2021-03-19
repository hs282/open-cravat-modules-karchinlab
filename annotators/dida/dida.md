# DIDA: Digenic Diseases Database
DIDA is a novel database that provides for the first time detailed information on genes and associated genetic variants involved in digenic diseases, the simplest form of oligogenic inheritance.

The basis of DIDA is a digenic combination, found in a patient that is affected with a digenic disease. Each digenic combiantion has a unique ID (“dd000”) and is composed of two, three or four variants present in two genes, that are both linked to a digenic disease.

## Disease Name (ORPHANET)
[Orphanet](https://www.orpha.net/consor/cgi-bin/index.php) is the reference portal for information on rare diseases and orphan drugs, for all audiences. Orphanet’s aim is to help improve the diagnosis, care and treatment of patients with rare diseases. This column represents the name of the disease as present in Orphanet.

## Oligogenic effect 
The majority of instances in DIDA are categorised into one of two simplified classes: either the digenic combination provides data on two variants in two genes that are both mandatory for the appearance of the disease, or a variant in one gene is enough to develop the disease but carrying a second one on another gene impacts the disease phenotype or affects the severity or age of onset. These two classes are a coarse-grained simplification of the original definition provided by Schaffer. The first class represents true digenic instances (labelled as “on/off” in the previous version of DIDA): mutations at both loci are required for disease, mutations at one of the two loci result in no phenotype. The second class we will refer to as the composite class as it includes different possibilities (labelled as “severity” in the previous version of DIDA): A composite instance in DIDA could refer to a dual molecular diagnoses, wherein mutations at each locus may segregate independently and result in expression of part/all of the phenotype, or a oligogenic mutational burden, when a driver mutation is necessary for phenotype but rare variants in other genes, usually related to the same pathway/organ system, may modify the phenotype. Throughout this paper the true digenic class will be annotated by TD and the composite class by CO. Further fine-tuning of these classes will become possible when more digenic diseases data become available. Yet for now we can limit ourselves to the current constraint, exploring the reason why a certain digenic combination belongs to the TD or CO class.

## Gene Relationship
As already described in literature, digenic diseases are caused by mutations in two genes which often have a physical or functional relationship (1,2). For each digenic combination in DIDA we determined the relationship between the two genes carring the mutations. There are 5 different types of relationship:
1. **Direct interaction:** there is a direct protein-protein interaction between the proteins products of the two genes. This information was retrieved from protein-protein-interaction databases (BioGrid, IntAct and ConsensusPathDb).
2. **Indirect interaction:** there is an indirect or “two step” interaction between the protein products of the two genes. If protein “A” and protein “B” interact with protein “C”, protein A and protein B are indirectly interacting. In other words, they share a common interactor. This information was retrieved from protein-protein-interaction databases (BioGrid, IntAct and ConsensusPathDb).
3. **Pathway membership:** the protein products from both genes belong to the same pathway. This information was retrieved from pathway databases (KEGG and REACTOME).
4. **Co-expression:** the protein products from both genes are expressed in at least one common tissue or organ. This information was retrieved from GNF/Atlas.
5. **Similar function:** the protein products from both genes contain the same functional conserved motifs or conserved domains. This information was retrieved from protein domain databases (InterPro and Pfam).

## Familial Evidence
When reading the original publication, in which the digenic combination was reported, we checked if the digenicity was supported by a familial study. In this study family members are genetically tested to determine their variant carrier status. Two values are possible: 1) YES when a family study provided evidence for digenicity or 2) NO when there was no family study conducted or the study was inconclusive.

## Functional Evidence
When reading the original publication, in which the digenic combination was reported, we checked if the digenicity was supported by a functional study. In this study the combined functional effect of the two variants was tested. Two values are possible: 1) YES when a functional study provided evidence for digenicity or 2) NO when there was no functional study conducted or the study was inconclusive.

## Biological Distance
The Human Gene Connectome (HGC) is the set of all biologically plausible routes, distances, and degrees of separation between all pairs of human genes. A gene-specific connectome contains the set of all available human genes sorted on the basis of their predicted biological proximity to the specific gene of interest.

Information from http://dida.ibsquare.be/documentation/
