import { defineComponent, PropType, ref, watch } from 'vue';
import { useNamespace } from '@gct/runtime';
import { IRelationshipDiagramNode } from '../../interface';
import { useI18n } from 'vue-i18n';
import { clone } from 'lodash-es';
import { useRootController } from '../../hooks';
import { ModelMetaDTO } from '/@/apis/gct-apaas/model';
import { LinkType, NodeType } from '../../constant';
import './diagram-config-item-reverse.scss';

/**
 * 节点容器
 */
export const DiagramConfigItemReverse = defineComponent({
  name: 'DiagramConfigItemReverse',
  props: {
    i: {
      type: Number,
      required: true,
    },
    data: {
      type: Object as PropType<IRelationshipDiagramNode>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n() as any;
    const ns = useNamespace('diagram-config-item-reverse');

    const c = useRootController();

    const models = ref<ModelMetaDTO[]>([]);

    const modelSelect = ref<string | null>(props.data.modelKey || null);

    const select = ref<string | null>(props.data.value || null);

    const modelOptions = ref<IData[]>([]);

    const options = ref<IData[]>([]);

    watch(props.data, () => {
      modelSelect.value = props.data.modelKey || null;
      select.value = props.data.value || null;
      redrawConnect();
    });

    const onModelChange = (value, _) => {
      options.value = [];
      modelSelect.value = value;
      select.value = null;
      // 选择模型后更新自身数据
      const cloneData = clone(props.data);
      // 先备份历史数据，并删除后续节点
      c.node.cache.reverseClear(cloneData);
      c.node.update(
        Object.assign(cloneData, {
          modelKey: value ?? null,
          modelCategory: _ ? _.data.modelCategory ?? 'entity' : 'entity',
          value: null,
          label: null,
        }),
      );
      if (value) {
        c.node.cache.reverseReset(cloneData);
      }
      options.value = [];
      fillFieldsOptions(_);
      updateBeforeState();
      updateAfterState();
      redrawConnect();
    };

    const fillFieldsOptions = (_) => {
      if (_) {
        const data = _.data as ModelMetaDTO;
        if (data.fieldMetaList) {
          options.value = data.fieldMetaList.map((item) => {
            return {
              label: item.name,
              value: item.key,
              data: item,
            };
          });
        }
      }
    };

    const onChange = (value, _) => {
      select.value = value;
      // 选择模型后更新自身数据
      const cloneData = clone(props.data);
      // 更新之前先备份历史数据，并删除后续节点
      if (cloneData.value) {
        c.node.cache.clear(cloneData);
      }
      // 选中值操作
      if (value) {
        c.node.update(
          Object.assign(cloneData, {
            value,
            label: _.label,
          }),
        );
      } else {
        // 清空值操作
        c.node.update(
          Object.assign(cloneData, {
            value: null,
            label: null,
          }),
        );
      }
      if (value) {
        // 恢复一下缓存
        c.node.cache.reset(cloneData);
      }
      updateBeforeState();
      updateAfterState();
      redrawConnect();
    };

    /**
     * 更新后一个节点的状态
     *
     * @author zhanghanrui
     * @date 2024-06-28 15:06:19
     */
    const updateAfterState = async () => {
      if (select.value) {
        const link = c.link.getByTarget(props.data.id);
        if (link) {
          // 已经有连线，证明后续节点已经通过缓存恢复不用再处理
          return;
        }
        const items = await c.getModelList(modelSelect.value!, select.value);
        if (items && items.length > 0) {
          // 建立新的后续节点
          c.node.create(
            {
              type: NodeType.REVERSE,
              reverse: true,
            },
            {
              type: LinkType.VIRTUAL,
              reverse: true,
              dashed: true,
            },
          );
        }
      }
    };

    /**
     * 更新前一个节点的状态
     *
     * @author zhanghanrui
     * @date 2024-06-28 14:06:53
     */
    const updateBeforeState = () => {
      const link = c.link.getBySource(props.data.id);
      if (link) {
        const node = c.node.get(link.target, 0, true);
        if (node && node.type === NodeType.DEFAULT) {
          if (select.value) {
            c.node.update(
              Object.assign(node, {
                value: null,
                label: null,
                noSelectField: true,
              }),
            );
          } else {
            c.node.update(
              Object.assign(node, {
                value: null,
                label: null,
                noSelectField: false,
              }),
            );
          }
        }
      }
    };

    const redrawConnect = () => {
      const link = c.link.getBySource(props.data.id);
      if (link) {
        const l = clone(link);
        if (select.value) {
          l.type = LinkType.DEFAULT;
        } else {
          l.type = LinkType.VIRTUAL;
        }
        c.link.update(l);
        const node = c.node.get(link.target);
        if (node) {
          c.node.update({ ...node, noSelectField: true });
        }
      }
    };

    const onModelFocus = async () => {
      const link = c.link.getBySource(props.data.id);
      if (link) {
        const targetNode = c.node.get(link.target);
        if (targetNode) {
          models.value = await c.getModelList(targetNode.modelKey!, targetNode.value!);
          modelOptions.value = models.value.map((item) => {
            return { value: item.key, label: item.name, data: item };
          });
        }
      }
    };

    const load = async () => {
      if (props.data.modelKey) {
        await onModelFocus();
        const opt = modelOptions.value.find((item) => {
          return item.value === props.data.modelKey;
        });
        if (opt) {
          fillFieldsOptions(opt);
        }
      }
    };

    load();

    return {
      t,
      ns,
      modelSelect,
      select,
      modelOptions,
      options,
      onModelChange,
      onChange,
      onModelFocus,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={[this.ns.e('title'), this.ns.e('model-select')]}>
          <a-select
            size="small"
            allowClear
            placeholder={this.t('sys.pageDesigner.selectModel')}
            value={this.modelSelect}
            options={this.modelOptions}
            onChange={(val, o) => this.onModelChange(val, o)}
            onFocus={() => this.onModelFocus()}
          />
        </div>
        <div class={[this.ns.e('select')]}>
          <a-select
            class="handle-select"
            allowClear
            placeholder={this.t('sys.pageDesigner.dataLinkage.selectPlaceholder')}
            value={this.select}
            options={this.options}
            onChange={(val, o) => this.onChange(val, o)}
            disabled={!this.modelSelect}
          />
        </div>
      </div>
    );
  },
});

export default DiagramConfigItemReverse;
