import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
import { useI18n } from 'vue-i18n';
import { useDesigner } from '../../../../hooks/useDesigner';
import { Mapping } from '../../../../types/web';
import { FormComponents } from '../../../../enum';
import { uuid } from '@jsplumb/browser-ui';
import { cloneDeep } from 'lodash-es';
import './data-linkage2-editor.scss';

export const DataLinkage2Editor = defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'data-linkage2-editor',
  props,
  setup(props) {
    const { t } = useI18n() as any;
    const ns = useNamespace('data-linkage-editor');

    // eslint-disable-next-line vue/no-setup-props-destructure
    const { preLocation } = props.widget! as any;

    const { linkageField } = props.widget!.props;

    const { allWidget } = useDesigner();

    const { propValue } = usePropEditor(props.propName, props.changeCallback);

    const sourceWidget = allWidget.value.find(
      (item) => item.id === preLocation,
    ) as Mapping[FormComponents.Form];

    // 展开递归数组
    const expandRecursiveArray = (arr: IData[], key: string): IData[] => {
      const items: IData[] = [];
      arr.forEach((item) => {
        items.push(item);
        if (item[key]) {
          items.push(...expandRecursiveArray(item[key], key));
        }
      });
      return items;
    };

    const onClick = async () => {
      let items: any[] = [];
      let children = sourceWidget.children;
      if (sourceWidget.type === 'sub-table') {
        children = sourceWidget.children?.[3]?.children;
      } else if (
        sourceWidget.type === 'data-table' ||
        sourceWidget.type === 'tree-table' ||
        sourceWidget.type === 'ref-data-table'
      ) {
        children = sourceWidget.children?.[1]?.children;
      } else if (sourceWidget.type === 'card-list') {
        children = sourceWidget.children?.[2]?.children;
      }
      if (children && children.length) {
        const deepChild = ['medprordo-form', 'form'].includes(sourceWidget.type)
          ? expandRecursiveArray(children, 'children')
          : children;
        items = deepChild.filter((item) => {
          if (item.isField === true || item.isSearchField) {
            return true;
          }
          return false;
        });
      }
      const res = await gct.openUtil.modal(
        'DataLinkageConfig2',
        {
          context: {
            bindModelKey: props.widget!.props.modelKey,
            fieldModelKey: props.widget!.props.bindModelKey,
          },
          ruleConfig: propValue.value,
          fields: items.filter((field) => {
            if (props.widget && field.props.field === props.widget!.props.field) {
              return false;
            }
            return true;
          }),
          label: props.widget!.props.fieldName || props.widget!.props.label,
        },
        { title: t('sys.pageDesigner.dataLinkageProp'), width: 800, height: 542 },
      );
      if (res.ok) {
        if (res.data && res.data.length > 0) {
          const items = res.data[0].designJson.nodes;
          if (items.length > 0) {
            propValue.value = res.data[0];
            return;
          }
        }
        propValue.value = null;
      }
    };

    // 特殊处理逻辑，旧结构转新结构（2024年7月5日）
    if (!propValue.value && linkageField && linkageField.length > 0) {
      const items = cloneDeep(linkageField);
      const first = items.shift();
      const last = items[items.length - 1];
      propValue.value = {
        designJson: {
          nodes: items.map((_) => {
            return {
              id: uuid(),
              id_: _.id,
              type: 'default',
              modelKey: _.modelKey,
              modelCategory: _.modelCategory,
              value: _.value,
              label: _.label,
            };
          }),
        },
        modelKey: first.modelKey,
        fieldId: first.id_,
        fieldKey: first.value,
        fieldLabel: first.label,
        nodes: items.map((_) => {
          return {
            modelKey: _.modelKey,
            modelCategory: _.modelCategory,
            fieldKey: _.value,
            direction: 'forward',
          };
        }),
      };
      if (last && first !== last && last.refModelKey) {
        propValue.value.designJson.nodes.push({
          id: uuid(),
          type: 'default',
          modelKey: last.refModelKey,
          modelCategory: last.refModelCategory,
        });
        propValue.value.nodes.push({
          modelKey: last.refModelKey,
          modelCategory: last.refModelCategory,
          fieldKey: undefined,
          direction: 'forward',
        });
      }
    }

    return { ns, t, propValue, onClick };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <a-button size="small" onClick={this.onClick} type={this.propValue ? 'primary' : undefined}>
          {this.propValue
            ? this.t('sys.pageDesigner.editDataLinkage')
            : this.t('sys.pageDesigner.configDataLinkage')}
        </a-button>
      </div>
    );
  },
});

export default DataLinkage2Editor;
