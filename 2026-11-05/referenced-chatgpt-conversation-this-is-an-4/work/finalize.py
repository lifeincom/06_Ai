import json, pathlib, zipfile, re, html, shutil
import openpyxl
from PIL import Image, ImageOps, ImageDraw

root=pathlib.Path('outputs/상품별_변환결과')
d=json.loads(pathlib.Path('work/inspection.json').read_text(encoding='utf8'))
results=json.loads(pathlib.Path('work/results.json').read_text(encoding='utf8'))
template=pathlib.Path(d[1]['path'])
tw=openpyxl.load_workbook(template).active
with zipfile.ZipFile(template) as z:
    original={n:z.read(n) for n in z.namelist()}
for record in results['report']:
    file=root/'개별파일'/record[3]
    ws=openpyxl.load_workbook(file).active
    xml=original['xl/worksheets/sheet1.xml'].decode('utf8')
    for addr in ['B1']+[f'B{i}' for i in range(3,16)]:
        value=ws[addr].value
        pattern=rf'<c\b[^>]*\br="{addr}"[^>]*(?:/>|>.*?</c>)'
        def replace(m):
            opening=m[0].split('>')[0].rstrip('/')
            opening=re.sub(r'\s+t="[^"]*"','',opening)
            if value is None:return opening+'/>'
            if isinstance(value,(int,float)):return opening+'><v>'+str(value)+'</v></c>'
            return opening+' t="inlineStr"><is><t xml:space="preserve">'+html.escape(str(value),quote=False)+'</t></is></c>'
        xml,count=re.subn(pattern,replace,xml,flags=re.S)
        assert count==1,(file,addr,count)
    for r in range(3,16):
        height=ws.row_dimensions[r].height
        if height!=tw.row_dimensions[r].height:
            def resize(m):
                tag=re.sub(r'\s+ht="[^"]*"','',m[0])
                return tag[:-1]+f' ht="{height}">'
            xml=re.sub(rf'<row\b[^>]*\br="{r}"[^>]*>',resize,xml)
    with zipfile.ZipFile(file,'w',zipfile.ZIP_DEFLATED) as z:
        for name,data in original.items():z.writestr(name,xml.encode('utf8') if name=='xl/worksheets/sheet1.xml' else data)
    check=openpyxl.load_workbook(file).active
    vals=next(x['vals'] for x in results['rows'] if x['r']==record[0])
    assert [check.cell(r,2).value for r in range(3,16)]==vals[2:]
    assert check['B1'].value==str(vals[0])+'_'+vals[1]
    for row in tw:
        for cell in row:
            other=check[cell.coordinate]
            assert cell._style==other._style,(file,cell.coordinate,'style')
            if cell.column!=2 or cell.row==2:assert cell.value==other.value
    assert str(check.page_setup)==str(tw.page_setup)
    with zipfile.ZipFile(file) as z:
        assert all(z.read(n)==v for n,v in original.items() if n!='xl/worksheets/sheet1.xml')

# Remove generated diagnostic sidecars from deliverables, retaining them in work.
for f in root.rglob('*.ndjson'):
    shutil.move(str(f),str(pathlib.Path('work')/f.name))
files=list((root/'개별파일').rglob('*.xlsx'))
assert len(files)==56
links=[]
for r in results['report']:
    links.append('<tr><td>'+str(r[1])+'</td><td>'+html.escape(r[2])+'</td><td><a href="개별파일/'+html.escape(r[3],quote=True)+'">엑셀 다운로드</a></td><td>'+str(r[4])+'</td></tr>')
page='<!doctype html><html lang="ko"><meta charset="utf-8"><title>상품별 엑셀 파일</title><style>body{font-family:Malgun Gothic,sans-serif;max-width:1000px;margin:40px auto;color:#243c51}table{border-collapse:collapse;width:100%}td,th{padding:10px;text-align:left;border-bottom:1px solid #ddd}a{color:#155eb1}</style><h1>상품별 엑셀 파일 56개</h1><p>원본 NO_폴더명.xlsx 규칙 적용. 누락값은 빈칸으로 유지했습니다.</p><p><a href="누락_중복_처리결과.xlsx">누락·중복 처리결과 다운로드</a></p><table><tr><th>NO</th><th>폴더명</th><th>개별 파일</th><th>누락 항목 수</th></tr>'+''.join(links)+'</table></html>'
(root/'개별파일_다운로드목록.html').write_text(page,encoding='utf8')
zip_path=pathlib.Path('outputs/상품별_엑셀_전체.zip')
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
    for f in root.rglob('*'):
        if f.is_file():z.write(f,f.relative_to(root))
with zipfile.ZipFile(zip_path) as z:assert z.testzip() is None
print(json.dumps({'files':len(files),'missing_products':sum(r[4]>0 for r in results['report']),'missing_cells':len(results['missing']),'duplicate_names':sum(r[6]!='없음' for r in results['report']),'zip_bytes':zip_path.stat().st_size,'verified':'all source values, template styles, original package parts and print settings'},ensure_ascii=False))

# Contact sheets for visual review of every generated product.
for start in range(1,57,14):
    canvas=Image.new('RGB',(1400,1800),'#dddddd')
    for i,n in enumerate(range(start,min(start+14,57))):
        im=Image.open(f'work/previews/{n}.png').convert('RGB')
        im.thumbnail((340,430))
        x=(i%4)*350;y=(i//4)*450
        canvas.paste(im,(x,y+16));ImageDraw.Draw(canvas).text((x+4,y),str(n),fill='black')
    canvas.save(f'work/contact_{start}.jpg')
