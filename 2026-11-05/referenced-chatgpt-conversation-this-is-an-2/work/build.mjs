import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire('C:/Users/hoon5/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {FileBlob,SpreadsheetFile}=require('@oai/artifact-tool');
const input=await FileBlob.load('work/source.xlsx');
const source=await SpreadsheetFile.importXlsx(input);
const data=source.worksheets.getItemAt(0).getRange('A1:O57').values;
await fs.mkdir('work/generated',{recursive:true});
await fs.writeFile('work/data.json',JSON.stringify(data));
for(let i=1;i<data.length;i++){
 const wb=await SpreadsheetFile.importXlsx(input),s=wb.worksheets.getItemAt(0);
 s.getRange('A2:O2').copyFrom(s.getRange(`A${i+1}:O${i+1}`),'all');
 s.getRange('A3:O57').clear({applyTo:'all'});
 wb.recalculate();
 if(JSON.stringify(s.getRange('A2:O2').values[0])!==JSON.stringify(data[i]))throw Error(`Mismatch ${i}`);
 await (await SpreadsheetFile.exportXlsx(wb)).save(`work/generated/${i}.xlsx`);
}
console.log(JSON.stringify({generated:data.length-1,columns:data[0]}));
