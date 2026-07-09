import { defineComponent, PropType, toRefs } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { SourceModeEnum } from '../enums';
import { useReportDataSetDesignStore } from '../store';
import { INodeData } from '../interface';
import { SHAPE_TYPE } from '../constants';
import './data-resource-item.scss';

export const DataResourceItemBI = defineComponent({
  name: 'DataResourceItemBI',
  props: {
    index: {
      type: Number,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    sourceMode: {
      type: String as PropType<SourceModeEnum>,
      required: true,
    },
  },
  setup(props) {
    const t = (window as any).$t;
    const ns = useNamespace('data-resource-item');

    const store = useReportDataSetDesignStore();

    const { data } = toRefs(props);

    interface INodeDataBI extends INodeData {
      databaseId?: string;
    }

    function startDrag(e: MouseEvent) {
      e.stopPropagation();
      e.preventDefault();

      if (store.graph && store.dnd) {
        const key = data.value.name;
        const node = store.graph.createNode({
          id: key,
          shape: SHAPE_TYPE.NODE,
          zIndex: 20,
          data: {
            id: key,
            modelCategory: data.value.databaseId,
            databaseId: data.value.databaseId,
            modelKey: key,
            modelName: data.value.name,
            type: SourceModeEnum.ENTITY,
            fields: [],
          } as INodeDataBI,
        });
        store.isDragging = true;
        store.showDropLayout();
        // 触发开始拖拽事件
        store.dnd.start(node, e);
      }
    }

    return () => {
      return (
        <div class={ns.b()} onMousedown={startDrag}>
          {data.value.formType ? (
            <span class={ns.e('form-type')}>
              <a-tag
                color={data.value.subModel === 0 ? 'rgba(0, 102, 255, 1)' : 'rgba(180, 69, 245, 1)'}
              >
                {data.value.subModel === 0 ? t('sys.dataSet.mainTableLabel') : t('sys.dataSet.subTableLabel')}
              </a-tag>
            </span>
          ) : null}
          <span class={ns.e('label')}>{data.value.name}</span>
        </div>
      );
    };
  },
});
