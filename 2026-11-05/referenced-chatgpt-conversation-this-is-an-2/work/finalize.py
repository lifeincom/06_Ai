import json,re,zipfile,csv,io,hashlib
from pathlib import Path
import xml.etree.ElementTree as E
root=Path.cwd(); out=root/'outputs'; dest=out/'상품별_엑셀'; dest.mkdir(parents=True,exist_ok=True)
data=json.loads((root/'work/data.json').read_text('utf-8'))
src=zipfile.ZipFile(root/'work/source.xlsx'); parts={n:src.read(n) for n in src.namelist()}
ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
sheet=parts['xl/worksheets/sheet1.xml'].decode('utf-8')
rows=re.findall(r'<row\b[^>]*>.*?</row>',sheet,re.S)
rowmap={int(re.search(r'\br="(\d+)"',r)[1]):r for r in rows}
strings=re.findall(r'<si(?:\s[^>]*)?>.*?</si>',parts['xl/sharedStrings.xml'].decode('utf-8'),re.S)
assert not E.fromstring(sheet).findall('.//m:f',ns),'Formula preservation requires explicit handling'
used=set(); records=[]; totalmissing=0; changed=0
def safe(v,fallback):
 s=str(v).strip() if v is not None else ''
 if not s:s=fallback
 s=re.sub(r'[<>:"/\\|?*\x00-\x1f]','_',s).rstrip(' .')
 return s or fallback
def values(z):
 ss=E.fromstring(z.read('xl/sharedStrings.xml'))
 txt=[''.join(x.itertext()) for x in ss]
 result=[]
 for row in E.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('m:sheetData/m:row',ns):
  vals=[None]*15
  for c in row:
   col=re.match(r'[A-Z]+',c.attrib['r'])[0]
   if len(col)>1 or col>'O':continue
   v=c.find('m:v',ns)
   if v is not None:vals[ord(col)-65]=txt[int(v.text)] if c.get('t')=='s' else float(v.text)
  result.append(vals)
 return result
for index,vals in enumerate(data[1:],1):
 if all(v is None or v=='' for v in vals):continue
 assert (root/f'work/generated/{index}.xlsx').exists()
 no,folder=vals[:2]; base=f'{safe(no,f"NO없음_행{index+1}")}_{safe(folder,f"폴더명없음_행{index+1}")}'
 notes=[]
 if no is None or str(no).strip()=='':notes.append('NO 결측: 행번호 대체')
 if folder is None or str(folder).strip()=='':notes.append('폴더명 결측: 행번호 대체')
 if len(base)>100:base=base[:90]+'_'+hashlib.sha256(base.encode()).hexdigest()[:8];notes.append('긴 파일명 축약')
 name=base+'.xlsx'; suffix=2
 while name.casefold() in used:name=f'{base}__{suffix}.xlsx';suffix+=1
 if suffix>2:notes.append('중복 파일명 순번 추가')
 if name!=f'{no}_{folder}.xlsx':changed+=1
 used.add(name.casefold())
 # Retain original native styles, table metadata, dimensions, print settings and rich text.
 # Artifact Tool authored and verified each row; restore source OOXML for exact fidelity.
 row=re.sub(r'\br="([A-Z]*)\d+"',lambda m:'r="'+m[1]+'2"',rowmap[index+1])
 body=rowmap[1]+row
 ids=[]
 for m in re.finditer(r'<c\b[^>]*t="s"[^>]*><v>(\d+)</v>',body):
  if int(m[1]) not in ids:ids.append(int(m[1]))
 lookup={old:new for new,old in enumerate(ids)}
 body=re.sub(r'(<c\b[^>]*t="s"[^>]*><v>)(\d+)(</v>)',lambda m:m[1]+str(lookup[int(m[2])])+m[3],body)
 xml=re.sub(r'<sheetData>.*?</sheetData>','<sheetData>'+body+'</sheetData>',sheet,flags=re.S)
 xml=re.sub(r'<dimension[^>]*/>','<dimension ref="A1:O2"/>',xml)
 xml=re.sub(r'<selection[^>]*/>','<selection activeCell="A1" sqref="A1"/>',xml)
 current=parts.copy();current['xl/worksheets/sheet1.xml']=xml.encode()
 count=len(re.findall(r't="s"',body))
 current['xl/sharedStrings.xml']=(f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="{ns["m"]}" count="{count}" uniqueCount="{len(ids)}">'+''.join(strings[j] for j in ids)+'</sst>').encode()
 current['xl/tables/table1.xml']=parts['xl/tables/table1.xml'].replace(b'A1:O57',b'A1:O2')
 path=dest/name
 with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED) as z:
  for n,b in current.items():z.writestr(n,b)
 with zipfile.ZipFile(path) as z:
  assert z.testzip() is None
  assert values(z)==[data[0],vals],name
  assert z.read('xl/styles.xml')==parts['xl/styles.xml']
  for n in z.namelist():
   if n.endswith('.xml'):E.fromstring(z.read(n))
 missing=[data[0][j] for j,v in enumerate(vals) if v is None or (isinstance(v,str) and not v.strip())]
 totalmissing+=len(missing)
 records.append([index+1,no,folder,name,len(missing),', '.join(missing),'; '.join(notes) or '원본 파일명 적용','값·자료형·서식 대조 통과'])
log=out/'처리내역.csv'
with log.open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.writer(f);w.writerow(['원본 행','NO','폴더명','생성 파일명','결측 항목 수','결측 항목','파일명 처리','검증']);w.writerows(records)
summary=f'''상품정보 행별 Excel 분리 처리 내역

원본: 상품정보.xlsx / Sheet1
정보 항목: 15개
상품 행: {len(records)}개 (원본 2~57행)
생성: {len(records)}개 / 실패: 0개
파일명 변경: {changed}개
빈 항목: {totalmissing}개 / 빈 항목이 있는 상품: {sum(r[4]>0 for r in records)}개

각 파일은 원본 제목 행과 해당 상품 한 행으로 구성됩니다.
15개 항목의 값, 자료형, 빈칸, 줄바꿈, 글꼴, 셀 서식, 열 너비, 행 높이, 표 및 인쇄 설정을 보존했습니다.
표와 필터 범위는 A1:O2로 조정했습니다. 원본 오탈자 및 문구는 수정하지 않았습니다.
원본의 긴 문구와 행 높이를 그대로 보존하므로 일부 내용은 셀 편집 시 전체 확인할 수 있습니다.
각 파일의 모든 항목을 원본과 대조하고 ZIP 무결성, XML, 스타일 보존을 검증했습니다.
Microsoft Excel 앱에서 직접 여는 검증은 수행하지 않았습니다.

파일명 처리 규칙: NO_폴더명.xlsx. 결측은 해당 열 이름과 원본 행번호로 대체,
사용 불가 문자는 밑줄로 변경, 중복은 __2, __3 순번 추가, 긴 이름은 축약 및 식별값 추가.
상품정보의 빈칸은 추정하거나 채우지 않았으며 처리내역.csv에 항목을 기록했습니다.
'''
(out/'처리요약.txt').write_text(summary,encoding='utf-8-sig')
with zipfile.ZipFile(out/'상품별_엑셀_전체.zip','w',zipfile.ZIP_DEFLATED) as z:
 for r in records:z.write(dest/r[3],'상품별_엑셀/'+r[3])
 z.write(log,log.name);z.write(out/'처리요약.txt','처리요약.txt')
print(json.dumps({'files':len(records),'missing_cells':totalmissing,'missing_rows':sum(r[4]>0 for r in records),'renamed':changed},ensure_ascii=False))
