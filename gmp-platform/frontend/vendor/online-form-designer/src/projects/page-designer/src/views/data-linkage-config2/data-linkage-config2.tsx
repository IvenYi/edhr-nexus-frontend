/* eslint-disable vue/no-setup-props-destructure */
import { computed, defineComponent, PropType, ref } from 'vue';
import { IModal, useModal, useNamespace } from '@gct/runtime';
import { useI18n } from 'vue-i18n';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { uuid } from '@jsplumb/browser-ui';
import {
  IRelationshipDiagramNode,
  IRelationshipDiagramOptions,
  IRuleConfig,
} from '/@/components/relationship-diagram-config';
import { cloneDeep } from 'lodash-es';
import './data-linkage-config2.scss';

export const DataLinkageConfig2 = defineComponent({
  name: 'DataLinkageConfig2',
  props: {
    contentTitle: {
      type: String,
      default: 'sys.pageDesigner.dataLinkage.linksTitle',
    },
    deleteMessage: {
      type: String,
      default: 'sys.pageDesigner.dataLinkage.confirm.title',
    },
    context: {
      type: Object as PropType<IData>,
      default: () => {
        return {};
      },
    },
    // 当前选中字段的名称
    label: {
      type: String,
    },
    ruleConfig: {
      type: Object as PropType<IRuleConfig>,
      default: () => {
        return { designJson: {}, nodes: [] };
      },
    },
    modal: {
      type: Object as PropType<IModal>,
    },
    // 当前表单属性
    fields: {
      type: Array as PropType<any[]>,
      required: true,
      default: () => [],
    },
    config: {
      type: Object as PropType<IRelationshipDiagramOptions>,
    },
  },
  setup(props) {
    const { t } = useI18n() as any;
    const ns = useNamespace('data-linkage-config');

    // 支持选择的属性类型清单
    const types = [
      FIELD_TYPE.REF,
      FIELD_TYPE.REF_MULTI,
      FIELD_TYPE.RDO_REF,
      FIELD_TYPE.MASTERSLAVE,
    ];

    const select = ref<string | null>(props.ruleConfig.fieldKey || null);

    // 是否强依赖
    const strongDependence = ref<boolean>(props.ruleConfig.strongDependence ?? true);

    if (props.modal) {
      useModal(async () => {
        const config = calcRuleConfig();
        return {
          ok: true,
          data: [config],
        };
      });
    }

    const list = ref<IRelationshipDiagramNode[]>(props.ruleConfig.designJson.nodes || []);

    const options = computed(() => {
      return props.fields
        .filter((field) => {
          const data = field.props;
          if (types.includes(data.fieldType) && data.bindModelKey !== data.modelKey) {
            return true;
          }
          return false;
        })
        .map((field) => {
          const { props } = field;
          return {
            type: 'default',
            id: field.id!,
            value: props.field!,
            label: props.fieldName! || props.label,
            modelKey: props.modelKey,
            modelData: props.modeldata,
            bindModelKey: props.bindModelKey,
          };
        });
    });

    // 跟模型 key
    const modelKey = props.context.bindModelKey!;

    // 切换节点缓存
    const cache: Map<string, IRelationshipDiagramNode[]> = new Map();

    const onSelect = (val, data) => {
      if (select.value) {
        cache.set(select.value, cloneDeep(list.value));
      }
      if (val && select.value != val) {
        if (cache.has(val)) {
          list.value = cloneDeep(cache.get(val)!);
        } else {
          list.value = [
            {
              id: uuid(),
              type: 'default',
              modelKey: data.bindModelKey,
              modelCategory: null,
              value: null,
              label: null,
              id_: null,
            },
          ];
        }
      } else {
        list.value = [];
      }
      select.value = val;
    };

    const calcRuleConfig = (): IRuleConfig => {
      const opt = options.value.find((_) => {
        return _.value === select.value;
      });
      const items = list.value.filter((_) => {
        return _.modelKey;
      });
      return {
        designJson: {
          nodes: cloneDeep(list.value),
        },
        modelKey,
        fieldId: opt?.id,
        fieldKey: select.value!,
        fieldLabel: opt?.label,
        strongDependence: strongDependence.value,
        nodes: items.map((_, i) => {
          const nextNode = items[i + 1];
          return {
            id_: _.id_,
            modelKey: _.modelKey!,
            modelCategory: _.modelCategory!,
            fieldKey: _.value!,
            direction:
              nextNode?.reverse === true && _.reverse !== true
                ? ''
                : _.reverse
                ? 'backward'
                : 'forward',
          };
        }),
      };
    };

    return {
      t,
      ns,
      strongDependence,
      select,
      options,
      modelKey,
      list,
      onSelect,
    };
  },
  render() {
    return (
      <view-container class={this.ns.b()}>
        <div class={this.ns.b('model-info')}>
          <span>{this.t('sys.pageDesigner.dataLinkage.descBefore')}</span>
          <span>
            <a-select
              value={this.select}
              placeholder={this.t('sys.pageDesigner.dataLinkage.rootSelectPlaceholder')}
              class={this.ns.be('model-info', 'select')}
              options={this.options}
              allowClear
              onChange={(val, data) => this.onSelect(val, data)}
            />
          </span>
          <span>{this.t('sys.pageDesigner.dataLinkage.descAfter', { label: this.label })}</span>
        </div>
        {this.select ? (
          <div class={[this.ns.b('model-links')]}>
            <div class={this.ns.be('model-links', 'title')}>{this.t(this.contentTitle)}</div>
            <div class={this.ns.be('model-links', 'content')}>
              <relationship-diagram-config
                v-model:items={this.list}
                context={this.context}
                config={this.config}
              />
            </div>
            <div class={this.ns.be('model-links', 'bottom')}>
              <div class={this.ns.bem('model-links', 'bottom', 'check')}>
                <a-checkbox v-model:checked={this.strongDependence}>
                  {this.t('sys.pageDesigner.dataLinkage.strongDependenceLinkage')}
                </a-checkbox>
              </div>
              <div class={this.ns.bem('model-links', 'bottom', 'info')}>
                {this.t('sys.pageDesigner.dataLinkage.descBottom', {
                  label: this.options.find((_) => _.value === this.select)?.label,
                  label2: this.label,
                })}
              </div>
            </div>
          </div>
        ) : null}
      </view-container>
    );
  },
});
