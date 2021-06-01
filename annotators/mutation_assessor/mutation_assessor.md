# Mutation Assessor: database providing prediction of the functional impact of amino-acid substitutions in proteins
Functional impact is calculated based on evolutionary conservation of the affected amino acid in protein homologs. The method has been validated on a large set (60k) of disease associated (OMIM) and polymorphic variants.

1. Variant: Amino acid variant
2. Score: Mutation Assessor functional impact combined score (MAori). The score ranges from -5.135 to 6.49
3. Ranked Score: MAori scores were ranked among all MAori scores in the database. The rankscore is the ratio of the rank of the score over the total number of MAori scores in the database. The scores range from 0 to 1.
4. Functional Impact: Predicted functional, i.e. high ("H") or medium ("M"), or predicted non-functional, i.e. low ("L") or neutral ("N"). The MAori score cutoffs between "H" and "M", "M" and "L", and "L" and "N", are 3.5, 1.935 and 0.8, respectively. The rankscore cutoffs between "H" and "M", "M" and "L", and "L" and "N", are 0.92922, 0.51944 and 0.19719, respectively.
