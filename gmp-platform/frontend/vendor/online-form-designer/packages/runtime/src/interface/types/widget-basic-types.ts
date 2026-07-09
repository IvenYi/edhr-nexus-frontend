import { CSSProperties } from 'vue';
import { LowCodeModal } from './modal-types';
import { FieldMetaDTO } from './model';
import {
  EntityModelTypeEnum,
  EntityModelCategoryEnum,
  CreateType,
  FIELD_TYPE,
  MaterialEnum,
  UniqueConstraintType,
  SEARCH_SEVICE,
  CategoryTypeEnum,
  Platform,
  PropGroup,
  TextDecoration,
  FormComponents,
  DisplayType,
  SearchComponents,
  INNER_EVENT,
  DisplayEnums,
  EventCategory,
  StyleGroup,
  TagTypeEnum,
  BindCmpStyleTypeEnum,
  tableColumnWidthEnum,
  ProgressTypeEnum,
  tagEnum,
  VERIFICATIONCONDITIONS_TYPE,
  ASSIGNMENTSTRATEGY_ENUM,
  Dependency_ENUM,
  GLOBAL_VAR_TYPE,
} from '../../enums';
import { IVue3DndItemHooks } from '/@/projects/page-designer/src/designer/interface';
import { PagePlugin } from '/@/projects/page-designer/src/types/designer';

/** 单个组件节点描述 */
export namespace LowCodeWidget {
  export interface BasicSchema {
    /** 组件唯一标识 */
    id: string;
    /** 显示设备 */
    platform: Platform;
    /** 组件tag标识 */
    categoryType?: CategoryTypeEnum;
    /**别名 */
    alias: string;
    /** 组件名称 */
    name: string;
    /**自定义展示组件的名字 */
    compName?: string;
    /**自定义展示组件key的名字 */
    compKey?: string;
    /**组件类型 需和文件名一致 */
    type: FormComponents | string;
    /** icon, 配置组件库使用 */
    icon: string;
    /** 子集, 仅布局组件使用 */
    children?: Array<any>;
    /** 是否可显示, 配置组件库使用 */
    internal?: boolean;
    /** 描述 */
    description?: string;
    /** 样式 */
    style: Partial<BasicStyle>;
    /** 组件属性 */
    props: CommonProps & WidgetProps;
    /** 事件 */
    events: BasicEvents;
    /** 表单组件 */
    formItem?: boolean;
    /**布局 块级 行内 */
    display?: DisplayEnums;
    /** 菜单别名 */
    displayName?: string;
    /**i18n字段 */
    i18n?: Record<string, string>;
    /** 是否是字段类型 */
    isField?: boolean;
    /** 字段组件类型使用场景 */
    materialType?: MaterialEnum;
    /** 字段所属位置 */
    preLocation?: string;
    /**排除的样式属性 */
    ignoringStyle?: string[];
    /**是否是自读组件,自读则不会有hover和点击选中组件的行为 */
    isReadonlyWidget?: boolean;
    /**部分组件嵌套在某个父组件内部 */
    parentComponent?: FormComponents;
    /** 拖拽放置容器的无子项提示 */
    dropPlaceholder?: string;
    /**
     * 如果是插件过如，保存插件快照信息
     *
     * @type {PagePlugin}
     */
    _plugin?: PagePlugin;
  }

  export interface FieldSchema extends BasicSchema {
    props: FormItemProps & WidgetProps;
  }
  export interface IWrapperCmpConfigParams {
    /** 组件基础配置 */
    data: any;
    /** 是否是移动端 */
    isMobile: boolean;
    /** 平台 */
    platform: Platform;
    /** 调用方传入的其他状态 */
    otherState: Record<string, any>;
  }
  /**Font样式 */
  export interface FontStyle {
    fontSize: string;
    bold: boolean;
    italic: boolean;
    textDecoration: TextDecoration;
    color: string;
    align: 'left' | 'right' | 'center' | 'justify';
  }
  /**组件只读时开启标签配置的样式 */
  export interface TagConfigStyle {
    color?: string;
    tagType?: TagTypeEnum;
  }
  /**组件只读时开启进度条配置的样式 */
  export interface ProgressConfigStyle {
    color: string;
    tagType: ProgressTypeEnum;
  }
  export interface BorderStyle {
    borderWidth: string;
    borderStyle: string;
    borderColor: string;
  }

