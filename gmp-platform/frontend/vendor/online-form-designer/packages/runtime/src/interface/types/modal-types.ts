import { BuiltinType, Platform } from '../../enums';
import { LowCodeWidget } from './widget-basic-types';

export namespace LowCodeModal {
  export interface Modal {
    id: string;
    /**系统用的name */
    alias: string;
    name: string;
    /**默认是WEB 添加的时候会根据当前环境改变 */
    platform: Platform;
    /**用户新建编辑的name */
    modalName: string;
    /**自定义展示组件的名字 */
    compName?: string;
    /**自定义展示组件key的名字 */
    compKey?: string;
    type: BuiltinType.MODAL;
    js: string;
    css: string;
    children: [ModalBody, ModalFooter, ModalBottomButton];
    props: ModalProps;
    events: LowCodeWidget.BasicEvents;
    i18n?: Record<string, string>;
    /** 样式 */
    style: Partial<LowCodeWidget.BasicStyle>;
    /**运行时需要的Js Code */
    runJs?: string;
    los?: Record<string, IData>;
    icon: string;
    /** 是否是字段类型 */
    isField: boolean;
  }
  export interface ModalBody {
    id: string;
    type: BuiltinType.MODAL_BODY;
    children: LowCodeWidget.BasicSchema[];
  }
  export interface ModalFooter {
    id: string;
    type: BuiltinType.MODAL_FOOTER;
    children: LowCodeWidget.BasicSchema[];
  }

  export interface ModalBottomButton {
    id: string;
    type: BuiltinType.BottomButtonContainer;
    children: LowCodeWidget.BasicSchema[];
  }
  export interface ModalProps extends LowCodeWidget.CommonProps {
    modalTitle?: string;
    // modalWidth: number;
    /** web端弹框宽度单位 */
    unitType: 'px' | '%';
    /** web端弹框宽度 */
    modalWidth: number;
    /** mobile端弹框宽度单位 */
    mUnitType: '%';
    /** mobile端弹框宽度 */
    mModalWidth: number;
    /** 是否子表下的模态框 */
    isSubTableModal?: boolean;
    /** 关联子表 id */
    bindSubTableId?: string;
    /** 子表弹框新建标题名称 */
    createModalTitle?: string;
    /** 子表弹框编辑标题名称 */
    editModalTitle?: string;
  }
}
