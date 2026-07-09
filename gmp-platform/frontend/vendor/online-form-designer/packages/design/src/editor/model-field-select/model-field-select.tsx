import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { useNamespace } from '@gct-paas/core';
import {
  FIELD_TYPE,
  FieldIconMap,
  FieldMetaDTO,
  IFieldCodeChain,
  IGctDndConfig,
  IGctDndData,
  IGctDndRenderItemOptions,
  IModelFieldSelectEditor,
  modelLoader,
  PlatformType,
} from '@gct/runtime';
import { CloseOutlined } from '@ant-design/icons-vue';
import { GctDndContainer } from '@gct/runtime-web';
import { useFieldTransfer } from '/@/components/FieldTransfer';
import { useDesignViewController } from '../../hooks';
import { NodeRegister } from '../../register';
import { DesignNodeType } from '../../constant';
import './model-field-select.scss';

export const ModelFieldSelect = defineComponent({
  name: 'ModelFieldSelect',
  props: {
    value: {
      type: Array as PropType<IObject[]>,
      default: () => [],
    },
    model: {
      type: Object as PropType<IModelFieldSelectEditor>,
      required: true,
    },
    c: {
      type: Object,
    },
    itemModel: {
      type: Object,
    },
    data: {
      type: Object,
    },
  },
  setup(props) {
    const t = (window as any).$t;
    const ns = useNamespace('model-field-select');
    // 基础信息是否加载完毕
    const isLoaded = ref(false);

    const c = useDesignViewController();

    const selectNode = c.store.selected;

    const parentKey = computed<string | undefined>(() => {
      if (
        !selectNode ||
        selectNode.type === DesignNodeType.PAGE ||
        selectNode.type === DesignNodeType.PAGE_LOWER
      ) {
        return undefined;
      }
      return selectNode.id;
    });

    const nodes = ref<IGctDndData[]>([]);
    // 存储字段映射，key 为 ${modelKey}___${fieldKey}，value 为 IGctDndData
    const fieldMap = ref<Record<string, IGctDndData>>({});

    function getFieldCacheKey(modelKey: string, fieldKey: string): string {
      return `${modelKey}___${fieldKey}`;
    }

    function updateNodes(): void {
      if (!isLoaded.value) {
        nodes.value = [];
        return;
      }
      nodes.value = c.store.getChildren(parentKey.value) || [];
    }

    watch(
      () => c.store.count,
      () => {
        // 当 c.store.count 变化时，更新节点
        updateNodes();
      },
    );

    /**
     * 根据现有的列表排序，修改 c.store.tree 的顺序
     *
     * @author chitanda
     * @date 2025-06-19 11:06:03
     * @param {FieldMetaDTO[]} fields
     */
    function sortFields(fields: FieldMetaDTO[]): void {
      // 按照给回的属性顺序重新排序
      const newItems = c.store.getChildren(parentKey.value) || [];
      newItems.sort((a, b) => {
        const indexA = fields.findIndex((field) => field.key === a.data.key);
        const indexB = fields.findIndex((field) => field.key === b.data.key);
        return indexA - indexB;
      });
      if (parentKey.value) {
        // 存在父时查找出父节点，然后重新排序子
        c.store.getTreeItem(parentKey.value)?.children?.sort((a, b) => {
          const indexA = newItems.findIndex((item) => item.id === a.id);
          const indexB = newItems.findIndex((item) => item.id === b.id);
          return indexA - indexB;
        });
      } else {
        // 不存在父 c.store.tree 直接按照 newItems 排序
        c.store.tree.sort((a, b) => {
          const indexA = newItems.findIndex((item) => item.id === a.id);
          const indexB = newItems.findIndex((item) => item.id === b.id);
          return indexA - indexB;
        });
      }
    }

    const fieldInstance = useFieldTransfer();

    async function addField() {
      const excludeList = [
        FIELD_TYPE.EXPRESSION_CONDITION,
        FIELD_TYPE.MASTERSLAVE,
        FIELD_TYPE.LABEL_TEMPLATE,
        FIELD_TYPE.SERIALRULE,
        // FIELD_TYPE.ONLINE_FORM,
        FIELD_TYPE.PRIMARY_KEY,
        FIELD_TYPE.ESOP,
      ];

      if (gct.designPlatform === PlatformType.PDA) {
        excludeList.push(
          ...[FIELD_TYPE.RANGE_USER, FIELD_TYPE.MESSAGE_TMPL, FIELD_TYPE.EXPRESSION_CONDITION],
        );
      }
      const modelKey = c.store.pageNode?.data.modelKey;
      fieldInstance.open({
        modelKey: modelKey,
        modalTitle: t('sys.pageDesigner.modelField'),
        isShowCascader: true,
        draggable: false,
        data: nodes.value.map(
          (item) => fieldMap.value[getFieldCacheKey(item.data.modelKey, item.data.key)],
        ),
        excludeFieldType: excludeList.concat(props.model.excludeFieldType ?? []) as FIELD_TYPE[],
        excludeFieldKey: ['tenant_id_', 'ref_field_key_', 'ref_model_key_'].concat(
          props.model.excludeFieldKey ?? [],
        ),
        saveCallback: async ({ objFieldList }) => {
          console.log('objFieldList', objFieldList);
          const items = c.store.getChildren(parentKey.value);
          if (objFieldList.length === 0) {
            // 选项清空后，子项全部删除
            items.forEach((item) => {
              c.store.deleteNode(item.id);
            });
            return;
          }
          // 过滤出被删除的项
          const deletedItems = items.filter(
            (item) => !objFieldList.some((field) => field.key === item.data.key),
          );
          // 删除被删除的项
          deletedItems.forEach((item) => {
            c.store.deleteNode(item.id);
          });
          const provider = NodeRegister.get(DesignNodeType.FIELD, c.store.prefix);
          if (!provider) {
            console.error('Field provider not found');
            return;
          }
          for await (const item of objFieldList) {
            // 存在则更新，不存在则新增，和旧数据对比
            const node = items.find((treeItem) => treeItem.data.key === item.key);
            if (!node) {
              const field = await modelLoader.loadField(item.modelKey, item.key);
              if (field) {
                fieldMap.value[getFieldCacheKey(item.modelKey, field.key!)] = field as IGctDndData;
              }
              let fieldCodeChain: IFieldCodeChain | undefined = undefined;
              if (item.fieldCodeChain) {
                try {
                  fieldCodeChain = JSON.parse(item.fieldCodeChain);
                } catch (error) {
                  console.error('Invalid fieldCodeChain JSON:', item.fieldCodeChain, error);
                }
              }
              const data = provider.create({
                data: {
                  modelKey: item.modelKey,
                  modelCategory: item.modelCategory,
                  key: item.key,
                  type: item.type,
                  name: item.name,
                  mapping_type: item.mappingType,
                  fieldCodeChain,
                },
              });
              c.store.setNode(parentKey.value || null, data, -1);
            }
          }
          sortFields(objFieldList);
        },
      });
    }

    const dndCfg: IGctDndConfig = {
      group: 'gct-form-model-field-select',
      end() {
        sortFields(
          nodes.value.map(
            (item) => fieldMap.value[getFieldCacheKey(item.data.modelKey, item.data.key)],
          ),
        );
      },
    };

    function onDeleteItem(e: MouseEvent, item: IObject) {
      e.stopPropagation();
      const node = nodes.value.find((n) => n.data.key === item.key);
      if (!node) {
        console.warn('Node not found for item:', item);
        return;
      }
      // 删除节点
      c.store.deleteNode(node.id);
    }

    async function onInit(): Promise<void> {
      // 加载所有非主模型字段
      const all: Promise<void>[] = [];
      c.store.map.forEach((node) => {
        all.push(
          (async (): Promise<void> => {
            const key = node.data.modelKey;
            const field = await modelLoader.loadField(key, node.data.key);
            if (field) {
              fieldMap.value[getFieldCacheKey(key, field.key!)] = field as IGctDndData;
            }
          })(),
        );
      });
      await Promise.all(all);
      isLoaded.value = true;
      updateNodes();
    }

    onInit();

    return () => {
      return (
        <div class={ns.b()}>
          <div class={ns.e('select-modal')}>
            <a-button onClick={addField} type="dashed" block>
              {t('sys.pageDesigner.selectModelFields')}
            </a-button>
          </div>
          <div class={ns.e('field-content')}>
            {/* <div class={ns.e('field-title')}>{t('sys.selectedFields')}</div> */}
            <div class={ns.e('field-list')}>
              <GctDndContainer config={dndCfg} v-model:items={nodes.value}>
                {{
                  default: (args: IGctDndRenderItemOptions<IObject>) => {
                    const data =
                      fieldMap.value[getFieldCacheKey(args.data.data.modelKey, args.data.data.key)];
                    if (!data) {
                      return <div></div>;
                    }
                    return (
                      <div class={ns.e('field-item')}>
                        <div class={ns.em('field-item', 'bg')}></div>
                        <div class={ns.em('field-item', 'drag')}>
                          <i class="iconfont icon-drag" />
                        </div>
                        <div class={ns.em('field-item', 'label')}>
                          <span class={ns.em('field-item', 'label-icon')}>
                            <i class={['iconfont', FieldIconMap[data.type]]} />
                          </span>
                          <span class={ns.em('field-item', 'label-text')} title={data.name}>
                            {data.name}
                          </span>
                        </div>
                        <div
                          class={ns.em('field-item', 'actions')}
                          // onClick={(e: MouseEvent) => onDeleteItem(e, data)}
                        >
                          <a-popconfirm
                            placement="topRight"
                            ok-text={t('sys.okText')}
                            cancel-text={t('sys.closeText')}
                            onConfirm={(e: MouseEvent) => onDeleteItem(e, data)}
                          >
                            {{
                              title: () => {
                                return <div>{t('sys.sureToDo')}</div>;
                              },
                              default: () => {
                                return <CloseOutlined />;
                              },
                            }}
                          </a-popconfirm>
                        </div>
                      </div>
                    );
                  },
                }}
              </GctDndContainer>
            </div>
          </div>
        </div>
      );
    };
  },
});

export default ModelFieldSelect;
