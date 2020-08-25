# Arrythmia Channelopathy Variants 
Explores variants associated with arrhythmia diseases such as Brugada Syndrome and Long QT Syndrome Type 3, found on the SCN5A gene. 

## SCN5A Background

SCN5A is a 2016 amino acid gene. It encodes NaV1.5, the main voltage-gated sodium channel in the heart. Coding-altering variants in SCN5A have been linked to many arrhythmia and cardiac conditions, including Brugada Syndrome Type 1 (BrS1 https://www.omim.org/entry/601144), Long QT Syndrome Type 3 (LQT3 https://www.omim.org/entry/603830), dilated cardiomyopathy (https://www.omim.org/entry/601154), cardiac conduction disease (https://www.omim.org/entry/113900), and Sick Sinus Syndrome (https://www.omim.org/entry/608567). Loss of function variants in SCN5A are associated with Brugada Syndrome and other cardiac conduction defects, and gain of function variants are associated with Long QT Syndrome. The risk of sudden cardiac death from these conditions can often be prevented with drug therapy or implantation of a defibrillator. SCN5A variants are often studied in vitro in heterologous expression systems using patch clamp electrophysiology. One challenge with SCN5A-related diseases is the issue of incomplete penetrance—only a fraction of variant carriers have disease phenotypes. Therefore, we believe that curating published patient data and in vitro functional data can contribute to a better understanding of each variant’s disease risk.

## The Dataset

The dataset described on this website is a dataset of patient data and in vitro patch clamp data. This dataset was first described in Kroncke and Glazer et al. 2018, Circulation: Genomic and Precision Medicine (https://pubmed.ncbi.nlm.nih.gov/29728395/). The data were curated from a comprehensive literature review from papers written about SCN5A (or Nav1.5, the protein product of SCN5A). We quantified the number of carriers presenting with and without disease for 1,712 reported SCN5A variants. For 356 variants, data were also available for five NaV1.5 electrophysiologic parameters: peak current, late/persistent current, steady state V1/2 of activation and inactivation, and recovery from inactivation. We found that peak and late current significantly associated with BrS1 (p < 0.001, rho = -0.44, Spearman’s rank test) and LQT3 disease penetrance (p < 0.001, rho = 0.37). Steady state V1/2 activation and recovery from inactivation also associated significantly with BrS1 and LQT3 penetrance, respectively.

## Update to the Dataset

This dataset was updated with papers published through January 2020. The description of the revised dataset published in Kroncke et al, 2020, PLOS Genetics. This paper also includes an updated Bayesian method for estimating the penetrance of each variant.

## Calculating Penetrance

In this work, penetrance is an estimate of the probability for long QT diagnosis for each variant using a Bayesian method that integrates together patient data and variant features (changes in variant function, protein structure, and in silico predictions).

## Automated Patch Clamp Data

We have recently published an automated patch clamp study of >80 SCN5A variants (Glazer et al, American Journal of Human Genetics, 2020). This is a promising method for rapidly collecting in vitro functional data and reclassifying variants of uncertain significance. The full automated patch clamp dataset is available here [https://ars.els-cdn.com/content/image/1-s2.0-S0002929720301622-mmc2.csv] and has been integrated into the dataset on this website.

Information from https://oates.app.vumc.org/vancart/SCN5A/about.php

