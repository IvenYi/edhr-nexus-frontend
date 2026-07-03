import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
import { useI18n } from 'vue-i18n';
import { useDesigner } from '../../../../hooks/useDesigner';
import { Mapping } from '../../../../types/web';
import { FormComponents } from '../../../../enum';
import './data-linkage-editor.scss';

export const DataLinkageEditor = defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'data-linkage-editor',
  props,
  setup(props) {
    const { t } = useI18n() as any;
    const ns = useNamespace('data-linkage-editor');

    // eslint-disable-next-line vue/no-setup-props-destructure
    const { preLocation } = props.widget! as any;

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
        const deepChild =
          sourceWidget.type === 'form' ? expandRecursiveArray(children, 'children') : children;
        items = deepChild.filter((item) => {
          if (item.isField === true || item.isSearchField) {
            return true;
          }
          return false;
        });
      }
      const res = await gct.openUtil.modal(
        'DataLinkageConfig',
        {
          context: {
            bindModelKey: sourceWidget.props.model || sourceWidget.props.modelKey,
            fieldModelKey: props.widget!.props.bindModelKey,
          },
          items: propValue.value,
          fields: items.filter((field) => {
            if (props.widget && field.props.field === props.widget!.props.field) {
              return false;
            }
            return true;
          }),
          label: props.widget!.props.fieldName || props.widget!.props.label,
        },
        { title: t('sys.pageDesigner.dataLinkageProp'), width: 800, height: 520 },
      );
      if (res.ok) {
        if (res.data && res.data.length > 0) {
          propValue.value = res.data;
        } else {
          propValue.value = null;
        }
      }
    };

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

export default DataLinkageEditor;
