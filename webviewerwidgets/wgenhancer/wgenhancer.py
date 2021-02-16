import aiosqlite
import os
import cravat.admin_util as au

info = au.get_local_module_info('genehancer')
path = info.directory

async def get_data (queries):
    conn = await aiosqlite.connect(os.path.join(path, 
                                        'data', 
                                        'genehancer.sqlite'))
    cursor = await conn.cursor()
    q = 'select id, chrom, beg, end from gene'
    await cursor.execute(q)
    enhancer = {}
    for row in await cursor.fetchall():
        ids = row[0]
        chroms = row[1]
        start = row[2]
        end = row[3]
        enhancer_len = end - start
        enhancer[ids] = enhancer_len
    await cursor.close()
    await conn.close()
    dbpath = queries['dbpath']
    conn = await aiosqlite.connect(dbpath)
    cursor = await conn.cursor()

    id_var_perc = {}
    q = 'select variant.base__hugo, variant.genehancer__ident, count(*) as c from variant group by variant.genehancer__ident having c > 0;'
    await cursor.execute(q)
    for row in await cursor.fetchall():
        hugo = row[0]
        gid = row[1]
        count = row[2]
        if gid in enhancer:
            perc = (count/enhancer[gid]) * 100
            gid = gid + ':' + hugo
            id_var_perc[gid] = perc
    sorted_dic = dict(sorted(id_var_perc.items(), key=lambda item: item[1], reverse= True)[:10])
    response = {'data': []}
    for key, value in sorted_dic.items():
        response['data'].append([key, value])
    await cursor.close()
    await conn.close()
    return response