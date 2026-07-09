import { measureText, TABLE_CELL_HEIGHT_MODE } from '@gct/runtime';

export const typePadding = (option) => {
  if (!option.value) return 33;
  if (option.type === 'user' || option.type === 'user_multi') return 57;
  if (option.type === 'icon') return 52;
  if (option.type === 'checkbox') return 36;
  if (
    option.value.includes('ROLE:') ||
    option.value.includes('ORG:') ||
    option.value.includes('USER_GROUP:')
  )
    return 52;
  if (option.icon || option._item?.icon) return 52;
  if (option.value.includes('USER:')) return 57;
  return 33;
};
/** 计算规定行内tag最多展示个数 */
export function calcMutiLineTags(selectLabel, maxRow = 3, selectWidth = 100, maxTagCount = 0) {
  const PLUS_WIDTH = 62 + 6; // +n 固定宽度

  let currentLineWidth = 0;
  let currentRow = 1;
  let showCount = 0;
  const total = selectLabel.length;

  // 先不考虑 +n，正常放所有标签，记录每一个的位置
  const rows = [[]]; // 每一行放哪些标签

  for (let i = 0; i < total; i++) {
    if (!selectLabel[i]) continue;
    const label = selectLabel[i].label || selectLabel[i].value;
    if (!label) continue;
    const tagPadding = typePadding(selectLabel[i]) || 29;
    const w =
      measureText(maxTagCount && label.length > maxTagCount ? label.slice(0, maxTagCount) : label, {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
      }) +
      tagPadding +
      (label.length > maxTagCount ? 9 : 0);
    // 超出行数
    if (currentRow > maxRow) break;

    // 标签独占一行
    if (w >= selectWidth) {
      if (currentRow >= maxRow && rows[currentRow - 1] && rows[currentRow - 1].length) break;
      if (rows[currentRow - 1] && rows[currentRow - 1].length) {
        rows.push([i]);
        currentRow++;
      } else {
        rows[currentRow - 1] = [i];
      }
      currentRow++;
      currentLineWidth = 0;
      showCount++;
      continue;
    }
    // 当前行能放下
    if (currentLineWidth + w <= selectWidth) {
      currentLineWidth += w;
      rows[currentRow - 1] ? rows[currentRow - 1].push(i) : (rows[currentRow - 1] = [i]);
      showCount++;
    } else {
      // 换行
      if (currentRow >= maxRow) break;

      currentRow++;
      currentLineWidth = w;
      rows.push([i]);
      showCount++;
    }
  }
  // ==============================================
  // 🔥 最终核心：最后一行必须能放下 +n
  // ==============================================
  if (rows.length >= maxRow && total > showCount) {
    const lastRow = rows[maxRow - 1];
    let lastLineWidth = 0;

    // 计算最后一行宽度
    for (const idx of lastRow) {
      if (selectLabel[idx].type === 'checkbox') {
        continue;
      }
      const label = selectLabel[idx].label || selectLabel[idx].value;
      const tagPadding = typePadding(selectLabel[idx]) || 29;
      lastLineWidth +=
        measureText(
          maxTagCount && label.length > maxTagCount ? label.slice(0, maxTagCount) : label,
        ) +
        tagPadding +
        (label.length > maxTagCount ? 9 : 0);
    }
    // console.log('lastLineWidth', lastLineWidth);
    // 如果最后一行 +52 超出宽度 → 删掉最后一个标签腾位置
    if (lastLineWidth + PLUS_WIDTH > selectWidth && lastRow.length > 0) {
      lastRow.pop();
      showCount--;
    }
  }
  console.log('showCount', showCount);

  return showCount;
}

/** 计算是否是单行模式 */
export function isSingleLine(tableCellHeight) {
  if (!tableCellHeight) return true;
  if (
    !tableCellHeight.cellHeightMode ||
    tableCellHeight.cellHeightMode === TABLE_CELL_HEIGHT_MODE.ONE_ROW ||
    (tableCellHeight.cellHeightMode === TABLE_CELL_HEIGHT_MODE.CUSTOM_ROW &&
      tableCellHeight.cellHeight == 1)
  ) {
    return true;
  }
  return false;
}
/** 非单行模式 */
export function isNotSignalLine(tableCellHeight) {
  if (!tableCellHeight) return true;
  if (isSingleLine(tableCellHeight)) return true;
  if (tableCellHeight.cellHeightMode === TABLE_CELL_HEIGHT_MODE.ALL_ROW) return true;
  return false;
}