  /**样式Schema */
  export interface BasicStyle {
    position?: string;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    width?: string;
    height?: string;
    maxHeight?: string | number;
    backgroundColor?: string;
    marginAll?: string;
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
    paddingAll?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    labelFont: FontStyle;
    contentFont: FontStyle;
    tagStyle: TagConfigStyle;
    tagStyleOpen: boolean;
    borderAll: Partial<BorderStyle>;
    borderLeft: Partial<BorderStyle>;
    borderRight: Partial<BorderStyle>;
    borderBottom: Partial<BorderStyle>;
    borderTop: Partial<BorderStyle>;
    borderTopRightRadius?: string;
    borderTopLeftRadius?: string;
    borderBottomRightRadius?: string;
    borderBottomLeftRadius?: string;
    borderAllRadius?: string;

    /**表格列宽样式 */
    columnwidthConfigure?: tableColumnWidthEnum;
    /**表格列宽*/
    columnwidth?: number;
    columnFontStyleByRule?: columnFontStyleByRule[];
    columnBackgroundByRule?: columnBackgroundByRule[];
    tableheight?: number;
    /**表格高度样式 */
    tableheightConfigure?: tableColumnWidthEnum;
  }
  export interface columnFontStyleByRule {
    displayRule: string;
    contentFont: FontStyle;
    tagStyle: TagConfigStyle;
    progressStyle: ProgressConfigStyle;
    tagType: tagEnum;
    tagStyleOpen: boolean;
  }
  export interface columnBackgroundByRule {
    displayRule: string;
    backgroundColor?: string;
  }
  /**BasicSchema中的组件prop */
  export interface CommonProps {
    [key: string]: any;
  }

  /**所有组件的Prop基类 */
  export type WidgetProps = DisplayProps;
  /**表单组件Prop Schema */
  export interface FormItemProps extends WidgetProps {
    /** 字段key */
    field: string;
    /** 字段id */
    fieldId: string;
    // /** 字段类型 */
    fieldType?: FIELD_TYPE;
    /** 字段链路 */
    fieldCodeChain?: string;
    /** 是否是模型关联字段, 模型关联字段的字段key */
    bindFieldKey?: string;
    /** 是否是模型关联字段 */
    isFieldModel?: boolean;
    /** 自定义名称 */
    label: string;
    /** 显示标题 */
    displayLabelText?: boolean;
    /** 暗提示 */
    placeholder?: string;
    /** 默认值 */
    defaultValue?: any;
    /** 必填 */
    required?: boolean;
    /** 新建字段那边配置的必填 */
    fieldRequired?: boolean;
    /** 只读 */
    readonly?: boolean;
    /**字段只读 */
    fieldReadonly?: boolean;
    /** 禁用 */
    disabled?: boolean;
    /**可清空 */
    clearable?: boolean;
    /**获取焦点 */
    getFocus?: boolean;
    /** 显示说明开关 */
    showExplain?: boolean;
    /** 显示说明文案 */
    explain?: string;
    /** 正则校验开关 */
    regSwitch?: boolean;
    /**正则校验提示文案 */
    regHint?: string;
    /**设备互联 */
    deviceConnectivity?: boolean;
    /**正则校验内容 */
    reg?: string;
    /** 显隐配置-隐藏时提交开关 */
    notSubmitInHide?: boolean;
    /** 绑定组件样式选择类型 */
    bindCompStyleType?: string;
    /**所属表单的模型key */
    modelKey: string;
    /**关联字段所关联的模型 */
    bindModelKey?: string;
    /**内嵌搜索 */
    embeddedSearch?: boolean;
    /**自定义显示字段 */
    isCustomField?: boolean;
    maxlength?: number;
    minlength?: number;
    /**
     * 唯一类型
     */
    uniqueConstraintType?: UniqueConstraintType;
    /** 是否关闭校验 */
    closeValidator?: boolean;
    /**预置字段 不可删除 */
    _preset?: boolean;

