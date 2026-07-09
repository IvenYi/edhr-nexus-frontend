import { computed, defineComponent, PropType } from 'vue';
import { FIELD_TYPE, useNamespace } from '@gct/runtime';
import { useI18n } from 'vue-i18n';
import { isEmpty } from 'lodash-es';
import './reference-relationship2-editor.scss';

export const ReferenceRelationship2Editor = defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'reference-relationship2-editor',
  props: {
    model: {
      type: String,
      required: true,
    },
    ruleConfig: {
      type: Object as PropType<IData>,
      default: () => ({}),
    },
    modalTitle: {
      type: String,
    },
    contentTitle: {
      type: String,
    },
    deleteMessage: {
      type: String,
    },
    endBeforeInfo: {
      type: String,
    },
    endPlaceholder: {
      type: String,
    },
    endFieldTypes: {
      type: Array<string>,
    },
  },
  emits: ['update:ruleConfig'],
  setup(props, { emit }) {
    const { t } = useI18n() as any;
    const ns = useNamespace('reference-relationship-editor');

    const val = computed({
      get() {
        return props.ruleConfig;
      },
      set(v) {
        emit('update:ruleConfig', v);
      },
    });

    const linkageItems = computed<any>({
      get() {
        if (!val.value || isEmpty(val.value)) {
          return [
            {
              id: null,
              label: null,
              modelCategory: '',
              modelKey: props.model,
              refModelCategory: '',
              refModelKey: props.model,
              value: null,
            },
          ];
        }
        return val.value.designJson.configs;
      },
      set(_val: any) {
        if (!val.value.designJson) {
          val.value.designJson = {};
        }
        Object.assign(val.value.designJson!, { configs: _val });
        if (val.value.designJson) {
          const { configs } = val.value.designJson;
          val.value.nodes = [];
          if (configs) {
            configs.forEach((item, i) => {
              if (i === 0) {
                return;
              }
              if (item.reverse) {
                val.value.nodes.push({
                  modelKey: item.refModelKey,
                });
                val.value.nodes.push({
                  modelKey: item.modelKey,
                  fieldKey: item.value,
                  direction: 'backward',
                });
              } else {
                val.value.nodes.push({
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
        return val.value?.designJson?.endData;
      },
      set(_val: any) {
        Object.assign(val.value.designJson, { endData: _val });
        if (val.value.designJson) {
          const { endData } = val.value.designJson;
          if (endData) {
            val.value.fieldKey = endData.value;
          } else {
            val.value.fieldKey = '';
          }
        }
      },
    });

    const onClick = async () => {
      const res = await gct.openUtil.modal(
        'DataLinkageConfig',
        {
          context: {
            bindModelKey: props.model,
            fieldModelKey: '',
          },
          items: linkageItems.value,
          endData: endData.value,
          mode: 'component',
          contentTitle: t(props.contentTitle ?? 'sys.pageDesigner.configReferenceRelationship'),
          deleteMessage: t(props.deleteMessage ?? 'sys.pageDesigner.deleteReferenceRelationship'),
          endFieldTypes: props.endFieldTypes ?? [
            FIELD_TYPE.LABEL_TEMPLATE_REF,
            FIELD_TYPE.DOCUMENT_TEMPLATE,
          ],
          showEndInfo: false,
          endBeforeInfo: t(props.endBeforeInfo ?? 'sys.pageDesigner.referencingFields'),
          endPlaceholder: t(props.endPlaceholder ?? 'sys.pageDesigner.pleaseSelectTemplateFields'),
        },
        {
          title: t(props.modalTitle ?? 'sys.pageDesigner.referenceRelationship'),
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
            val.value = val.value;
            return;
          }
        }
        val.value = {} as any;
      }
    };

    return { t, ns, val, onClick };
  },
  render() {
    const isEdit = this.val && !isEmpty(this.val);
    return (
      <div class={this.ns.b()}>
        <a-button {...this.$attrs} onClick={this.onClick} type={isEdit ? 'primary' : undefined}>
          {isEdit
            ? this.t('sys.pageDesigner.editReferenceRelationship')
            : this.t('sys.pageDesigner.configReferenceRelationship')}
        </a-button>
      </div>
    );
  },
});

export default ReferenceRelationship2Editor;
