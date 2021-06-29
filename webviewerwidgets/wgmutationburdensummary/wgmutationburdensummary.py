import aiosqlite
import os
import json

async def get_data (queries):
    dbpath = queries['dbpath']
    conn = await aiosqlite.connect(dbpath)
    cursor = await conn.cursor()

    numsamples = {}
    q = 'select variant.base__hugo, count(*) from variant, variant_filtered where variant.base__coding=="Y" and variant.base__uid=variant_filtered.base__uid and variant.base__hugo is not null group by variant.base__hugo;'
    await cursor.execute(q)
    for row in await cursor.fetchall():
        gene = row[0]
        varcount = row[1]
        numsamples[gene] = varcount
    sorted_hugos = sorted(numsamples, key=numsamples.get, reverse=True)
    extracted_hugos = sorted_hugos[:10]

    num_sample = {}
    countsofsamples = {}
    for hugo in extracted_hugos:
        samples = {}
        q = 'select variant.tagsampler__samples from variant, variant_filtered where variant_filtered.base__uid = variant.base__uid and variant.base__hugo ="' + hugo + '"'
        await cursor.execute(q)
        rows = await cursor.fetchall()
        if rows:
            for row in rows:
                for s in row[0].split(';'):
                    if s in samples:
                        samples[s].append(s)
                    else:
                        samples[s] = [s]
                    if s in countsofsamples:
                        countsofsamples[s].append(s)
                    else:
                        countsofsamples[s] = [s]
        num_sample[hugo] = samples
    samplevarcount = {}
    for k, v in countsofsamples.items():
        samplevarcount[k] = len(v)
    sorted_samples = sorted(samplevarcount, key=samplevarcount.get, reverse=True)
    extracted_samples = sorted_samples[:10]
    
    samplecount = {}
    for k, v in num_sample.items():
        s = {}
        for key, value in v.items():
            s[key] = len(value)
        samplecount[k] = s

    final = {}
    for samp in extracted_samples:
        for hugo in extracted_hugos:
            values = samplecount[hugo]
            try:
                val = [samp, values[samp]]
            except:
                val = [samp, 0]
            if hugo in final:
                    final[hugo].append(val)
            else:
                final[hugo] = [val]
    response = {'data': final}
    await cursor.close()
    await conn.close()
    return response