    /** 关闭自动修复错误数字 */
    notAutoFix?: boolean;
    /** 最大值 */
    maxValue?: any;
    /** 最小值 */
    minValue?: any;
    /**关联引用下模型的字段的链路 */
    bindFieldLink?: string[];
    /**
     * 关联引用下模型依赖的字段
     */
    refOriginField?: string;
    /** 关联引用下模型依赖的初始字段的模型*/
    refOriginModelKey?: string;
    /** 关联引用下模型依赖的初始字段的字段类型*/
    refOriginFieldType?: FIELD_TYPE;
    /** 多字段展示开关 */
    multiFieldDisplay: boolean;
    /** 多字段展示配置项 */
    multiFieldConfig?: {
      event?: {
        type?: EventCategory.JS; // 事件类型：脚本逻辑
        /**JS方法名称 */
        name: string;
        /**event额外参数 */
        extraParams: { [key: string]: any } | string | number | boolean;
      };
      style: {
        labelType: string;
        color: string;
      };
    }[];
  }

  /**组件依赖 */
  export type Dependency = {
    [Dependency_ENUM.HIDDEN]: {
      expression?: string;
      value?: boolean;
    };
    /**只读 */
    [Dependency_ENUM.READONLY]: {
      expression?: string;
      value?: boolean;
      /**字段组件上的配置信息 */
      fieldValue?: boolean;
    };
    /**禁用 */
    [Dependency_ENUM.DISABLED]: {
      expression?: string;
      value?: boolean;
    };
    /**必填 */
    [Dependency_ENUM.REQUIRED]: {
      expression?: string;
      value?: boolean;
      /**字段组件上的配置信息 */
      fieldValue?: boolean;
    };
    [Dependency_ENUM.ASSIGNMENT]: {
      expression?: string;
      strategy?: ASSIGNMENTSTRATEGY_ENUM;
      value?: boolean;
    };
  };
  /**显隐的Props */
  export interface DisplayProps {
    /** 显隐配置-隐藏开关 */
    hidden: boolean;
    /** 显隐配置-显隐控制 */
    displayType?: DisplayType;
    /** 显隐配置-显隐控制内容 */
    displayRule?: string;
    /**模型信息 */
    modeldata?: {
      /**模型类型 基础/版本/树 等等 */
      modelType?: EntityModelTypeEnum;
      /**模型大类 */
      modelCategory?: EntityModelCategoryEnum;
      /**1表示子表 0表示主表 */
      subModel?: 0 | 1;
      /**1表示流程模型 */
      supportProcess?: 0 | 1;
    };
    /**组件依赖 */
    componentDependency: {
      /**组件依赖排序 */
      sortDependency: Dependency_ENUM[];
      /**组件依赖配置 */
      configDependency: Dependency;
    };
  }

  /**布局组件Prop Schema */
  export type LayoutProps = WidgetProps;
  /**基础Prop Schema */

  /**已选中配置的事件 Schema */
  export interface BasicEvents {
    /**event名 */
    [key: string]: JsEvent | InnerEvents[] | LoInterface;
    // __CLOSEMODAL__:{
    //  refId:string
    // }
  }
  export interface JsEvent {
    type?: EventCategory.JS; // 事件类型：脚本逻辑
    /**JS方法名称 */
    name: string;
    /**event额外参数 */
    extraParams: { [key: string]: any } | string | number | boolean;
  }
  export interface InnerEvents {
    name: INNER_EVENT;
    title: string;
    key: string;
    refId?: string;
    scopeId?: string;
    modalTitle?: string;
  }

