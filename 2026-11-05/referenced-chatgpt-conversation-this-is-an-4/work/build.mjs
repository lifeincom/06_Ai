import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire('C:/Users/hoon5/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {FileBlob,SpreadsheetFile,Workbook}=require('@oai/artifact-tool');
const d=JSON.parse(await fs.readFile('work/inspection.json','utf8'));
const out='outputs/상품별_변환결과';
await fs.mkdir(out+'/개별파일',{recursive:true});
await fs.mkdir('work/previews',{recursive:true});
const source=d[0].sheets[0], cells=new Map(source.cells.map(c=>[c[0],c[1]]));
const headers=Array.from({length:15},(_,i)=>cells.get(String.fromCharCode(65+i)+'1'));
const rows=[];
for(let r=2;r<=source.rows;r++){
 const vals=headers.map((_,i)=>cells.get(String.fromCharCode(65+i)+r)??null);
 if(vals.some(v=>v!==null&&v!==''))rows.push({r,vals});
}
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(d[1].path));
const s=wb.worksheets.getItemAt(0), seen=new Set(), report=[], missing=[];
for(const {r,vals} of rows){
 const stem=String(vals[0])+'_'+String(vals[1]);
 if(vals[0]===null||vals[1]===null||/[<>:"/\\|?*\x00-\x1f]/.test(stem))throw Error('Invalid name at row '+r);
 const dup=seen.has(stem.toLowerCase()); seen.add(stem.toLowerCase());
 const rel=(dup?'중복_원본행'+r+'/':'')+stem+'.xlsx';
 await fs.mkdir(path.dirname(out+'/개별파일/'+rel),{recursive:true});
 s.getRange('B1').values=[[stem]];
 s.getRange('B3:B15').values=vals.slice(2).map(v=>[v]);
 for(let j=2;j<15;j++){
  const val=String(vals[j]??'');
  const lines=val.split('\n').reduce((n,t)=>n+Math.max(1,Math.ceil([...t].reduce((a,c)=>a+(c.charCodeAt(0)>255?2:1),0)/65)),0);
  s.getRange(`A${j+1}:B${j+1}`).format.rowHeight=Math.max(50.1,lines*15+10);
  if(vals[j]===null||vals[j]==='')missing.push([r,vals[0],vals[1],headers[j],'원본 빈칸 유지']);
 }
 wb.recalculate();
 const got=s.getRange('B3:B15').values.flat();
 if(JSON.stringify(got)!==JSON.stringify(vals.slice(2)))throw Error('Value mismatch '+r);
 await (await SpreadsheetFile.exportXlsx(wb)).save(out+'/개별파일/'+rel);
 const preview=await wb.render({sheetName:'Sheet1',range:'A1:B15',scale:1,format:'png'});
 await fs.writeFile('work/previews/'+vals[0]+'.png',new Uint8Array(await preview.arrayBuffer()));
 const blanks=headers.slice(2).filter((_,i)=>vals[i+2]===null||vals[i+2]==='');
 report.push([r,vals[0],vals[1],rel,blanks.length,blanks.join(', '),dup?'별도 하위폴더에 원래 파일명 유지':'없음','생성 완료']);
 console.log('Created '+stem);
}
const rw=Workbook.create();
const summary=rw.worksheets.add('처리결과');
summary.getRange('A2').values=[['상품별 변환 처리결과']];
summary.getRange('A4:B8').values=[['대상 상품 수',rows.length],['생성 파일 수',report.length],['누락 항목 있는 상품 수',report.filter(x=>x[4]>0).length],['중복 파일명 수',report.filter(x=>x[6]!=='없음').length],['빈 행 제외 수',source.rows-1-rows.length]];
summary.getRange('A10:B12').values=[['파일명 규칙','원본 NO_원본 폴더명.xlsx (숫자 NO 앞에 0 추가 안 함)'],['누락 처리','원본 빈칸 유지. 양식 예시값으로 대체하지 않음.'],['서식 처리','양식 유지. 긴 내용이 있는 행의 높이만 확대.']];
summary.getRange('A14:H14').values=[['원본 행','NO','폴더명','생성 파일명','누락 수','누락 항목','중복 처리','결과']];
summary.getRange(`A15:H${14+report.length}`).values=report;
const ms=rw.worksheets.add('누락상세');
ms.getRange('A2:E2').values=[['원본 행','NO','폴더명','누락 항목','처리 내용']];
if(missing.length)ms.getRange(`A3:E${missing.length+2}`).values=missing;
const mp=rw.worksheets.add('항목대응');
mp.getRange('A2:C2').values=[['원본 항목','입력양식 위치','처리']];
mp.getRange('A3:C17').values=headers.map((h,i)=>[h,i<2?'B1':`B${i+1}`,i<2?'NO_폴더명 조합':'값·줄바꿈 그대로 유지']);
for(const sh of [summary,ms,mp]){
 sh.showGridLines=false;
 const ur=sh.getUsedRange(); ur.format.font={name:'맑은 고딕',size:10};ur.format.rowHeight=25;
 ur.format.columnWidth=22;
 sh.getRange('A1:B80').format.columnWidth=13;
 sh.getRange('C1:C80').format.columnWidth=29;
 sh.getRange('D1:D80').format.columnWidth=40;
}
summary.getRange('F1:F80').format.columnWidth=65;
summary.getRange('G1:H80').format.columnWidth=18;
summary.getRange('E1:E80').format.columnWidth=12;
summary.getRange('A2').format.font={name:'맑은 고딕',size:16,bold:true};
for(const [sh,rng] of [[summary,'A14:H14'],[ms,'A2:E2'],[mp,'A2:C2']])sh.getRange(rng).format={fill:'#243C51',font:{name:'맑은 고딕',color:'#FFFFFF',bold:true},rowHeight:28};
summary.getRange(`F15:F${14+report.length}`).format.wrapText=true;
summary.getRange(`A15:H${14+report.length}`).format.rowHeight=44;
summary.freezePanes.freezeRows(14);ms.freezePanes.freezeRows(2);
rw.recalculate();
console.log((await rw.inspect({kind:'table',range:'처리결과!A4:B8',maxChars:1000})).ndjson);
console.log((await rw.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?',options:{useRegex:true,maxResults:20},maxChars:1000})).ndjson);
for(const [sh,rng] of [['처리결과','A1:H20'],['누락상세','A1:E18'],['항목대응','A1:C18']]){
 const p=await rw.render({sheetName:sh,range:rng,scale:1,format:'png'});await fs.writeFile('work/'+sh+'.png',new Uint8Array(await p.arrayBuffer()));
}
await (await SpreadsheetFile.exportXlsx(rw)).save(out+'/누락_중복_처리결과.xlsx');
await fs.writeFile('work/results.json',JSON.stringify({report,missing,rows},null,2));
