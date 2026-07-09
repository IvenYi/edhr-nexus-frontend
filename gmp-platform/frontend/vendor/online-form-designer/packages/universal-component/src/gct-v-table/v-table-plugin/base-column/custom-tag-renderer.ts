import {
  IGraphic,
  IGroupGraphicAttribute,
  createGroup,
  createRect,
  createText,
} from '@visactor/vtable/es/vrender';
import { colord } from 'colord';
import { measureText, truncateText } from '@gct/runtime';
import { ICustomTag } from '../../interface';

/**
 * 自定义标签渲染器
 * 负责渲染表格列中的多个自定义标签
 *
 * @export
 * @class CustomTagRenderer
 */
export class CustomTagRenderer {
  private _primaryColor: string;
  private _widthCache: Map<string, number> = new Map();

  constructor(primaryColor: string) {
    this._primaryColor = primaryColor;
  }

  /**
   * 渲染多个自定义标签
   *
   * @param {ICustomTag[]} customTags - 自定义标签数组
   * @param {number} maxWidth - 标签组最大宽度限制
   * @param {string} [fontFamily='sans-serif'] - 字体族
   * @return {*}  {(IGraphic | null)}
   */
  renderTags(customTags: ICustomTag[], maxWidth: number, fontFamily: string = 'sans-serif'): IGraphic | null {
    if (!customTags || !Array.isArray(customTags) || customTags.length === 0) {
      return null;
    }

    const validTags = customTags.filter((tag) => tag.text);
    if (validTags.length === 0) {
      return null;
    }

    const tagsContainer = createGroup({
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
    });

    const fontSize = 12;
    const spacing = 8; // 标签间距
    const paddingHorizontal = 6 * 2; // 左右各 6px
    let currentWidth = 0;

    for (let index = 0; index < validTags.length; index++) {
      const tagData = validTags[index];
      
      // 计算当前标签的宽度
      const textWidth = measureText(tagData.text, { fontSize, fontFamily });
      const tagWidth = paddingHorizontal + textWidth;
      
      // 添加标签间距
      if (index > 0) {
        const spacingRect = createRect({ width: spacing, height: 22 });
        tagsContainer.add(spacingRect);
        currentWidth += spacing;
      }

      // 如果加上当前标签会超出最大宽度
      if (currentWidth + tagWidth > maxWidth) {
        // 计算剩余可用宽度
        const remainingWidth = maxWidth - currentWidth;
        // 如果剩余宽度足够容纳内边距，则渲染受限的标签
        if (remainingWidth > paddingHorizontal) {
          const maxTextWidth = remainingWidth - paddingHorizontal;
          const tagGroup = this.renderSingleTag(tagData, maxTextWidth, fontFamily);
          if (tagGroup) {
            tagsContainer.add(tagGroup);
          }
        }
        // 渲染完受限标签后停止
        break;
      }

      // 渲染完整标签
      const tagGroup = this.renderSingleTag(tagData);
      if (tagGroup) {
        tagsContainer.add(tagGroup);
        currentWidth += tagWidth;
      }
    }

    return tagsContainer.childrenCount > 0 ? tagsContainer : null;
  }



