import { CellType } from '@gct/nocode-base';
import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';
import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
import type {
  IParamToField,
  IParameterMapping,
  ICustomDataSource,
  ITable,
  IFixedTable,
  ICheckTableDataSource,
} from '/@online-form/views/designer/types';
import type { IBindField } from '@gct/nocode-base';

interface BaseTag {
  tag: string;
  attrs?: Record<string, string | number | undefined>;
  value?: string | number;
}

// 单元格配置信息 不包含样式边框
export interface TdTagConfig {
  value?: string;
  valueType: CellType; // Default Field Widget
  fieldMeta?: IBindField;
  fieldWidget?: CellWidget.BasicSchema;
  paperWidget?: PaperWidget.BasicSchema;
  children?: Array<Table | Image | Cell>;
  multiFields?: boolean;
  multiFieldsContent?: Array<{
    id: string;
    valueType: CellType.Field;
    fieldMeta?: IBindField;
    fieldWidget?: CellWidget.BasicSchema;
  }>;
}

export namespace SpreadSheetTag {
  export interface Table extends BaseTag {
    tag: 'table';
    children: Array<ColGroup | Tbody>;
    field: string;
    isFixedTable?: boolean; // 是否固定表
  }

  export interface ColGroup extends BaseTag {
    tag: 'colgroup';
    children: Col[];
  }

  export interface Col extends BaseTag {
    tag: 'col';
  }

  export interface Tbody extends BaseTag {
    tag: 'tbody';
    children: Tr[];
  }

  export interface Tr extends BaseTag {
    tag: 'tr';
    type?: 'thead' | 'tfoot' | 'dynamicTr';
    split?: boolean; // 行分割
    children: Td[];
  }

  export interface Td extends BaseTag, TdTagConfig {
    tag: 'td';
    dataGroupIndex?: number; // 固定表中数据分组索引
    cellHidden?: boolean;
    cbb?: boolean; // 单元格是否有下边框
    cbt?: boolean;
    cbr?: boolean;
    cbl?: boolean;
    bold?: boolean; // 边框加粗

    // td配置 和 configRefId 取其一
    cellConfigRefId?: string; // 配置引用id
    autoMerge?: boolean;
    xAutoMerge?: boolean;
    fillDirection?: 'x' | 'y';
  }

  export interface Cell extends BaseTag {
    tag: 'cell';
  }

  export interface Paper extends BaseTag {
    tag: 'paper';
    type: 'A3' | 'A4' | 'A5' | 'CUSTOM';
    size?: [number, number]; // 自定义大小
    padding: string;
    orientation: 'portrait' | 'landscape';
    children: Array<Table | Image>;
    headerWidgets: PaperWidget.BasicSchema[]; // 页眉组件
    footerWidgets: PaperWidget.BasicSchema[]; // 页脚组件
    /**
     * 浮动图片
     */
    images: Array<{
      attrs?: Record<string, string | number | undefined>;
      value?: string | number;
    }>;

    paramToField: IParamToField[];
    subTableFieldMap?: string[];
    masterField2SubTable?: any;
    masterField2CheckTable?: any;
    /** 物料消耗表信息 */
    masterField2MaterialConsumeTable?: any;
    /** 物料平衡表信息 */
    masterField2MaterialBalanceTable?: any;
    /** 数据初始化-参数映射 */
    parameterMapping?: Array<IParameterMapping>;
    /** 数据初始化-数据源 */
    customDataSource?: Array<ICustomDataSource>;
    checkTableDataSource?: Array<ICheckTableDataSource>;

    /**
     * 单元格的配置映射 用于固定表cell配置复用
     */
    cellConfigMap?: Record<string, TdTagConfig>;

    /**
     * 运行时 js
     */
    javascript?: string;
  }
}
