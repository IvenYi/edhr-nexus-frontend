import VXETablePluginExportXLSX from 'vxe-table-plugin-export-xlsx';
import VXETablePluginExportPDF from 'vxe-table-plugin-export-pdf';
import ExcelJS from 'exceljs';
import { VXETable, VxeTablePropTypes } from 'vxe-table';
import { ref, nextTick } from 'vue';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
// 将jsPDF实例挂载到全局，以便PDF导出插件使用
(window as any).jsPDF = jsPDF;

VXETable.use(VXETablePluginExportXLSX, {
  ExcelJS,
});
VXETable.use(VXETablePluginExportPDF, {
  jsPDF,
  fontName: 'SourceHanSans-Normal',
  fonts: [
    {
      fontName: 'SourceHanSans-Normal',
      fontUrl: `${window.location.origin}/fonts/source-han-sans-normal.js`,
    },
  ],
});
export function useExportReportData({ vxeTable }) {
  const exportConfig = ref<VxeTablePropTypes.ExportConfig>({
    isMerge: true,
    useStyle: true,
    download: false,
    remote: false,
    // types: ['xlsx', 'csv', 'html', 'xml', 'txt']
  });
  async function exportData({
    data,
    columns,
    exportType,
    config,
  }: {
    data?: any[];
    columns?: any[];
    exportType: ExportTypeEnum;
    config: any;
  }) {
    const filename = config.filename || '导出';
    // 数据为签名字段时数据特殊处理,将数组变成url
    const signColumns = columns.value
      ?.filter((i) => i.params.fieldType === 'electronic_signature')
      .map((p) => p.params.field);

    const handleData = data.map((i) => {
      const signatureField = {};
      signColumns.forEach((p) => {
        if (i[p] && i[p].startsWith('[')) {
          const arr = JSON.parse(i[p]);

          if (Array.isArray(arr)) {
            signatureField[p] = arr.map((y) => y.url || y.username || y);
          }
        }
      });
      return {
        ...i,
        ...signatureField,
      };
    });

    if (exportType === ExportTypeEnum.EXCEL) {
      await vxeTable.value.updateFooter();
      const res = await vxeTable.value.exportData({
        filename,
        download: false,
        data: handleData,
        columns,
        type: 'xlsx',
        sheetMethod: ({ options, workbook, worksheet }) => {
          const columns = options.columns;
          const headerLevel = options.colgroups.length;
          try {
            // 遍历所有列
            columns.forEach((col, colIndex) => {
              const field = col.field;
              if (!field) return;
              data.forEach((row, rowIndex) => {
                const span = row._GCT_?.[field];
                // 只处理需要合并的单元格（row_span > 1）
                if (span && span.row_span > 1) {
                  // ExcelJS 行列都是从1开始
                  const startRow = rowIndex + 1 + headerLevel; // +2: 1为表头，数据从第2行开始
                  const endRow = startRow + span.row_span - 1;
                  const colNum = colIndex + 1;
                  // console.log(startRow, colNum, endRow, colNum)
                  worksheet.mergeCells(startRow, colNum, endRow, colNum);
                }
              });
            });
          } catch (error) {
            console.log(error);
          }
        },
      });
    }
    if (exportType === ExportTypeEnum.PDF) {
      const res = await vxeTable.value.exportData({
        filename,
        data: handleData,
        columns,
        type: 'pdf',
        beforeExportMethod: (arg) => {
          console.log(arg);
        },
      });
    }
    if (exportType === ExportTypeEnum.PNG) {
      const res = await vxeTable.value.exportData({
        filename,
        download: false,
        data: handleData,
        columns,
        type: 'html',
      });

      const tempBody = document.createElement('iframe');
      tempBody.style.position = 'absolute';
      tempBody.style.left = '-9999px'; // 隐藏元素
      tempBody.innerHTML = res.content;
      document.body.appendChild(tempBody);
      const iframeDoc = tempBody.contentDocument || tempBody.contentWindow?.document;
      iframeDoc.open();
      iframeDoc.write(res.content);
      iframeDoc.close();
      tempBody.onload = async () => {
        html2canvas(iframeDoc.body).then(async (canvas) => {
          const dataUrl = canvas.toDataURL('image/png');
          // 或者直接下载图片（使用 a 标签）
          const link = document.createElement('a');
          link.download = filename + '.png'; // 设置下载文件名
          link.href = dataUrl;
          link.click(); // 触发下载
          await nextTick();
          document.body.removeChild(tempBody);
        });
      };
    }
  }

  return { exportConfig, exportData };
}

/**导出类型 */
export enum ExportTypeEnum {
  EXCEL = 'excel',
  PNG = 'png',
  PDF = 'pdf',
}
