import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire('C:/Users/hoon5/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {FileBlob,SpreadsheetFile}=require('@oai/artifact-tool');
const d=JSON.parse(await fs.readFile('work/inspection.json','utf8'));
const w=await SpreadsheetFile.importXlsx(await FileBlob.load(d[1].path));
console.log((await w.inspect({kind:'table',range:'Sheet1!A1:B15',maxChars:1500,tableMaxRows:3})).ndjson);
const p=await w.render({sheetName:'Sheet1',range:'A1:B15',scale:1,format:'png'});
await fs.writeFile('work/template.png',new Uint8Array(await p.arrayBuffer()));
