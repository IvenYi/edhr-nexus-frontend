import JSZip from 'jszip';
import {readFile} from 'node:fs/promises';

const png=await readFile(new URL('./sample-badge.png',import.meta.url));
export const paragraph=text=>`<w:p><w:r><w:t>${text}</w:t></w:r></w:p>`;
export function drawing(id='rId1',width=64,height=32){
  return `<w:r><w:drawing><wp:inline><wp:extent cx="${width*9525}" cy="${height*9525}"/><a:graphic><a:graphicData><a:blip r:embed="${id}"/></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
}
export function table(rows=4,images=3,label='记录'){
  return '<w:tbl><w:tblGrid><w:gridCol w:w="2400"/><w:gridCol w:w="3600"/></w:tblGrid>'+Array.from({length:rows},(_,i)=>
    `<w:tr><w:trPr><w:trHeight w:val="${i%2?720:900}"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/><w:tcBorders><w:top w:val="single"/><w:bottom w:val="single"/></w:tcBorders></w:tcPr><w:p><w:r><w:t>${label}${i}</w:t></w:r>${i<images?drawing():''}</w:p></w:tc><w:tc>${paragraph('核对'+i)}</w:tc></w:tr>`).join('')+'</w:tbl>';
}
export function mergedTable(){
  return '<w:tbl><w:tblGrid><w:gridCol w:w="1200"/><w:gridCol w:w="1800"/><w:gridCol w:w="2400"/></w:tblGrid>'
    +'<w:tr><w:tc><w:tcPr><w:gridSpan w:val="2"/><w:vMerge w:val="restart"/><w:tcW w:w="3000" w:type="dxa"/><w:tcBorders><w:top w:val="double"/><w:tl2br w:val="single"/></w:tcBorders><w:shd w:fill="EEEEEE"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>合并标题</w:t></w:r>'+drawing('rId1',80,40)+'</w:p></w:tc><w:tc>'+paragraph('独立列')+'</w:tc></w:tr>'
    +'<w:tr><w:tc><w:tcPr><w:gridSpan w:val="2"/><w:vMerge/></w:tcPr><w:p/></w:tc><w:tc><w:p><w:r><w:t>第二行图片</w:t></w:r>'+drawing('rId1',90,45)+'</w:p></w:tc></w:tr></w:tbl>';
}
export async function wordPackage(body,{missingRelationship=false,malformed=false}={}){
  const zip=new JSZip();
  zip.file('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file('_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="doc" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  const xml='<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><w:body>'+body+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/></w:sectPr></w:body></w:document>';
  zip.file('word/document.xml',malformed?xml.slice(0,-15):xml);
  zip.file('word/_rels/document.xml.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+(missingRelationship?'':'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/badge.png"/>')+'</Relationships>');
  zip.file('word/media/badge.png',png);
  return Buffer.from(await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
}
