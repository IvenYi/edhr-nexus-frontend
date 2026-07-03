import { defineComponent, PropType, ref, watch } from 'vue';
import { FIELD_TYPE, ModelMetaDTO, useNamespace } from '@gct/runtime';
import { IRelationshipDiagramNode } from '../../interface';
import { useRootController } from '../../hooks';
import { clone } from 'lodash-es';
import { useI18n } from 'vue-i18n';
import './diagram-config-item.scss';

type OptionItem = {
  id: string;
  label: string;
  value: string;
  refModelKey: string;
};

/**
 * 节点容器
 */
export const DiagramConfigItem = defineComponent({
  name: 'DiagramConfigItem',
  props: {
    i: {
      type: Number,
      required: true,
    },
    isEnd: {
      type: Boolean,
      required: true,
    },
    data: {
      type: Object as PropType<IRelationshipDiagramNode>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n() as any;
    const ns = useNamespace('diagram-config-item');

    const select = ref<string | null>(props.data.value || null);

    watch(props.data, () => {
      select.value = props.data.value || null;
    });

    const types = [
      FIELD_TYPE.REF,
      FIELD_TYPE.REF_MULTI,
      FIELD_TYPE.RDO_REF,
      FIELD_TYPE.MASTERSLAVE,
    ];

    const c = useRootController();

    const model = ref<ModelMetaDTO>({});

    const options = ref<OptionItem[]>([]);

    const onChange = (val, data: OptionItem) => {
      const updateData = clone(props.data);
      // 更新之前先备份历史数据，并删除后续节点
      if (updateData.value) {
        c.node.cache.clear(updateData);
      }
      if (data) {
        // 更新当前节点数据
        Object.assign(updateData, {
          modelCategory: model.value.modelCategory ?? 'entity',
          value: val,
          label: data.label,
          id_: data.id,
        });
      } else {
        Object.assign(updateData, {
          modelCategory: null,
          value: null,
          label: null,
          id_: null,
        });
      }
      // 先更新数据
      c.node.update(updateData);
      if (val) {
        // 恢复一下缓存
        c.node.cache.reset(updateData);
      }
      // 查找连线
      const link = c.link.getBySource(props.data.id);
      // 恢复缓存后还没有连线则创建下一个节点
      if (!link && data) {
        // 新建下一个节点
        c.node.create({ modelKey: data.refModelKey });
      }
    };

    const load = async () => {
      model.value = await c.getModel(props.data.modelKey!);
      if (model.value.fieldMetaList) {
        model.value.fieldMetaList
          .filter((item) => types.includes(item.type as FIELD_TYPE))
          .forEach((item) => {
            options.value.push({
              id: item.id!,
              label: item.name!,
              value: item.key!,
              refModelKey: item.bindInfo!,
            });
          });
      }
    };

    load();

    return { t, ns, c, select, model, options, onChange };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('title')}>
          <span>{this.model.name}</span>
        </div>
        <div class={[this.ns.b('content')]}>
          {this.isEnd ? (
            <div class={this.ns.e('end')}>
              <div class={this.ns.em('end', 'line')}></div>
              <div class={this.ns.em('end', 'label')}>{this.t('sys.pageDesigner.end')}</div>
            </div>
          ) : this.data.noSelectField !== true ? (
            <a-select
              class={[this.ns.b('select'), this.ns.is('select', !!this.select), 'handle-select']}
              v-model:value={this.select}
              options={this.options}
              placeholder={this.t('sys.pageDesigner.dataLinkage.selectPlaceholder')}
              allowClear
              onChange={this.onChange}
            />
          ) : null}
        </div>
      </div>
    );
  },
});
