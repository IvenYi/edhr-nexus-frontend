import { defineComponent, onUnmounted, PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IModal, ITableItem } from '@gct/runtime';
import { ReportDataSetDataPreview } from '../../widgets/report-data-set-data-preview';
import { useReportDataSetDesignStore } from '../../store';
import './report-data-set-preview-modal.scss';

export const ReportDataSetPreviewModal = defineComponent({
  name: 'ReportDataSetPreviewModal',
  props: {
    id: {
      type: String,
      required: true,
    },
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('report-data-set-preview-modal');
    const t = (window as any).$t;
    const totalNum = ref<number>();
    const store = useReportDataSetDesignStore();

    // 预览表格配置
    const columns = ref<ITableItem[]>([]);
    // 预览数据的翻译
    const _DICT = ref();
    /**
     * 加载数据集配置和相关模型数据
     *
     * @description 重置store状态，加载数据集配置，并确保所有相关模型数据都已加载
     * @returns {Promise<void>}
     */
    async function loadDataSet(): Promise<void> {
      store.$reset(); // 重置 store 状态
      await store.load(props.id);

      // 收集所有需要加载的模型键，使用 Set 去重
      const modelKeysToLoad: Set<string> = new Set();
      store.fields.forEach((field) => {
        if (!field.modelKey) {
          return;
        }
        if (!store.modelMap.has(field.modelKey)) {
          modelKeysToLoad.add(field.modelKey);
        }
      });

      // 并行加载所有去重后的模型数据
      const modelLoadPromises = Array.from(modelKeysToLoad).map(async (modelKey) => {
        await store.loadModelFields(modelKey);
      });
      await Promise.all(modelLoadPromises);

      // 根据配置的属性，生成预览表格的列
      columns.value = [];
      store.fields.forEach((field) => {
        const model = store.modelMap.get(field.modelKey)!;
        const fieldMeta = model?.fieldMetaList?.find((f) => f.id === field.id) || {};
        const key = field.key || field.fieldKey!;
        columns.value.push({
          title: field.label || fieldMeta?.name || '',
          dataIndex: key,
          name: key,
          width: 120,
          ellipsis: true,
          fieldKey: field.fieldKey,
          fieldType: field.fieldType,
          modelKey: field.modelKey,
        });
      });
    }

    async function fetchPreviewItems(): Promise<IObject[]> {
      const res = await store.loadPreviewData();
      if (res) {
        totalNum.value = res.totalCount;
        _DICT.value = res.dict || {};
        return res.data || [];
      }
      return [];
    }

    onUnmounted(() => {
      store.$reset();
    });

    loadDataSet();

    function closeModal(): void {
      props.modal.dismiss();
    }

    return () => {
      return (
        <div class={ns.b()}>
          <div class={ns.e('table')}>
            <ReportDataSetDataPreview
              key={props.id + columns.value.length}
              columns={columns.value}
              fetch={fetchPreviewItems}
              dict={_DICT.value}
              isAllPreview
              dataSetPreview
              total={totalNum.value}
            />
          </div>
          <div class={ns.e('footer')}>
            <a-button onClick={closeModal}>{t('sys.dataSet.closeBtn')}</a-button>
          </div>
        </div>
      );
    };
  },
});

export function openReportDataSetPreviewModal(id: string): void {
  window.gct.openUtil.modal(
    ReportDataSetPreviewModal,
    { id },
    {
      title: (window as any).$t('sys.dataSet.previewModalTitle'),
      width: '640px',
      height: '480px',
      footer: false,
    },
  );
}
