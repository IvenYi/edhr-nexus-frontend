import { ListType, Option } from '../../../drawerSelector';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import { FIELD_TYPE } from '@/enums/appEnum';
import { Ref } from 'vue';

export interface FieldMapType {
  listType: ListType;
  getSource: Function;
  // 获取查询数据
  getSearchSource?: Function;
  title?: string;
  // 是否多选
  multiple?: boolean;
  // 是否显示搜索框
  searchable?: boolean;
  // 是否启用分页查询
  paged?: boolean;
  // 是否显示暂无数据
  showEmpty?: boolean;
  // 根据 ids 获取对应选项（启用分页时提供，用于回显数据）
  getOptionsByIds?: (_: FieldConfigType, ids: string[]) => Promise<Option[]>;
}

export interface FieldConfigType {
  modelKey: string;
  fieldKey: string;
  modelCategory: EntityModelCategoryEnum;
  fieldType: FIELD_TYPE;
  /**关联模型字段的关联模型 */
  refModelKey?: string;
  /**自定义数据源请求 */
  customApi?: Ref<Function>;
  /** 自定义枚举值 */
  customMenu?: Boolean;
  /** 自定义枚举值列表 */
  customMenuFilter?: string[];
  /** 自定义字段 */
  displayFields?: object[];
  // 是否是搜索组件
  isSearch?: Boolean;
}
export interface ReturnData {
  options: Option[];
  total?: number;
}
