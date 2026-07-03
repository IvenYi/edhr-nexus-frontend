import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';

export enum E_OPERATION_TYPE {
  START = 'start',
  COMPLETE = 'complete',
}

export enum E_BUSINESS_TYPE {
  /** 生产作业 */
  PRODUCTION = 'production',
  /** 返工作业 */
  REWORK = 'rework',
}

export interface AssetGenImageProps extends LowCodeWidget.WidgetProps {
  title: string;
  /** 上传图片路径*/
  imgUrl: string;
  /** 提示文字*/
  prompt: string;
  /** 辅助介绍*/
  auxiliary: string;
  /** 宽度自适应*/
  autoWidth: boolean;
  /** 图片尺寸*/
  width: number;
  height: number;
  maxHeight: number;
  /**宽高比 */
  whRadio?: number;
}
export interface IAssetGenImage extends LowCodeWidget.BasicSchema {
  props: AssetGenImageProps;
}

export default class AssetGenImage implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./asset-gen-image-designer.vue'));

  kit: string[] = ['eDHR'];
  schema: IAssetGenImage = {
    id: '',
    platform: Platform.WEB,
    name: '静态图片',
    alias: '',
    type: KitType.ASSET_GEN_IMAGE,
    icon: 'icon-tupian_wudaima',
    props: {
      title: '${sys.pageDesigner.genImage}',
      imgUrl: '',
      prompt: '',
      auxiliary: '',
      autoWidth: true,
      width: 60,
      height: 60,
      maxHeight: 60,
      ...displayProps,
    },
    style: {},
    events: {},
    i18n: {},
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'texteare-editor',
      name: 'prompt',
      label: 'sys.pageDesigner.prompt',
      group: PropGroup.GENIMAGE,
      _config: {
        i18n: true,
        maxlength: 120,
        showCount: true,
      },
    },
    {
      component: 'texteare-editor',
      name: 'auxiliary',
      label: 'sys.pageDesigner.auxiliary',
      group: PropGroup.GENIMAGE,
      _config: {
        i18n: true,
        maxlength: 120,
        showCount: true,
      },
    },
    {
      component: 'checkbox-editor',
      name: 'autoWidth',
      label: 'sys.pageDesigner.imageSize',
      group: PropGroup.GENIMAGE,
      _config: {
        isInRow: true,
        isRight: true,
      },
    },
    {
      component: 'number-editor',
      name: 'width',
      label: 'sys.width',
      group: PropGroup.GENIMAGE,
      hidden(widget) {
        return widget.props.autoWidth;
      },
      _config: {
        addonAfter: 'px',
        min: 1,
        max: 1920,
        isInRow: true,
      },
    },
    {
      component: 'number-editor',
      name: 'height',
      label: 'sys.height',
      group: PropGroup.GENIMAGE,
      hidden(widget) {
        return widget.props.autoWidth;
      },
      _config: {
        addonAfter: 'px',
        min: 1,
        max: 1024,
        isInRow: true,
      },
    },
    {
      component: 'number-editor',
      name: 'maxHeight',
      label: 'sys.pageDesigner.maximumHeight',
      group: PropGroup.GENIMAGE,
      hidden(widget) {
        return !widget.props.autoWidth;
      },
      _config: {
        addonAfter: 'px',
        min: 1,
        max: 1024,
        isInRow: true,
      },
    },
    ...displayEditor,
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'color-editor',
      name: 'backgroundColor',
      label: 'sys.pageDesigner.backgroundColor',
      group: StyleGroup.BACKGROUND,
    },
    {
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
    },
  ];
}
