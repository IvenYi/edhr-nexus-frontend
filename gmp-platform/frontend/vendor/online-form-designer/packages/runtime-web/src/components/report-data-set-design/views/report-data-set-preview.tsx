import { computed, defineComponent, onUnmounted, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { ReportDataSetDesign } from './report-data-set-design';
import {
  EditorType,
  FIELD_TYPE,
  IEditForm,
  IFormEditItem,
  IModalData,
  ITable,
  ITableItem,
} from '@gct/runtime';
import { cloneDeep } from 'lodash-es';
import { useReportDataSetDesignStore } from '../store';
import { ReportDataSetDataPreview } from '../widgets/report-data-set-data-preview';
import { ReportDataSetDesignEditorPanel } from '../widgets/report-data-set-design-editor-panel';
import { FORMULA_DISPLAY_FIELD_PREFIX } from '../constants';
import './report-data-set-preview.scss';

export const ReportDataSetPreview = defineComponent({
  name: 'ReportDataSetPreview',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  emits: ['back'],
  setup(props, { emit }) {
    const t = (window as any).$t;
    const ns = useNamespace('report-data-set-preview');
    const totalNum = ref<number>();
    const store = useReportDataSetDesignStore();

    // 数据集信息表单模型
    const formModel: IEditForm = {
      type: 'edit',
      info: true,
      children: [
        {
          type: 'container',
          layout: 'grid',
          name: 'group',
          children: [
            {
              type: 'item',
              name: 'createUserName',
              label: t('sys.dataSet.creator'),
              labelWidth: 50,
              gridItem: {
                span: 6,
              },
              editor: {
                type: EditorType.INFO,
              },
            },
            {
              type: 'item',
              name: 'createTime',
              label: t('sys.dataSet.createTime'),
              gridItem: {
                span: 6,
              },
              editor: {
                type: EditorType.INFO,
              },
            },
            {
              type: 'item',
              name: 'modifyUserName',
              label: t('sys.dataSet.modifier'),
              gridItem: {
                span: 6,
              },
              editor: {
                type: EditorType.INFO,
              },
            },
            {
              type: 'item',
              name: 'modifyTime',
              label: t('sys.dataSet.modifyTime'),
              gridItem: {
                span: 6,
              },
              editor: {
                type: EditorType.INFO,
              },
            },
            {
              type: 'item',
              name: 'description',
              label: t('sys.dataSet.description'),
              labelWidth: 50,
              gridItem: {
                span: 6,
              },
              editor: {
                type: EditorType.INFO,
              },
            },
          ] as IFormEditItem[],
        },
      ],
    };

    // 数据预览表格模型
    const tableModel = computed<ITable>(() => {
      const columns: ITableItem[] = [
        {
          dataIndex: 'index',
          name: 'index',
          title: t('sys.dataSet.index'),
          width: 60,
          resizable: false,
          fixed: 'left',
        },
        {
          dataIndex: 'modelName',
          name: 'modelName',
          title: t('sys.dataSet.modelName'),
          resizable: false,
        },
        {
          dataIndex: 'fieldName',
          name: 'fieldName',
          title: t('sys.dataSet.fieldName'),
          resizable: false,
        },
        {
          dataIndex: 'fieldLabel',
          name: 'fieldLabel',
          title: t('sys.dataSet.fieldLabel'),
          resizable: false,
        },
        {
          dataIndex: 'fieldKey',
          name: 'fieldKey',
          title: t('sys.dataSet.sourceFieldKey'),
          resizable: false,
        },
        {
          dataIndex: 'key',
          name: 'key',
          title: t('sys.dataSet.fieldKey'),
          resizable: false,
        },
        {
          dataIndex: 'fieldType',
          name: 'fieldType',
          title: t('sys.dataSet.fieldType'),
          resizable: false,
          customRender: ({ record }) => {
            const fieldTypeText =
              t(`sys.pageDesigner.fieldCmp.${record.source.fieldType}`) || record.source.fieldType;
            // 如果是公式显示字段，添加标签
            if (record.key && record.key.startsWith(FORMULA_DISPLAY_FIELD_PREFIX)) {
              return (
                <a-space>
                  <span>{fieldTypeText}</span>
                  <a-tag color="orange">{t('sys.dataSet.displayTag')}</a-tag>
                </a-space>
              );
            }
            return fieldTypeText;
          },
        },
      ];
      return {
        autoLoad: true,
        key: 'id',
        columns,
        async fetch(_params: any, _controller: any): Promise<IObject[]> {
          const items: IObject[] = [];
          if (store.fields) {
            for (let i = 0; i < store.fields.length; i++) {
              const item = store.fields[i];
              if (item.fieldType === FIELD_TYPE.FUNCTION) {
                items.push({
                  id: item.id,
                  index: i + 1,
                  modelName: '--',
                  fieldName: item.fieldName || '',
                  fieldLabel: item.label || item.fieldName || '',
                  fieldKey: '--',
                  key: item.key || item.fieldKey!,
                  fieldType: t(`sys.pageDesigner.fieldCmp.${item.fieldType}`) || item.fieldType,
                  source: item,
                });
                continue;
              }
              let model = store.modelMap.get(item.modelKey);
              if (!model) {
                await store.loadModelFields(item.modelKey);
                model = store.modelMap.get(item.modelKey)!;
              }
              const field = model.fieldMetaList?.find((field) => field.id === item.id);
              if (!field) {
                continue;
              }
              items.push({
                id: item.id,
                index: i + 1,
                modelName: model.name,
                fieldName: field.name,
                fieldLabel: item.label || field.name,
                fieldKey: item.fieldKey,
                key: item.key || item.fieldKey!,
                fieldType: t(`sys.pageDesigner.fieldCmp.${item.fieldType}`) || item.fieldType,
                source: item,
              });
            }
          }
          return items;
        },
      };
    });

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

      store.isPreview = true; // 设置为预览模式

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
          resizable: false,
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

    /**
     * 处理面包屑导航点击事件，拦截 a 标签的默认跳转行为
     *
     * @param {Event} event - 点击事件对象
     * @returns {void}
     */
    const handleBreadcrumbClick = (event: Event): void => {
      event.preventDefault(); // 阻止默认的页面跳转行为
      emit('back'); // 触发父组件的返回事件
    };

    async function handleEditClick() {
      const state = cloneDeep(store.$state);
      const res = await gct.openUtil.fullScreen<IModalData>(ReportDataSetDesign, {
        id: props.id,
      });
      if (res && res.ok && res.data) {
        await loadDataSet();
      } else {
        store.$patch(state as any); // 恢复到编辑前的状态
      }
    }

    // 初始化加载数据集
    loadDataSet();

    onUnmounted(() => {
      store.$reset(); // 重置 store 状态
    });

    return () => {
      if (!store.isLoaded) {
        return null;
      }
      return (
        <div class={ns.b()}>
          <div class={ns.e('crumbs')}>
            <a-breadcrumb>
              <a-breadcrumb-item>
                <a href="" onClick={handleBreadcrumbClick}>
                  {t('sys.dataSet.dataSetSubTitle')}
                </a>
              </a-breadcrumb-item>
              <a-breadcrumb-item>{t('sys.dataSet.preview')}</a-breadcrumb-item>
            </a-breadcrumb>
          </div>
          <div class={ns.e('panel')}>
            <div class={ns.e('header')}>
              <div class={ns.e('title')}>
                <span class={ns.em('title', 'icon')}>
                  <img src="/assets/data-set/data-set.svg" />
                </span>
                <span>{store.data.name}</span>
              </div>
              <div class={ns.e('actions')}>
                <a-button
                  type="primary"
                  ghost
                  icon={
                    <span>
                      <i class={'iconfont icon-bianji'}></i>
                    </span>
                  }
                  onClick={handleEditClick}
                >
                  <span>{t('sys.dataSet.editBtn')}</span>
                </a-button>
              </div>
            </div>
            <div class={ns.e('form')}>
              <gct-edit-form data={store.data} model={formModel} embed />
            </div>
          </div>
          <div class={ns.e('tabs')}>
            <a-tabs defaultActiveKey="1" type="card">
              <a-tab-pane key="1" tab={t('sys.dataSet.fieldList')}>
                <div class={ns.e('field-list-header')}>
                  {t('sys.dataSet.totalFields', { count: store.fields.length })}
                </div>
                <div class={ns.e('field-list-content')}>
                  <gct-table model={tableModel.value} />
                </div>
              </a-tab-pane>
              <a-tab-pane key="2" tab={t('sys.dataSet.dataPreview')}>
                <ReportDataSetDataPreview
                  key={props.id + columns.value.length}
                  columns={columns.value}
                  total={totalNum.value}
                  fetch={fetchPreviewItems}
                  dict={_DICT.value}
                  isAllPreview
                />
              </a-tab-pane>
              <a-tab-pane key="3" tab={t('sys.dataSet.modelStructure')}>
                <ReportDataSetDesignEditorPanel />
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      );
    };
  },
});
