import {
  tableColumnWidthEnum,
  controlConfigEnum,
  statisticalMethodEnum,
  fixedAlignENUM,
  tableColumnTypeEnum,
  ButtonColorType,
  ButtonColorTheme,
  SUB_TABLE_OPE_EVENT_TYPE,
  SUB_TABLE_EDIT_MODE,
} from '/@page-designer/enum';
import { FIELD_TYPE } from '/@/enums/appEnum';

// export interface columnCommon {
//   //字段标识
//   id: string;
//   //字段显示类型
//   type: tableColumnTypeEnum | '';
//   // 国际化信息
//   i18n: object;
//   props: commonProps;
//   name: string;
//   internal: boolean;
// }
// export interface commonProps {
//   /**字段key */
//   field: string;
//   /**字段id */
//   fieldId: string;
//   /**字段类型 */
//   fieldType: FIELD_TYPE | '';
//   label: string;
//   /**表头说明 */
//   explain: string;
//   /**列宽配置 */
//   widthConfigure: tableColumnWidthEnum;
//   width?: number;
//   /**空值替换 */
//   controlReplacement: boolean;
//   /**空值定义 */
//   control: controlConfigEnum[];
//   /**替换后的值 */
//   controlReplaceValue: string;
//   statistical: boolean;
//   statisticalMethod: statisticalMethodEnum;
//   /**自定义有排序 */
//   sort: boolean;
//   fixedAlign: fixedAlignENUM;
//   /**内容过长隐藏 */
//   ellipsis: boolean;
//   bindModelKey?: string;
// }
// export interface operateCommon {
//   //字段标识
//   id: string;
//   // 国际化信息
//   i18n: object;
//   type: string;
//   props: operateProps;
//   name: string;
//   /**别名 */
//   alias: string;
//   internal: boolean;
// }
// export interface operateProps {
//   model: string;
//   label: string;
//   /**可见按钮数量 */
//   visibleButtons: number;
//   fixedAlign: fixedAlignENUM;
//   btnOptions: OperateButton[];
// }
// export interface OperateButton {
//   //字段标识
//   id: string;
//   // 国际化信息
//   i18n: object;
//   type: string;
//   props: {
//     buttonTheme: ButtonColorTheme;
//     buttonType: ButtonColorType;
//     icon: string;
//     label: string;
//     /**二次确认 */
//     confirm: boolean;
//     confirmText: string;
//     /**显示条件 */
//     displayRule: string;
//     /**内置事件 */
//     innerEvent: boolean;
//     /**系统事件类型 */
//     sysMethedType?: operateSysEnums;
//     linkPage: string;
//     /**事件名称 */
//     eventName: string;
//   };
// }

export interface SubTableOpe {
  //字段标识
  id: string;
  // 国际化信息
  i18n: object;
  type: string;
  name: string;
  internal: boolean;
  props: SubTableOpeProps;
}

export interface SubTableOpeProps {
  /**子表中选中的字段关联的bindModelKey */
  bindModelKey: string;
  width: number;
  label: string;
  /**可见按钮数量 */
  visibleButtons: number;
  fixed: boolean;
  fixedAlign: fixedAlignENUM;
  btnOptions: SubTableOpeButtonProps[];
  editMode: SUB_TABLE_EDIT_MODE;
}

export interface SubTableOpeButtonProps {
  //字段标识
  id: string;
  // 国际化信息
  i18n: object;
  type: string;
  props: {
    buttonTheme: ButtonColorTheme;
    buttonType: ButtonColorType;
    icon: string;
    label: string;
    /**二次确认 */
    confirm: boolean;
    confirmText: string;
    /**显示条件 */
    displayRule: string;
    /**事件类型 */
    eventType: SUB_TABLE_OPE_EVENT_TYPE;
    /**事件名称 */
    eventName: string;
  };
}
