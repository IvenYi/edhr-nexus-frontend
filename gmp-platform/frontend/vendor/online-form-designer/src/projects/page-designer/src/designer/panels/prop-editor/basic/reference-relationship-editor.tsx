import { computed, defineComponent, toRefs } from 'vue';
import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
import { FIELD_TYPE, useNamespace } from '@gct/runtime';
import { useI18n } from 'vue-i18n';
import { isEmpty } from 'lodash-es';
import './reference-relationship-editor.scss';

export const ReferenceRelationshipEditor = defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'reference-relationship-editor',
  props,
  setup(defProps) {
    const { t } = useI18n() as any;
    const ns = useNamespace('reference-relationship-editor');
    const {
      modalTitle,
      contentTitle,
      deleteMessage,
      endBeforeInfo,
      endPlaceholder,
      endFieldTypes,
      modelKey = 'refModel',
    } = defProps.propConfig;
    const refModel = computed(() => defProps.widget!.props[modelKey]);

    const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

    if (!propValue.value) {
      propValue.value = {};
    }

    const linkageItems = computed<any>({
      get() {
        if (!propValue.value || !propValue.value.designJson) {
          return [
            {
              id: null,
              label: null,
              modelCategory: '',
              modelKey: refModel.value,
              refModelCategory: '',
              refModelKey: refModel.value,
              value: null,
            },
          ];
        }
        return propValue.value.designJson.configs;
      },
      set(val: any) {
        if (!propValue.value || !propValue.value.designJson) {
          propValue.value = {
            designJson: {},
          };
        }
        Object.assign(propValue.value.designJson!, { configs: val });
        if (propValue.value.designJson) {
          const { configs } = propValue.value.designJson;
          propValue.value.nodes = [];
          if (configs) {
            configs.forEach((item, i) => {
              if (i === 0) {
                return;
              }
              if (item.reverse) {
                propValue.value.nodes.push({
                  modelKey: item.refModelKey,
                });
                propValue.value.nodes.push({
                  modelKey: item.modelKey,
                  fieldKey: item.value,
                  direction: 'backward',
                });
              } else {
                propValue.value.nodes.push({
                  modelKey: item.modelKey,
                  fieldKey: item.value,
                  direction: 'forward',
                });
              }
            });
          }
        }
      },
    });

    const endData = computed<any>({
      get() {
        return propValue.value.designJson?.endData;
      },
      set(val: any) {
        Object.assign(propValue.value.designJson, { endData: val });
        if (propValue.value.designJson) {
          const { endData } = propValue.value.designJson;
          if (endData) {
            propValue.value.fieldKey = endData.value;
          } else {
            propValue.value.fieldKey = '';
          }
        }
      },
    });

    const onClick = async () => {
      const res = await gct.openUtil.modal(
        'DataLinkageConfig',
        {
          context: {
            bindModelKey: refModel.value,
            fieldModelKey: '',
          },
          items: linkageItems.value,
          endData: endData.value,
          mode: 'component',
          contentTitle: t(contentTitle ?? 'sys.pageDesigner.configReferenceRelationship'),
          deleteMessage: t(deleteMessage ?? 'sys.pageDesigner.deleteReferenceRelationship'),
          endFieldTypes: endFieldTypes ?? [
            FIELD_TYPE.LABEL_TEMPLATE_REF,
            FIELD_TYPE.DOCUMENT_TEMPLATE,
          ],
          showEndInfo: false,
          endBeforeInfo: t(endBeforeInfo ?? 'sys.pageDesigner.referencingFields'),
          endPlaceholder: t(endPlaceholder ?? 'sys.pageDesigner.pleaseSelectTemplateFields'),
          max: 3,
        },
        {
          title: t(modalTitle ?? 'sys.pageDesigner.referenceRelationship'),
          width: 800,
          height: 520,
        },
      );
      if (res.ok) {
        if (res.data && res.data.length > 0) {
          const data = res.data[0];
          if (data) {
            linkageItems.value = data.items;
            endData.value = data.endData;
            return;
          }
        }
        linkageItems.value = [];
        endData.value = null;
        propValue.value = {};
      }
    };

    return { t, ns, propValue, onClick };
  },
  render() {
    const isEdit = this.propValue && !isEmpty(this.propValue);
    return (
      <div class={this.ns.b()}>
        <a-button size="small" onClick={this.onClick} type={isEdit ? 'primary' : undefined}>
          {isEdit
            ? this.t('sys.pageDesigner.editReferenceRelationship')
            : this.t('sys.pageDesigner.configReferenceRelationship')}
        </a-button>
      </div>
    );
  },
});

export default ReferenceRelationshipEditor;
