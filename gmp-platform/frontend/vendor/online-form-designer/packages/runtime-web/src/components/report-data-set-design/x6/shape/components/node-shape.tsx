import { computed, defineComponent, inject } from 'vue';
import { Tooltip, message, Popconfirm } from 'ant-design-vue';
import style from './node-shape.module.scss';
import { Node } from '@antv/x6';
import { INodeData } from '../../../interface';
import { useReportDataSetDesignStore } from '../../../store';
import { SHAPE_TYPE } from '../../../constants';

export const NodeShape = defineComponent({
  name: 'NodeShape',
  setup() {
    const t = (window as any).$t;
    const getNode = inject<any>('getNode')!;
    const node = getNode() as Node;
    const data = node.getData<INodeData>();
    const store = useReportDataSetDesignStore();

    const isActive = computed(() => {
      if (store.activeLink) {
        const link = store.links.find((item) => item.id === store.activeLink);
        if (link) {
          return link.source === node.id || link.target === node.id;
        }
      }
      return store.active === node.id;
    });
    const isDelete = computed(() => {
      return (
        store.links.findIndex(
          (item) => item.source === node.id && item.type !== SHAPE_TYPE.EMPTY_LINK,
        ) === -1
      );
    });

    function onDelete(e: MouseEvent) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();

      if (isDelete.value === false) {
        message.warning({
          content: '存在子模型关联，请删除子关联后再删除！',
        });
        return;
      }

      // 触发删除事件
      store.removeNode(node.id);
    }

    function onActive(e: MouseEvent) {
      e.stopPropagation();
      store.setActive(node.id);
    }

    function onCancelClick(e: MouseEvent) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
    }

    return () => {
      return (
        <div class={[style.container, isActive.value ? style.active : '']} onClick={onActive}>
          <div class={style.content}>
            <div class={style.title}>{data.modelName}</div>
            {store.isPreview === true ? null : (
              <div class={[style.actions]}>
                <div class={style.action} onClick={onCancelClick}>
                  {isDelete.value ? (
                    <Popconfirm
                      placement="top"
                      ok-text={t('sys.dataSet.confirmText')}
                      cancel-text={t('sys.dataSet.cancelText')}
                      onConfirm={onDelete}
                    >
                      {{
                        title: () => {
                          return <span>{t('sys.dataSet.pleaseConfirm')}?</span>;
                        },
                        default: () => {
                          return (
                            <Tooltip placement="right">
                              {{
                                title: () => {
                                  return <span>{t('sys.dataSet.deleteTooltip')}</span>;
                                },
                                default: () => {
                                  return <i class="iconfont icon-shanchu" />;
                                },
                              }}
                            </Tooltip>
                          );
                        },
                      }}
                    </Popconfirm>
                  ) : (
                    <Tooltip placement="right">
                      {{
                        title: () => {
                          return <span>{t('sys.dataSet.deleteTooltip')}</span>;
                        },
                        default: () => {
                          return <i class="iconfont icon-shanchu" onClick={onDelete} />;
                        },
                      }}
                    </Tooltip>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };
  },
});
