import { Platform, PropGroup, FormComponents, StyleGroup } from '/@page-designer/enum';
import { Grid } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import ColModal from '/@page-designer/components/widgets/web/layout/grid/component/col-modal.vue';
import { IModalData } from '@gct/runtime';
import { buildShortUUID } from '/@/utils/uuid';
import { cloneDeep, merge } from 'lodash-es';
import { widget as gridCol } from '/@page-designer/schema/web/layout/grid-col';

// import { widget as gridCol } from './grid-col';
// import { cloneDeep } from 'lodash-es';
// import { buildShortUUID } from '/@/utils/uuid';
// import { useI18n } from '/@/hooks/web/useI18n';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: Grid = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.grid',
  alias: '',
  type: FormComponents.Grid,
  icon: 'icon-grid',
  children: [],
  props: {
    /**横轴对对齐方式*/
    justify: '',
    /**纵轴对对齐方式*/
    align: '',
    /**间距 */
    gutter: 8,
    /**子栅格 */
    colSpan: [],
    ...displayProps,
  },
  style: {
    backgroundColor: '#FFFFFF',
  },
  events: {},
  formItem: false,
  ignoringStyle: ['height'],
};
export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'col-span-editor',
    name: 'colSpan',
    label: 'sys.pageDesigner.gridCol',
    group: PropGroup.GRID_CONFIG,
  },
  {
    component: 'number-editor',
    name: 'gutter',
    label: 'sys.pageDesigner.gridChildGutter',
    group: PropGroup.GRID_CONFIG,
    _config: {
      addonAfter: 'px',
      min: 0,
      max: 100,
    },
  },
  ...displayEditor,
];

export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'position-editor',
    name: 'position',
    label: 'sys.pageDesigner.position',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'number-editor',
    name: 'width',
    label: 'sys.width',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'number-editor',
    name: 'height',
    label: 'sys.height',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'color-editor',
    name: 'backgroundColor',
    label: 'sys.pageDesigner.backgroundColor',
    group: StyleGroup.BACKGROUND,
  },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
    _config: {
      hiddenMarginOrPadding: 'padding',
    },
  },
  {
    component: 'border-radius-editor',
    group: StyleGroup.BORDER,
  },
  {
    component: 'border-editor',
    group: StyleGroup.BORDER,
  },
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };

export const beforeCreate: LowCodeWidget.beforeCreate = (_node: Grid) => {
  // const { t } = useI18n();
  // for (let index = 0; index < 2; index++) {
  //   const id = buildShortUUID(FormComponents.GridCol);
  //   node.children.push({
  //     ...cloneDeep(gridCol),
  //     id,
  //     alias: t(gridCol.name) + id,
  //   });
  // }
};

export const hooks: LowCodeWidget.hooks<LowCodeWidget.BasicSchema> = {
  async drop(c, mode, _parentWidgets, items, item) {
    if (mode !== 'create') {
      return item;
    }
    const result = await gct.openUtil.modal<IModalData>(
      ColModal,
      {},
      {
        title: window.$t('sys.pageDesigner.selectGridStyle'),
        width: 640,
        // height: 702,
        okText: window.$t('sys.okText'),
        showFooter: true,
      },
    );
    if (result.ok && item) {
      item.props.colSpan = (result.data || [])[0].spanArr;
      (result.data || [])[0].spanArr.forEach((e) => {
        const id = buildShortUUID('grid-col');
        if (!item.children) {
          item.children = [];
        }
        item.children.push(
          merge(cloneDeep(gridCol), {
            id,
            alias: window.$t('sys.pageDesigner.gridchild'),
            props: { span: e },
          }),
        );
      });
      return item;
    }
    return null;
  },
};
