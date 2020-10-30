# Arrythmia Channelopathy Variants 
Explores variants associated with arrhythmia diseases such as Brugada Syndrome and Long QT Syndrome, found on SCN5A and KCNH2 genes. 

## SCN5A Background

SCN5A is a 2016 amino acid gene. It encodes NaV1.5, the main voltage-gated sodium channel in the heart. Coding-altering variants in SCN5A have been linked to many arrhythmia and cardiac conditions, including Brugada Syndrome Type 1 (BrS1 https://www.omim.org/entry/601144), Long QT Syndrome Type 3 (LQT3 https://www.omim.org/entry/603830), dilated cardiomyopathy (https://www.omim.org/entry/601154), cardiac conduction disease (https://www.omim.org/entry/113900), and Sick Sinus Syndrome (https://www.omim.org/entry/608567). Loss of function variants in SCN5A are associated with Brugada Syndrome and other cardiac conduction defects, and gain of function variants are associated with Long QT Syndrome. The risk of sudden cardiac death from these conditions can often be prevented with drug therapy or implantation of a defibrillator. SCN5A variants are often studied in vitro in heterologous expression systems using patch clamp electrophysiology. One challenge with SCN5A-related diseases is the issue of incomplete penetrance—only a fraction of variant carriers have disease phenotypes. Therefore, we believe that curating published patient data and in vitro functional data can contribute to a better understanding of each variant’s disease risk.

## KCNH2 Background

KCNH2 (also known as the human ether a-go-go related gene, hERG) encodes a 1159 amino acid protein, KV11.1, a voltage-gated potassium channel in the heart. Coding-altering variants in KCNH2 have been mostly linked to the heart arrhythmias, Long QT Syndrome Type 2 (LQT2 https://www.omim.org/entry/613688) and Short QT Syndrome (SQT1; https://www.omim.org/entry/609620). Loss-of-function variants in KCNH2 are associated LQT2 and gain-of-function variants are associated with short QT Syndrome. The risk of sudden cardiac death from these conditions can often be prevented with drug therapy or implantation of a defibrillator. KCNH2 variants are often studied in vitro in heterologous expression systems using patch clamp electrophysiology. One challenge with KCNH2-related diseases is the issue of incomplete penetrance—only a fraction of variant carriers have disease phenotypes. Therefore, we believe that curating published patient data and in vitro functional data can contribute to a better understanding of each variant’s disease risk.

## SCN5A Dataset

The dataset described on this website is a dataset of patient data and in vitro patch clamp data. This dataset was first described in Kroncke and Glazer et al. 2018, Circulation: Genomic and Precision Medicine (https://pubmed.ncbi.nlm.nih.gov/29728395/). The data were curated from a comprehensive literature review from papers written about SCN5A (or Nav1.5, the protein product of SCN5A). We quantified the number of carriers presenting with and without disease for 1,712 reported SCN5A variants. For 356 variants, data were also available for five NaV1.5 electrophysiologic parameters: peak current, late/persistent current, steady state V1/2 of activation and inactivation, and recovery from inactivation. We found that peak and late current significantly associated with BrS1 (p < 0.001, rho = -0.44, Spearman’s rank test) and LQT3 disease penetrance (p < 0.001, rho = 0.37). Steady state V1/2 activation and recovery from inactivation also associated significantly with BrS1 and LQT3 penetrance, respectively.

## KCNH2 Dataset

The dataset described on this website is a dataset of patient data and in vitro patch clamp data. This dataset was first described in Kozek et al. (to be published soon). The data were curated from a comprehensive literature review from papers written about KCNH2 (or Kv11.1, the protein product of KCNH2). In addition, five centers that hold cardiology clinics and conduct research gathered clinical phenotypes and genotypes for individuals heterozygous for KCNH2 variants, including Unité de Rythmologie, Centre de Référence Maladies Cardiaques Héréditaires, Service de Cardiologie, Hôpital Bichat, Paris, France; the Center for Cardiac Arrhythmias of Genetic Origin Istituto Auxologico Italiano IRCCS, Milan, Italy; Shiga University of Medical Science Department of Cardiovascular and Respiratory Medicine, Shiga, Japan; National Cerebral and Cardiovascular Center, Osaka, Japan; Nagasaki University, Nagasaki, Japan. We quantified the number of carriers presenting with and without disease for 871 reported KCNH2 variants (an additional 266 KCNH2 inframe/missense variants coming from the international cohort). For ### variants, data were also available for six KV11.1 electrophysiologic parameters: steady state maximum current, peak tail current, steady state V1/2 of activation and inactivation, recovery from inactivation, and deactivation time. All six of these parameters are found in the literature collected homozygously and heterozygously. We found that heterozygously collected peak tail current significantly associated with LQT2 (p < 0.001, rho = -0.62, Spearman’s rank test). This relationship persisted across the literature and cohort datasets.

## Updates to the Datasets

This dataset was updated with papers published through January 2020. The description of the revised dataset published in Kroncke et al, 2020, PLOS Genetics. This paper also includes an updated Bayesian method for estimating the penetrance of each variant.

## Calculating Penetrance

In this work, penetrance is an estimate of the probability for long QT diagnosis for each variant using a Bayesian method that integrates together patient data and variant features (changes in variant function, protein structure, and in silico predictions).

## Automated Patch Clamp Data

We have recently published an automated patch clamp study of >80 SCN5A variants (Glazer et al, American Journal of Human Genetics, 2020). This is a promising method for rapidly collecting in vitro functional data and reclassifying variants of uncertain significance. The full automated patch clamp dataset is available here [https://ars.els-cdn.com/content/image/1-s2.0-S0002929720301622-mmc2.csv] and has been integrated into the dataset on this website.

Information from https://oates.app.vumc.org/vancart/SCN5A/about.php

