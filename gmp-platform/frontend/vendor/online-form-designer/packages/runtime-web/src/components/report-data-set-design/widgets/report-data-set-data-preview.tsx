import { computed, defineComponent, PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { ITable, ITableController, ITableItem, FIELD_TYPE } from '@gct/runtime';
import './report-data-set-data-preview.scss';
import SignatureRender from '../../report-design/report-table/table/components/signature-render.vue';
import { SignatureTypeEnum, SignatureStyleEnum } from '/@/projects/page-designer/src/enum';
import FieldReadonly from '../../report-design/report-table/table/components/readonly-render.vue';
import EnumReadonly from '../../report-design/report-table/table/components/enum-render.vue';

export const ReportDataSetDataPreview = defineComponent({
  name: 'ReportDataSetDataPreview',
  props: {
    columns: {
      type: Array<ITableItem>,
      default: () => [],
    },
    total: {
      type: Number,
      default: 0,
    },
    data: {
      type: Array as PropType<IObject[]>,
      default: () => {
        return [];
      },
    },
    dict: {
      default: () => {
        return {};
      },
    },
    fetch: {
      type: Function as PropType<
        (params?: IParams, controller?: ITableController) => Promise<IObject[]>
      >,
    },
    isAllPreview: {
      type: Boolean,
      default: false,
    },
    isNode: {
      type: Boolean,
      default: false,
    },
    // 是否为在数据集中的预览
    dataSetPreview: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const ns = useNamespace('report-data-set-data-preview');
    const t = (window as any).$t;
    const isLoading = ref(false);
    const tableRef = ref<any>(null);
    const totalNum = ref<number | null>(null);
    const count = ref(0);
    const signType = {
      signatureType: SignatureTypeEnum.SIGNATURE_ONLY,
      displayStyle: SignatureStyleEnum.HORIZONTAL,
    };
    // 数据预览表格模型
    const tableModel = computed<ITable>(() => {
      const fieldColumns = props.columns
        .filter((i) => i.fieldKey !== 'id_')
        .map((p) => {
          console.log('p', p);

          if (p.fieldType === FIELD_TYPE.SIGNATURE) {
            return {
              ...p,
              customRender: ({ record }) => {
                return record[p.dataIndex] ? (
                  <SignatureRender
                    modelValue={record[p.dataIndex]}
                    widget={signType}
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                  />
                ) : (
                  '--'
                );
              },
            };
          } else if (p.fieldType === FIELD_TYPE.IMAGE) {
            return {
              ...p,
              customRender: ({ record }) => {
                const imglist = record[p.dataIndex] && record[p.dataIndex].split(',');

                return imglist
                  ? imglist.map((path) => {
                      return (
                        <a-image
                          src={import.meta.env.VITE_MINIO_PATH + path}
                          width="22px"
                          height="22px"
                        >
                          {{
                            previewMask: () => <zoom-in-outlined />,
                          }}
                        </a-image>
                      );
                    })
                  : '--';
              },
            };
          } else if (
            [FIELD_TYPE.RDO_REF, FIELD_TYPE.LABEL_TEMPLATE_REF, FIELD_TYPE.PRINTER].includes(
              p.fieldType,
            )
          ) {
            return {
              ...p,
              customRender: ({ record }) => {
                return record[p.dataIndex] ? (
                  <FieldReadonly
                    modelValue={record[p.dataIndex]}
                    label={props.dict?.[p.dataIndex]?.[record[p.dataIndex]] || record[p.dataIndex]}
                    type={p.fieldType}
                  />
                ) : (
                  '--'
                );
              },
            };
          } else if (p.fieldType === FIELD_TYPE.BOOLEAN) {
            return {
              ...p,
              customRender: ({ record }) => {
                return record[p.dataIndex] !== null && record[p.dataIndex] !== undefined ? (
                  <a-switch checked={record[p.dataIndex]} size="small" />
                ) : (
                  '--'
                );
              },
            };
          } else if (p.fieldType === FIELD_TYPE.EXPRESSION) {
            return {
              ...p,
              customRender: ({ record }) => {
                return typeof record[p.dataIndex] === 'boolean' ? (
                  <a-switch checked={record[p.dataIndex]} size="small" />
                ) : record[p.dataIndex] !== null && record[p.dataIndex] !== undefined ? (
                  record[p.dataIndex]
                ) : (
                  '--'
                );
              },
            };
          } else if (
            [
              FIELD_TYPE.USER,
              FIELD_TYPE.USER_MULTI,
              FIELD_TYPE.ORG,
              FIELD_TYPE.ORG_MULTI,
              FIELD_TYPE.REF,
              FIELD_TYPE.REF_MULTI,
              FIELD_TYPE.TRANSACTION,
              FIELD_TYPE.ENUM,
              FIELD_TYPE.ENUM_MULTI,
              FIELD_TYPE.MESSAGE_TMPL,
            ].includes(p.fieldType)
          ) {
            return {
              ...p,
              customRender: ({ record }) => {
                let labeldict = '';
                if (record[p.dataIndex]) {
                  const labelArr = record[p.dataIndex].split(',').map((y) => {
                    return props.dict?.[p.dataIndex]?.[y] || y;
                  });
                  labeldict = labelArr.join(',');
                }
                return record[p.dataIndex] ? (
                  <EnumReadonly
                    modelValue={record[p.dataIndex]}
                    tagValue={labeldict}
                    fieldType={p.fieldType}
                    widget={p}
                  />
                ) : (
                  '--'
                );
              },
            };
          }
          return {
            ...p,
          };
        });
      console.log('fieldColumns', fieldColumns);

      return {
        key: 'data-preview',
        local: props.fetch ? false : true, // 如果有 fetch 方法，则不使用本地数据
        isEmptyText: true, // 空数据时显示提示文本
        columns: [
          {
            title: t('sys.dataSet.index'),
            dataIndex: 'index',
            name: 'index',
            resizable: false,
            width: 60,
            fixed: 'left',
          },
          ...fieldColumns,
        ],
        async fetch(params, controller) {
          if (props.fetch) {
            isLoading.value = true;
            try {
              const items = await props.fetch(params, controller);
              if (items && items.length > 0) {
                return items.map((item, index) => {
                  return {
                    ...item,
                    index: index + 1, // 添加序号
                  };
                });
              }
            } catch (error) {
              console.error('数据加载失败:', error);
            } finally {
              isLoading.value = false;
            }
          }
          return [];
        },
      };
    });
    const items = computed<IObject[]>(() => {
      count.value += 1;
      return props.data.map((item, index) => {
        for (const key in item) {
          if (item[key] && typeof item[key] == 'object') {
            item[key] = null;
          }
        }
        return {
          ...item,
          index: index + 1, // 添加序号
        };
      });
    });

    function onRefresh(e: MouseEvent) {
      e.stopPropagation();
      emit('refresh');
    }

    return { ns, isLoading, tableRef, count, totalNum, tableModel, items, onRefresh };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.dataSetPreview && this.isLoading ? (
          <div class={this.ns.e('loading')}>
            <a-spin indicator={<svg-icon src="/assets/svg/loading.svg" />} spinning={true} />
          </div>
        ) : null}
        {this.columns.length > 0 ? (
          <div class={this.ns.e('header')}>
            <span class={this.ns.e('header-title')}>
              {this.isAllPreview ? (
                <span style={{ color: 'rgba(93, 100, 116, 1)', 'font-weight': 400 }}>
                  {this.$t('sys.dataSet.previewDefaultTip')}
                </span>
              ) : (
                [
                  this.$t('sys.dataSet.dataPreview'),
                  <a-tooltip title={this.$t('sys.dataSet.previewDefaultTip')}>
                    <i class="iconfont icon-bangzhu" />
                  </a-tooltip>,
                ]
              )}
            </span>
            {this.isAllPreview ? null : (
              <span class={this.ns.e('header-refresh')} onClick={this.onRefresh}>
                <a-tooltip title={this.$t('sys.dataSet.refreshBtn')}>
                  <i class="iconfont icon-shuaxin" />
                </a-tooltip>
              </span>
            )}
            <span class={this.ns.e('header-total')}>
              {this.$t('sys.dataSet.totalData', { count: this.totalNum ?? this.total })}
            </span>
          </div>
        ) : null}
        <div class={this.ns.e('body')}>
          {this.columns.length > 0 ? (
            <gct-table
              key={this.tableModel.columns.length.toString()}
              ref="tableRef"
              count={this.count}
              model={this.tableModel}
              data={this.items}
              embed
            />
          ) : this.dataSetPreview !== true ? (
            <div class={this.ns.e('preview-empty')}>
              <div>
                <img width={150} src="/assets/images/empty.png" />
              </div>
              <div>
                {this.isNode || this.isAllPreview
                  ? this.$t('sys.dataSet.previewNoData')
                  : this.$t('sys.dataSet.pleaseSelectLinkField')}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  },
});
