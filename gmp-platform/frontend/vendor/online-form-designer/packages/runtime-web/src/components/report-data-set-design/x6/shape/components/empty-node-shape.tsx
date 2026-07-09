import { defineComponent } from 'vue';
import style from './empty-node-shape.module.scss';
import { useReportDataSetDesignStore } from '../../../store';

export const EmptyNodeShape = defineComponent({
  name: 'EmptyNodeShape',
  setup() {
    const store = useReportDataSetDesignStore();

    return () => {
      return (
        <div class={[style.container, store.isDragging ? '' : style.hidden]}>
          <span class={style.title}>{ window.$t('sys.dataSet.dragModelToAdd')}</span>
        </div>
      );
    };
  },
});
