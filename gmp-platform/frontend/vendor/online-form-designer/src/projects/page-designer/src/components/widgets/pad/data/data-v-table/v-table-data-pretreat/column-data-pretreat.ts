import { Ref } from 'vue';
import { LowCodeWidget } from '@gct/runtime';
import { calc } from '@/components/Expression/utils/expression';
import { ICustomTag, IDataVTableQuery, IVTableDataItem } from '@gct/universal-component/gct-v-table';

/**
 * 表格对象传入的方法
 */
export type TableObj = { event: any; queryData: Ref<Partial<IDataVTableQuery>> };

/**
 * 列数据预处理抽象基类
 * 提供统一的接口和公共方法，子类可根据字段类型实现特定的预处理逻辑
 */
export abstract class ColumnDataPretreat {
  protected widget: LowCodeWidget.BasicSchema;
  protected obj?: TableObj;

  constructor(widget: LowCodeWidget.BasicSchema, obj?: TableObj) {
    this.widget = widget;
    this.obj = obj;
  }

  /**
   * 主预处理方法 - 模板方法模式
   * 定义预处理流程骨架，子类通过 processSpecificLogic() 实现特定逻辑
   * @param item 行数据项
   */
  async preprocess(item: IVTableDataItem): Promise<void> {
    this.initializeObject(item);
    this.clearRowHeightCache(item);
    await this.executeCommonRuleCalculations(item);
    await this.processSpecificLogic(item);
  }

  /**
   * 子类可覆写此方法实现特定的预处理逻辑
   * 在基类的标准流程中执行
   * @param item 行数据项
   */
  protected async processSpecificLogic(item: IVTableDataItem): Promise<void> {
    // 默认无特定逻辑，子类可覆写
  }

  /**
   * 初始化基础对象
   * @param item 行数据项
   */
  protected initializeObject(item: IVTableDataItem): void {
    if (item._STYLE == null) {
      item._STYLE = {};
    }
    const { field } = this.widget.props;
    if (item._STYLE[field] == null) {
      item._STYLE[field] = {};
    }
    if (!item._CUSTOM_TAGS) {
      item._CUSTOM_TAGS = {};
    }
    // 将关联模型的字段数据平铺至行数据上，方便后续使用
    if (item.__FOREIGN__) {
      Object.assign(item, item.__FOREIGN__);
    }
    if (item._OPCT?._DICT) {
      Object.assign(item._DICT ??= {}, item._OPCT._DICT);
    }
  }

  /**
   * 清除行高缓存
   * @param item 行数据项
   */
  protected clearRowHeightCache(item: IVTableDataItem): void {
    item._MAX_ROW_HEIGHT = undefined;
  }

  /**
   * 动态计算字体样式
   * @param item 行数据项
   */
  protected async calcFontStyleByRule(item: IVTableDataItem): Promise<void> {
    const all: Promise<void>[] = [];
    const allFontStyle: IObject[] = [];
    const { field } = this.widget.props;
    const { columnFontStyleByRule } = this.widget.style;

    if (columnFontStyleByRule && columnFontStyleByRule.length > 0) {
      columnFontStyleByRule.forEach((rule) => {
        const { displayRule } = rule;
        if (displayRule) {
          const process = calc(displayRule, { [this.widget.preLocation!]: item })
            .then((result) => {
              if (result === true) {
                allFontStyle.push(rule);
              }
            })
            .catch((err) => {
              console.error('列字体样式计算出错：', err);
            });
          all.push(process);
        }
      });
    }

    await Promise.all(all);

    if (allFontStyle.length > 0) {
      const lastFontStyle = allFontStyle[allFontStyle.length - 1];
      item._STYLE![field].contentFont = lastFontStyle.contentFont;
      item._STYLE![field].tagStyleOpen = lastFontStyle.tagStyleOpen;
      item._STYLE![field].tagStyle = lastFontStyle.tagStyle;
    }
  }