  // 编排逻辑
  export interface LoInterface {
    type: EventCategory.LO; // 事件类型：编排逻辑
    /**JS方法名称 */
    name: string;
    /**event额外参数 */
    extraParams: { [key: string]: any } | string | number | boolean;
  }
  /**样式编辑器 */
  export interface StyleEditor {
    /**style组件 */
    component: string;
    /**style名称 */
    name?: string | { [key: string]: string };
    /**右侧显示的名称 */
    label?: string;
    /**style分组 */
    group: StyleGroup;
    /**style变时的callback */
    changeCallback?: Function;
    /**style是否隐藏逻辑 */
    hidden?: (arg: BasicSchema) => boolean;
    /**
     * editor内部的自定义config逻辑
     */
    _config?: Partial<StyleEditorConfig>;
  }

  export interface StyleEditorConfig {
    options:
      | Function
      | {
          label: string;
          value: string | boolean | number;
        }[];
    options2:
      | Function
      | {
          label: string;
          value: string | boolean | number;
        }[];
    maxlength: number;
    minlength: number;
    showType: 'switch' | 'checkbox';
    /**新增对象的生成器 */
    generator?: Function;
    columnWidthEnum?: tableColumnWidthEnum[];
    hiddenMarginOrPadding: 'margin' | 'padding';
    /**form-item显示的名称 */
    label?: string;
    hiddenColor?: boolean;
  }
  /**属性编辑器 */
  export interface PropEditor {
    /**prop组件 */
    component: string;
    /**prop名称 没有name的情况指的是:此editor改的不是组件的prop而是改的其他地方的数据*/
    /**root:开头就全链路修改widget */
    name?: string | { [key: string]: any };
    /**
     * 组件所归属的套件，非清单中的配置界面不显示
     *
     * @author zhanghanrui
     * @date 2024-05-31 09:05:49
     * @type {string[]}
     */
    kit?: string[];
    /**右侧显示的label名称 */
    label: string;
    /**prop是否必填 */
    required?: boolean;
    /**prop分组 */
    group: PropGroup | string;
    /**自定义校验 */
    validate?: Promise<any>;
    /**
     * editor内部的自定义config逻辑
     */
    _config?: Partial<PropEditorConfig>;
    /**prop变时的callback */
    changeCallback?: Function;
    /** 是否是纯表单字段配置（在 hidden 方法之后执行，如果为 false 直接隐藏）只针对于字段 */
    formField?: boolean;
    /**editor的是否隐藏逻辑 */
    hidden?: (arg: BasicSchema | LowCodeModal.Modal) => boolean;
    /**props依赖的字段，依赖的字段不存在会隐藏，变化了会刷新 */
    dependentProps?: string[];
    formItemStyle?: CSSProperties;
    formItemClass?: string;
    onMounted?: (widget: BasicSchema) => void;
    /**保存时候的钩子  可以用作校验返回false 表示不通过 */
    saveHook?: (widget: BasicSchema) => void;
  }

