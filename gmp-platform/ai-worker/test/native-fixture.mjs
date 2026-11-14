export function nativeFixture() {
  const model={groups:[{id:'g',name:'记录'}],fields:[{id:'date',groupId:'g',name:'记录日期',type:'datetime',status:'enabled',sortOrder:1,typeConfig:{}}],custom:{keep:'untouched'}};
  const canvas={currentPageId:'p',pages:[{id:'p',name:'记录表',nodes:[{id:'n',type:'datetime',props:{},style:{cellRange:{t:1,b:1,l:2,r:2}},bindings:{fieldId:'date'}}],
    sheet:{rowCount:3,columnCount:2,defaultRowHeight:40,defaultColumnWidth:180,rowHeights:[40,40,40],columnWidths:[180,180],showGridLines:true,showHeader:false,showFooter:false,canvasMode:'sheet',paperMode:'table',paperOrientation:'portrait',paperMarginTopMm:5,paperMarginRightMm:6,paperMarginBottomMm:6,paperMarginLeftMm:6},
    cells:{'1:1':{value:'记录日期',style:{}}},mergedCells:[],medias:[],images:[]}]};
  const wrap=payload=>JSON.stringify({schema:'edhr-template-designer-react',version:1,payload});
  return {modelDesignJson:wrap(model),canvasDesignJson:wrap(canvas),workflowDesignJson:wrap({nodes:[],edges:[],config:{},custom:'preserved'})};
}
