import "server-only";

type CellValue=string|number|boolean|null|undefined;

const CRC_TABLE=(()=>{
  const table:number[]=[];
  for(let n=0;n<256;n++){
    let c=n;
    for(let k=0;k<8;k++) c=(c&1)!==0 ? 0xedb88320^(c>>>1) : c>>>1;
    table[n]=c>>>0;
  }
  return table;
})();

function crc32(buffer:Buffer){
  let crc=0xffffffff;
  for(const byte of buffer) crc=(crc>>>8)^CRC_TABLE[(crc^byte)&0xff];
  return (crc^0xffffffff)>>>0;
}

function zipStore(entries:Array<{name:string;data:string|Buffer}>){
  const local:Buffer[]=[];
  const central:Buffer[]=[];
  let offset=0;

  for(const entry of entries){
    const name=Buffer.from(entry.name,"utf8");
    const data=Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data,"utf8");
    const crc=crc32(data);

    const localHeader=Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50,0);
    localHeader.writeUInt16LE(20,4);
    localHeader.writeUInt16LE(0,6);
    localHeader.writeUInt16LE(0,8);
    localHeader.writeUInt16LE(0,10);
    localHeader.writeUInt16LE(33,12);
    localHeader.writeUInt32LE(crc,14);
    localHeader.writeUInt32LE(data.length,18);
    localHeader.writeUInt32LE(data.length,22);
    localHeader.writeUInt16LE(name.length,26);
    localHeader.writeUInt16LE(0,28);

    local.push(localHeader,name,data);

    const centralHeader=Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50,0);
    centralHeader.writeUInt16LE(20,4);
    centralHeader.writeUInt16LE(20,6);
    centralHeader.writeUInt16LE(0,8);
    centralHeader.writeUInt16LE(0,10);
    centralHeader.writeUInt16LE(0,12);
    centralHeader.writeUInt16LE(33,14);
    centralHeader.writeUInt32LE(crc,16);
    centralHeader.writeUInt32LE(data.length,20);
    centralHeader.writeUInt32LE(data.length,24);
    centralHeader.writeUInt16LE(name.length,28);
    centralHeader.writeUInt16LE(0,30);
    centralHeader.writeUInt16LE(0,32);
    centralHeader.writeUInt16LE(0,34);
    centralHeader.writeUInt16LE(0,36);
    centralHeader.writeUInt32LE(0,38);
    centralHeader.writeUInt32LE(offset,42);

    central.push(centralHeader,name);
    offset+=localHeader.length+name.length+data.length;
  }

  const centralBuffer=Buffer.concat(central);
  const end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0);
  end.writeUInt16LE(0,4);
  end.writeUInt16LE(0,6);
  end.writeUInt16LE(entries.length,8);
  end.writeUInt16LE(entries.length,10);
  end.writeUInt32LE(centralBuffer.length,12);
  end.writeUInt32LE(offset,16);
  end.writeUInt16LE(0,20);

  return Buffer.concat([...local,centralBuffer,end]);
}

function escapeXml(value:unknown){
  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&apos;");
}

function columnName(index:number){
  let value=index;
  let output="";
  while(value>0){
    value-=1;
    output=String.fromCharCode(65+(value%26))+output;
    value=Math.floor(value/26);
  }
  return output;
}

function cellXml(value:CellValue,ref:string,isHeader:boolean){
  const style=isHeader?' s="1"':"";
  if(value===null || value===undefined || value==="") return `<c r="${ref}"${style}/>`;
  if(typeof value==="number" && Number.isFinite(value)) return `<c r="${ref}"${style}><v>${value}</v></c>`;
  if(typeof value==="boolean") return `<c r="${ref}" t="b"${style}><v>${value?1:0}</v></c>`;
  return `<c r="${ref}" t="inlineStr"${style}><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function worksheetXml(headers:string[],rows:CellValue[][]){
  const all:[CellValue[],...CellValue[][]]=[headers,...rows];
  const rowXml=all.map((row,rowIndex)=>{
    const r=rowIndex+1;
    const cells=row.map((value,columnIndex)=>cellXml(value,columnName(columnIndex+1)+r,rowIndex===0)).join("");
    return `<row r="${r}">${cells}</row>`;
  }).join("");

  const lastColumn=columnName(headers.length);
  const lastRow=all.length;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${lastColumn}${lastRow}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <sheetData>${rowXml}</sheetData>
  <autoFilter ref="A1:${lastColumn}${lastRow}"/>
</worksheet>`;
}

export function createSimpleXlsx(headers:string[],rows:CellValue[][],sheetName="Facilities"){
  const safeSheet=escapeXml(sheetName.slice(0,31)||"Data");
  const entries=[
    {
      name:"[Content_Types].xml",
      data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`
    },
    {
      name:"_rels/.rels",
      data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
    },
    {
      name:"xl/workbook.xml",
      data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="${safeSheet}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`
    },
    {
      name:"xl/_rels/workbook.xml.rels",
      data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
    },
    {
      name:"xl/styles.xml",
      data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Aptos"/></font>
    <font><b/><sz val="11"/><name val="Aptos"/></font>
  </fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
  <borders count="1"><border/></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`
    },
    {
      name:"xl/worksheets/sheet1.xml",
      data:worksheetXml(headers,rows)
    }
  ];

  return zipStore(entries);
}
