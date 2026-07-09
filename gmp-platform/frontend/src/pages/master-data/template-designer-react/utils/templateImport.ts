import type { CanvasPage, CanvasPaperOrientation } from '../types';
import { importExcelToCanvasPage } from './importExcel';
import { importWordToCanvasPage } from './importWord';

function getExtension(file: File) {
  return file.name.split('.').pop()?.toLowerCase() ?? '';
}

function normalizeImportPage(page: CanvasPage, currentPage?: CanvasPage | null) {
  const orientation: CanvasPaperOrientation = page.sheet.paperOrientation === 'landscape' ? 'landscape' : 'portrait';
  return {
    ...page,
    id: currentPage?.id ?? page.id,
    name: currentPage?.name ?? page.name,
    sheet: {
      ...page.sheet,
      paperOrientation: orientation,
    },
  };
}

export async function importTemplateToCanvasPage(
  file: File,
  currentPage?: CanvasPage | null,
): Promise<CanvasPage> {
  const extension = getExtension(file);
  const pageId = currentPage?.id ?? 'page-1';
  const pageName = currentPage?.name ?? '页面 1';

  if (['docx', 'doc'].includes(extension)) {
    return normalizeImportPage(
      await importWordToCanvasPage(file, { pageId, pageName }),
      currentPage,
    );
  }

  if (['xlsx', 'xlsm', 'xls'].includes(extension)) {
    return normalizeImportPage(
      await importExcelToCanvasPage(file, { pageId, pageName }),
      currentPage,
    );
  }

  throw new Error('仅支持导入 .xlsx/.xlsm/.xls/.docx/.doc 文件');
}