  /**
   * 动态计算背景样式
   * @param item 行数据项
   */
  protected async calcBackgroundByRule(item: IVTableDataItem): Promise<void> {
    const all: Promise<void>[] = [];
    const allBackground: IObject[] = [];
    const { field } = this.widget.props;
    const { columnBackgroundByRule } = this.widget.style;

    if (columnBackgroundByRule && columnBackgroundByRule.length > 0) {
      columnBackgroundByRule.forEach((rule) => {
        const { displayRule } = rule;
        if (displayRule) {
          const process = calc(displayRule, { [this.widget.preLocation!]: item })
            .then((result) => {
              if (result === true) {
                allBackground.push(rule);
              }
            })
            .catch((err) => {
              console.error('列背景样式计算出错：', err);
            });
          all.push(process);
        }
      });
    }

    await Promise.all(all);

    if (allBackground.length > 0) {
      const lastBackground = allBackground[allBackground.length - 1];
      item._STYLE![field].backgroundColor = lastBackground.backgroundColor;
    }
  }

  /**
   * 动态计算列的禁用状态
   * @param item 行数据项
   */
  protected async calcDisabledByRule(item: IVTableDataItem): Promise<void> {
    if (!item._DISABLED) {
      item._DISABLED = {};
    }

    const { field, componentDependency } = this.widget.props;
    if (componentDependency?.configDependency?.disabled) {
      const { expression } = componentDependency.configDependency.disabled;
      if (expression) {
        try {
          const result = await calc(expression, { [this.widget.preLocation!]: item });
          if (result === true) {
            item._DISABLED![field] = true;
          } else if (item._DISABLED![field]) {
            delete item._DISABLED![field];
          }
        } catch (err) {
          console.error('列禁用状态计算出错：', err);
        }
      }
    }
  }

  /**
   * 动态计算列的只读状态
   * @param item 行数据项
   */
  protected async calcReadonlyByRule(item: IVTableDataItem): Promise<void> {
    if (!item._READONLY) {
      item._READONLY = {};
    }

    const { field, componentDependency } = this.widget.props;
    if (componentDependency?.configDependency?.readonly) {
      const { expression } = componentDependency.configDependency.readonly;
      if (expression) {
        try {
          const result = await calc(expression, { [this.widget.preLocation!]: item });
          if (result === true) {
            item._READONLY[field] = true;
          } else if (item._READONLY[field]) {
            delete item._READONLY[field];
          }
        } catch (err) {
          console.error('列只读状态计算出错：', err);
        }
      }
    }
  }

  /**
   * 动态计算多值字段标签显示内容
   * @param item 行数据项
   */
  protected async calcMultiFieldTags(item: IVTableDataItem): Promise<void> {
    const { field, multiFieldConfig } = this.widget.props;
    if (multiFieldConfig?.length > 0) {
      item._CUSTOM_TAGS![field] = [];
      const all = (multiFieldConfig as IObject[]).map(async (config) => {
        const { event, style } = config;
        if (event) {
          const { name, extraParams } = event;
          if (name && style) {
            const res = await this.obj?.event.runAsyncExportByName(name, {}, item, extraParams);
            return {
              text: res,
              type: style.labelType,
              color: style.color,
            } as ICustomTag;
          }
        }
      });
      const items = await Promise.all(all);
      item._CUSTOM_TAGS![field] = items.filter(item => item != null) as ICustomTag[];
    }
  }

  /**
   * 执行通用的样式和状态计算
   * @param item 行数据项
   */
  protected async executeCommonRuleCalculations(item: IVTableDataItem): Promise<void> {
    await Promise.all([
      this.calcFontStyleByRule(item),
      this.calcBackgroundByRule(item),
      this.calcDisabledByRule(item),
      this.calcReadonlyByRule(item),
      this.calcMultiFieldTags(item),
    ]);
  }
}
