import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
import { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';
import { useAllSpreadSheets } from '/@online-form/views/designer/hooks/useAllSpreadSheets';
import { DesignMode } from '/@online-form/views/designer/enums';
import { useSpreadSheetEvent } from '/@online-form/views/designer/hooks/useSpreadSheetEvent';
import { ICellInfo } from '/@online-form/views/designer/hooks/reverse-modeling/scan-field';
import { initWebPaasUploadApis } from '@gct/nocode-web-render';

export function useDiffSheet() {
  const { emitter } = useSpreadSheetEvent();
  const { activeSheet, sheetsData, changeActiveSheet, getSheet } = useAllSpreadSheets();
  const {
    setDoc,
    setSheetMaps,
    setDesignMode,
    paperLayout,
    paperFitHeight,
    selection,
    findMergeCell,
  } = useSpreadSheet();
  function init(tmplInfo: OnlineFormTmplResponse) {
    setDoc(tmplInfo);
    setSheetMaps(tmplInfo?.designerJson ? JSON.parse(tmplInfo.designerJson) : null, tmplInfo);
    setDesignMode(DesignMode.Refer);

    /**
     * 设置上传api
     */
    initWebPaasUploadApis();
  }

  /**
   * 设置当前激活的sheet
   * @param sheetKey 标识
   */
  function setActiveSheet(sheetKey: string) {
    const sheet = getSheet(sheetKey);
    if (!sheet) {
      return;
    }
    changeActiveSheet(sheet);
  }

  /**
   * 选中指定单元格(在合并单元格内显示合并单元格)
   * @param cellInfo
   */
  function selectCell(cellInfo: ICellInfo) {
    if (activeSheet.value !== cellInfo.sheetId) {
      const sheet = getSheet(cellInfo.sheetId!);
      if (!sheet) {
        return;
      }
      changeActiveSheet(sheet);
    }
    const { x, y } = cellInfo;
    let targetRange = {
      l: x + 1,
      r: x + 1,
      t: y + 1,
      b: y + 1,
      e: {
        _l: x + 1,
        _r: x + 1,
        _t: y + 1,
        _b: y + 1,
      },
    };
    const mergeCell = findMergeCell(x, y);
    if (mergeCell) {
      targetRange = {
        ...mergeCell,
        e: {
          _l: mergeCell.l,
          _r: mergeCell.r,
          _t: mergeCell.t,
          _b: mergeCell.b,
        },
      };
    }
    Object.assign(selection, targetRange);
  }

  return {
    init,
    emitter,
    paperLayout,
    paperFitHeight,
    activeSheet,
    setActiveSheet,
    selectCell,
  };
}