  /**editor属性 */
  export interface PropEditorConfig {
    width?: number;
    filterFields: FIELD_TYPE[];
    filterTypes: CreateType[];
    fieldToProp: FieldToProp[];
    options:
      | Function
      | {
          label?: string;
          icon?: string;
          value: string | boolean | number;
          suffix?: string;
          _config?: IObject;
        }[];
    options2:
      | Function
      | {
          label?: string;
          icon?: string;
          value: string | boolean | number;
          _config?: IObject;
        }[];
    /**自定义创建字段函数 */
    createField: Function;
    /**是否级联字段模式 */
    cascadeField?: boolean;
    updateAsyncField?: Function;
    maxlength?: Function | number;
    minlength?: Function | number;
    max?: Function | number;
    min?: Function | number;
    precision?: Function | number;
    i18n?: boolean;
    clearable?: boolean;
    /**后置标签 */
    addonAfter?: string;
    disabled?: Function | boolean;
    //标签提示
    tooltip?: string | string[];
    multiple?: boolean;
    /**多选最多选择的个数 */
    maxMultiple?: number;
    modelKey?: string;
    type?: string;
    eventCallback?: Function;
    filterFn?: (any) => Boolean;
    /** 是否展示字数 */
    showCount?: boolean;
    /** 需要显示的输入属性内容 */
    needFieldAttrs?: string[];
    /** 需要过滤的输入属性内容 */
    getFilterAttrs?: Function;
    /** 组件类型key */
    bindCmpStyleKey?: BindCmpStyleTypeEnum | Function;
    filterOptionsCallback?: Function;
    /** 日期、日期时间默认值 */
    initPickerType?: string;
    /**
     * 图标色
     */
    showColor?: boolean;
    /**默认色 */
    defaultColor?: string;
    /**
     * 图标背景色
     */
    showBackground?: boolean;
    /** 下拉框返回值类型 */
    valueType?: string;
    /**名称 */
    name?: string;
    /** 清除子组件 */
    clearChildren?: boolean;
    /** 支持搜索 */
    showSearch?: boolean;
    /** 过滤自身 */
    filterSelf?: boolean;
    /**根据props中哪个值来查询model字段 */
    modelByKey: string;
    /** 支持使用全局字段数据 */
    supportGlobData?: boolean;
    /**获取查询组件信息 */
    getSearchWidgets?: Function;
    /**显示复选框 */
    showcheckbox?: boolean;
    /**所属系统，web_module、mobile_module */
    module?: string;
    /** 选择字段按钮标题 */
    selectFiledBtnTitle?: string;
    /**查询子表或非子表 不传查询全部(1 子模型, 0 非子模型)*/
    subModel?: number;
    /** 模型种类:(entity/data/view) 多个类型逗号分隔*/
    category?: string;
    /**选择字段能否被拖拽 */
    draggable?: boolean;
    /**默认创建的按钮类型 */
    defaultButtonType?: object;
    /**组件辅助提示文本 */
    tips?: string;
    /** 是否显示切换单位 */
    filterUnitType?: 'px' | '%';
    placeholder?: string;
    /** 需要保留的字段 */
    containFieldType?: FIELD_TYPE[];
    /** 最要保留的字段key */
    containFieldKey?: string[] | ((w: BasicSchema) => string[]);
    /** 需要禁用的字段key */
    disabledFieldKey?: string[] | ((w: BasicSchema) => string[]);
    /** 需要过滤的字段 */
    excludeFieldType?: FIELD_TYPE[];
    /** 最要过滤的字段key */
    excludeFieldKey?: string[] | ((w: BasicSchema) => string[]);
    /** 默认展开所有节点 */
    defaultExpandAll?: boolean;
    /** 显示checkbox */
    treeCheckable?: boolean;
    /**tag显示的内容 */
    tagName?: string;
    /**是否显示tag */
    showTagFunc?: boolean | Function;
    /** 是否一行显示 */
    isInRow?: boolean;
    /** 一行显示时是否居右显示 */
    isRight?: boolean;
    /** 获取modelkey */
    getModelKey?: Function;
    /** label行中右侧按钮 */
    labelButton?: Object;
    /**label 水平布局时，左侧的label名称 */
    label?: string;
    /** linkage-editor 是否是tree  */
    isTreeSelect?: boolean | ((IData) => boolean);
    /**插槽 */
    slots?: Object;
    /** 关联表单的模型key */
    bindModelKey?: string;
    /**头部按钮 */
    headerRightButton?: FormComponents[] | ((w: BasicSchema) => FormComponents[]);
    /**批量按钮 */
    headerLeftButton?: FormComponents[] | ((w: BasicSchema) => FormComponents[]);
    /**单行按钮 */
    columnsButton?: FormComponents[] | ((w: BasicSchema) => FormComponents[]);
    /**rdo单行按钮 */
    columnsRdoButton?: [
      { value: FormComponents[] | ((w: BasicSchema) => FormComponents[]) },
      { value: FormComponents[] | ((w: BasicSchema) => FormComponents[]) },
    ];
    /**模块类型 */
    moduleType?: string;
    formItemCheckbox?: {
      label: string;
      propsKey: string;
      hidden?: (arg: BasicSchema) => boolean;
    };
    defaultValue?: string;
  }
  export interface FieldToProp {
    /**模型建模中字段 */
    from: keyof FieldMetaDTO;
    /**组件PROP中的字段 */
    to: keyof FormItemProps | string;
    transform?: (any) => any;
  }
  /**组件自身拥有的事件 */
  export interface EventsType {
    /**事件KEY */
    name: string;
    /**事件名 */
    title: string;
    /**事件参数 */
    params: string[];
    /**event是否隐藏逻辑 */
    hidden?: (arg: Partial<BasicSchema> | Partial<LowCodeModal.Modal>) => boolean;
  }
  export type RunCallback = Function;
  export type beforeCreate = Function;
  // 新版本拖拽设计钩子，2024年11月4日15:56:37
  export type hooks<O = unknown> = IVue3DndItemHooks<O>;
  export type loopCallback = (widget: any, Fn: Function) => void;
  /**设计页面配置信息 */
  export type DesignerConfig = {
    basicProps?: {
      /**隐藏key */
      key_hidden?: boolean;
      /**自定义key label */
      key_label?: string;
      /**隐藏别名 */
      alias_hidden?: boolean;
      /**自定义别名label */
      alias_label?: string;
    };
    /**隐藏遮罩 */
    hideMask?: boolean | ((widget: any) => boolean);
  };
  export interface SearchSchema extends fieldWidgetSchema {
    /** 组件名称 */
    name: string;
    /**组件类型 需和文件名一致 */
    type: SearchComponents;
    alias: string;
    isSearchField: boolean;
    materialType: MaterialEnum;
    props: fieldWidgetSchema['props'] & {
      defaultValue: any;
      placeholder: string;
      ope: SEARCH_SEVICE[];
      /**是否区间搜索 */
      isRang?: boolean;
      /**是否启用了其他选项 */
      useMore?: SEARCH_SEVICE | '';
      bindModelKey?: string;
      modelKey?: string;
      readonly: boolean;
      disabled: boolean;
      /**是否是关联字段的关联字段 */
      isFieldModel: boolean;
      /**关联字段下的字段链路配置信息 */
      fieldCodeChain: JSON;
      /**查询的key 规则$间隔 */
      fieldSearchKey?: string;
      /**字段key */
      fieldType?: FIELD_TYPE;
      /**字段名称 */
      fieldName?: string;
      /** 是否支持多选 */
      multiple?: boolean;
    };
    formItem: boolean;
  }

  export interface PageVars {
    id: string;
    key: string;
    varInfo: {
      key: string;
      type: GLOBAL_VAR_TYPE;
      defaultValue?: string;
      description: string;
    };
  }
}
export interface fieldWidgetSchema {
  /** 组件唯一标识 */
  id: string;
  /**i18n字段 */
  i18n: Record<string, string>;
  props: {
    /**字段key */
    field: string;
    /**字段id */
    fieldId: string;
    /**字段类型 */
    fieldType?: FIELD_TYPE;
    /**字段名称 */
    label: string;
  };
}

export interface validateRule {
  ruleName: string;
  field: string;
  ruleType: VERIFICATIONCONDITIONS_TYPE.JS;
  trigger?: 'change' | 'bulr';
  message?: string;
  jsName?: string;
  extParams?: { [key: string]: any };
}
