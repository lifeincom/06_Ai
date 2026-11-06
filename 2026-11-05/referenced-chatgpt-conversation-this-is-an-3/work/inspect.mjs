import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire('C:/Users/hoon5/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {FileBlob,SpreadsheetFile}=require('@oai/artifact-tool');
const w=await SpreadsheetFile.importXlsx(await FileBlob.load('C:/Users/hoon5/AppData/Local/Temp/codex-file-preview-rct5w1/상품정보입력양식.xlsx'));
console.log((await w.inspect({kind:'workbook,sheet,table',maxChars:2500,tableMaxRows:3,tableMaxCols:2})).ndjson);
await fs.writeFile('work/original.json',JSON.stringify(w.worksheets.getItemAt(0).getRange('A1:B15').values));
await fs.writeFile('work/original.png',new Uint8Array(await (await w.render({sheetName:'Sheet1',range:'A1:B15',scale:1.5})).arrayBuffer()));
