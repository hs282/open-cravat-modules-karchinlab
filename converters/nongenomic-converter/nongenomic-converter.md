# Non-Genomic Converter

Takes lists of gene plus the protein change as input, separated by a `:`. Format as follows.

```
#annotation   sample_id   tag
PIK3CA:p.E545K s01 tag1
...
```
The `sample_id` and `tag` columns are optional and may be omitted. The first line must begin with `#annotation`. Subsequent lines may use `#` to add a comment. Separate columns with tabs or one or more spaces.