  /**
   * 渲染单个自定义标签
   *
   * @param {ICustomTag} tagData - 标签数据
   * @param {number} [maxTextWidth] - 文本最大宽度，超出则截断
   * @param {string} [fontFamily='sans-serif'] - 字体族
   * @returns {*}  {(IGraphic | null)}
   */
  renderSingleTag(tagData: ICustomTag, maxTextWidth?: number, fontFamily: string = 'sans-serif'): IGraphic | null {
    const styleOpts: Partial<IGroupGraphicAttribute> = {};
    const tagColor = tagData.color || this._primaryColor;

    // 根据配置绘制不同样式的标签
    switch (tagData.type) {
      // 线面结合-圆角
      case 'radius':
        Object.assign(styleOpts, {
          cornerRadius: 3,
          fill: colord(tagColor).alpha(0.1).toRgbString(),
          stroke: colord(tagColor).alpha(0.5).toRgbString(),
          lineWidth: 1,
        });
        break;
      // 线面结合-大圆角（胶囊）
      case 'big_radius':
        Object.assign(styleOpts, {
          cornerRadius: 50,
          fill: colord(tagColor).alpha(0.1).toRgbString(),
          stroke: colord(tagColor).alpha(0.5).toRgbString(),
          lineWidth: 1,
        });
        break;
      // 线面结合-状态
      case 'status':
        Object.assign(styleOpts, {
          cornerRadius: [11, 3, 3, 3],
          fill: colord(tagColor).alpha(0.1).toRgbString(),
          stroke: colord(tagColor).alpha(0.5).toRgbString(),
          lineWidth: 1,
        });
        break;
      // 面性-圆角
      case 'surface_radius':
        Object.assign(styleOpts, {
          cornerRadius: 3,
          fill: tagColor,
        });
        break;
      // 面性-大圆角（胶囊）
      case 'surface_big_radius':
        Object.assign(styleOpts, {
          cornerRadius: 50,
          fill: tagColor,
        });
        break;
      // 面性-状态
      case 'surface_status':
        Object.assign(styleOpts, {
          cornerRadius: [11, 3, 3, 3],
          fill: tagColor,
        });
        break;
      // 线性-圆角
      case 'line_radius':
        Object.assign(styleOpts, {
          cornerRadius: 3,
          stroke: colord(tagColor).alpha(0.5).toRgbString(),
          lineWidth: 1,
        });
        break;
      // 线性-大圆角（胶囊）
      case 'line_big_radius':
        Object.assign(styleOpts, {
          cornerRadius: 50,
          stroke: colord(tagColor).alpha(0.5).toRgbString(),
          lineWidth: 1,
        });
        break;
      // 线性-虚线圆角
      case 'line_dashed_radius':
        Object.assign(styleOpts, {
          cornerRadius: 3,
          stroke: colord(tagColor).alpha(0.5).toRgbString(),
          lineWidth: 1,
          lineDash: [4, 2],
        });
        break;
      // 线性-状态
      case 'line_status':
        Object.assign(styleOpts, {
          cornerRadius: [11, 3, 3, 3],
          stroke: colord(tagColor).alpha(0.5).toRgbString(),
          lineWidth: 1,
        });
        break;
      default:
        // 默认使用线面结合-圆角样式
        Object.assign(styleOpts, {
          cornerRadius: 3,
          fill: colord(tagColor).alpha(0.1).toRgbString(),
          stroke: colord(tagColor).alpha(0.5).toRgbString(),
          lineWidth: 1,
        });
    }

    const tagGroup = createGroup({
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      ...styleOpts,
    });

    const padding = createRect({ width: 6, height: 22 });
    tagGroup.add(padding);

    const textColor = this.getTextColor(tagData.type, tagColor);
    const fontSize = 12;
    
    // 如果指定了最大宽度，则截断文本
    let displayText = tagData.text;
    if (maxTextWidth && maxTextWidth > 0) {
      displayText = truncateText(tagData.text, maxTextWidth, { fontSize, fontFamily }, '...');
    }
    
    const tagText = createText({
      fill: textColor,
      fontSize,
      lineHeight: 16,
      text: displayText,
      whiteSpace: 'no-wrap',
    });
    tagGroup.add(tagText);

    tagGroup.add(padding.clone());

    return tagGroup;
  }

  /**
   * 根据标签类型获取文本颜色
   *
   * @param {string} type - 标签类型
   * @param {string} tagColor - 标签颜色
   * @returns {*}  {string}
   */
  getTextColor(type: string, tagColor: string): string {
    // 面性标签使用白色文字，其他使用标签颜色
    const surfaceTypes = ['surface_radius', 'surface_big_radius', 'surface_status'];
    return surfaceTypes.includes(type) ? '#ffffff' : tagColor;
  }

  /**
   * 计算标签组的总宽度
   *
   * @param {ICustomTag[]} customTags - 自定义标签数组
   * @param {string} [fontFamily='sans-serif'] - 字体族
   * @returns {*}  {number}
   */
  calculateTagsWidth(customTags: ICustomTag[], fontFamily: string = 'sans-serif'): number {
    if (!customTags || !Array.isArray(customTags) || customTags.length === 0) {
      return 0;
    }

    // 生成缓存键：使用标签文本内容组合
    const cacheKey = customTags.map((tag) => tag.text || '').join('|') + `@${fontFamily}`;

    // 检查缓存
    if (this._widthCache.has(cacheKey)) {
      return this._widthCache.get(cacheKey)!;
    }

    let totalWidth = 0;
    const fontSize = 12;
    const paddingHorizontal = 6 * 2; // 左右各 6px
    const spacing = 8; // 标签间距

    customTags.forEach((tagData, index) => {
      if (!tagData.text) {
        return;
      }

      // 计算单个标签宽度：左内边距 + 文本宽度 + 右内边距
      const textWidth = measureText(tagData.text, { fontSize, fontFamily });
      const tagWidth = paddingHorizontal + textWidth;
      totalWidth += tagWidth;

      // 添加标签间距，最后一个标签不添加
      if (index < customTags.length - 1) {
        totalWidth += spacing;
      }
    });

    // 存入缓存
    this._widthCache.set(cacheKey, totalWidth);

    return totalWidth;
  }
}
