import { computed, defineComponent, PropType, ref, toRefs, watch } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IDictionaryItem, ITableItem } from '@gct/runtime';
import { INodeData } from '../interface';
import { BatchSelectList } from '../../batch-select-list/batch-select-list';
import { useReportDataSetDesignStore } from '../store';
import { ReportDataSetDataPreview } from './report-data-set-data-preview';
import './report-data-set-node-config.scss';
import { message } from 'ant-design-vue';
import { DATA_PREVIEW_CONNECTOR } from '../constants';

export const ReportDataSetNodeConfig = defineComponent({
  name: 'ReportDataSetNodeConfig',
  components: {
    batchSelectList: BatchSelectList,
  },
  props: {
    data: {
      type: Object as PropType<INodeData>,
      required: true,
    },
  },
  setup(props) {
    const t = (window as any).$t;
    const ns = useNamespace('report-data-set-node-config');
    const { data } = toRefs(props);
    const store = useReportDataSetDesignStore();
    const totalNum = ref<number>(); // 预览数据总数
    // 过滤字段
    const searchVal = ref<string>(''); // 搜索字段的值
    // 当前选中的字段清单
    const fields = computed<string[]>({
      get() {
        return [...data.value.fields].filter((key) => {
          return !key.endsWith('$id_');
        });
      },
      set(v: string[]) {
        const oldFields = data.value.fields;
        const newFields = v.filter((item) => !oldFields.includes(item));
        const removedFields = oldFields.filter((item) => !v.includes(item));
        if (newFields.length > 0) {
          store.addFields(props.data, newFields);
        }
        if (removedFields.length > 0) {
          store.removeFields(props.data, removedFields);
        }
        data.value.fields = v;
      },
    });
    // 可选项
    const options = ref<IDictionaryItem[]>([]);
    // 过滤后的选项列表
    const showOptions = computed<IDictionaryItem[]>(() => {
      const val = searchVal.value.trim().toLowerCase();
      if (!val) {
        return options.value;
      }
      return options.value.filter((option) => option.label.toLowerCase().includes(val));
    });
    // 预览的数据
    const previewItems = ref<IObject[]>([]);
    // 预览数据的翻译
    const _DICT = ref();
    // 预览表格配置
    const columns = computed<ITableItem[]>(() => {
      let fields = store.fields.filter((field) => {
        return field.modelKey === data.value.modelKey && field.fieldKey !== '_id';
      });
      if (store.isBI) {
        fields = uniqueByKey(fields, 'fieldKey');
      }
      const model = store.modelMap.get(data.value.modelKey);
      if (model) {
        return fields.map((field) => {
          const fieldMeta = model.fieldMetaList?.find((f) => f.id === field.id) || {};
          const key = `${field.modelKey.toLowerCase()}${DATA_PREVIEW_CONNECTOR}${field.fieldKey}`;
          return {
            title: field.label || fieldMeta.name!,
            dataIndex: key,
            name: key,
            width: 150,
            ellipsis: true,
            resizable: false,
            fieldKey: field.fieldKey,
            fieldType: field.fieldType,
            modelKey: field.modelKey,
          } as ITableItem;
        });
      }
      return [];
    });

    const uniqueByKey = (arr, key) => {
      const map = new Map();
      return arr.filter((item) => {
        // 如果 map 中没有该 key，则添加并保留当前项
        if (!map.has(item[key])) {
          map.set(item[key], true);
          return true;
        }
        return false;
      });
    };

    watch(fields, () => {
      store.isChanged = true; // 标记为已修改
      // 当 fields 变化时，重新加载预览数据
      loadPreviewItems();
    });

    async function loadPreviewItems() {
      const res = await store.loadPreviewData(data.value.id!);
      if (res) {
        previewItems.value = res.data || [];
        _DICT.value = res.dict || {};
        totalNum.value = res.totalCount;
      }
    }

    async function onRefreshPreview() {
      await loadPreviewItems();
      message.success(t('sys.dataSet.refreshSuccess'));
    }

    // 组件初始化
    async function onInit(): Promise<void> {
      const items = await store.loadModelFields(data.value.modelKey);
      options.value = items
        .map((item) => ({
          label: item.name!,
          value: item.id!,
        }))
        .filter((item) => item.value !== '_id');
      await loadPreviewItems();
    }

    onInit();

    return {
      ns,
      t,
      totalNum,
      searchVal,
      fields,
      options,
      showOptions,
      previewItems,
      _DICT,
      columns,
      onRefreshPreview,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('left')}>
          <div class={this.ns.e('left-header')}>
            <span>{this.t('sys.dataSet.fieldsLabel')}</span>
          </div>
          <div class={this.ns.e('left-search')}>
            <a-input
              v-model:value={this.searchVal}
              placeholder={this.t('sys.dataSet.searchFieldPlaceholder')}
              allowClear
              suffix={<i class="iconfont icon-sousuo" />}
            />
          </div>
          <div class={this.ns.e('left-body')}>
            <batchSelectList
              v-model:value={this.fields}
              options={this.showOptions}
              size={this.options.length}
            />
          </div>
        </div>
        <div class={this.ns.e('right')}>
          <ReportDataSetDataPreview
            key={this.data.modelKey}
            columns={this.columns}
            data={this.previewItems}
            dict={this._DICT}
            total={this.totalNum}
            isNode
            onRefresh={this.onRefreshPreview}
          />
        </div>
      </div>
    );
  },
});
