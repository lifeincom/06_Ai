import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire('C:/Users/hoon5/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {FileBlob,SpreadsheetFile}=require('@oai/artifact-tool');
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load('work/source.xlsx'));
console.log((await wb.inspect({kind:'workbook,sheet,table',maxChars:5000,tableMaxRows:3,tableMaxCols:20})).ndjson);
console.log(wb.help('range.delete',{include:'index,examples,notes',maxChars:2500}).ndjson);
await fs.writeFile('work/source.png',new Uint8Array(await (await wb.render({sheetName:wb.worksheets.getItemAt(0).name,range:'A1:F3',scale:1})).arrayBuffer()));
