import { computed, defineComponent, nextTick, PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import {
  EditorType,
  FieldIconMap,
  IEditForm,
  IFormContainer,
  IFormItem,
  IModal,
  urlReg,
  useModal,
  FIELD_TYPE,
} from '@gct/runtime';
import { IReportLinkItem, ITableReportSchema } from '../../../interface';
import { REPORT_LINK_OPEN_MODE, REPORT_LINK_TYPE, REPORT_TYPE } from '../../../constants';
import { createUUID } from 'qx-util';
import { Empty } from 'ant-design-vue';
import { getReportListModelReport } from '/@/apis/gct-apaas/ReportController';
import './report-jump-modal.scss';

export const ReportJumpModal = defineComponent({
  name: 'ReportJumpModal',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    reportData: {
      type: Object as PropType<ITableReportSchema>,
      required: true,
    },
    items: {
      type: Array<IReportLinkItem>,
      default: () => {
        return [];
      },
    },
  },
  setup(props) {
    const ns = useNamespace('report-jump-modal');

    const formRef = ref<any>(null);

    const val = ref<IReportLinkItem[]>(props.items);

    const formModel: IEditForm = {
      type: 'edit',
      info: true,
      children: [
        {
          type: 'container',
          name: 'group1',
          layout: 'grid',
          children: [
            {
              name: 'reportName',
              type: 'item',
              label: '当前报表',
              gridItem: {
                span: 12,
              },
              editor: {
                type: EditorType.INFO,
                icon:
                  props.reportData.reportType === REPORT_TYPE.CROSS_TABLE
                    ? 'icon-jiaochabiao'
                    : 'icon-a-biaoge_table-file4',
              },
            },
            {
              name: 'modelName',
              type: 'item',
              label: '所属模型',
              gridItem: {
                span: 12,
              },
              editor: {
                type: EditorType.INFO,
              },
            },
          ] as IFormItem[],
        },
      ] as IFormContainer[],
    };

    const itemFormModel: IEditForm = {
      type: 'edit',
      info: true,
      children: [
        {
          type: 'container',
          name: 'group1',
          layout: 'grid',
          children: [
            {
              name: 'id',
              type: 'hidden',
            },
            {
              name: 'type',
              type: 'item',
              label: '跳转至',
              dictionary: {
                mode: 'static',
                tag: 'report_jump_type',
                items: [
                  {
                    label: '跳转报表',
                    value: REPORT_LINK_TYPE.REPORT,
                  },
                  {
                    label: '跳转链接',
                    value: REPORT_LINK_TYPE.LINK,
                  },
                ],
              },
              editor: {
                type: EditorType.RADIO,
              },
            },
            {
              name: 'reportName',
              type: 'hidden',
            },
            {
              name: 'report',
              type: 'item',
              label: '目标报表',
              editor: {
                type: EditorType.SELECT_GROUP,
                placeholder: '请选择',
                groupCollapsible: true,
                props: {
                  placeholder: '请选择',
                },
                nameField: 'reportName',
              },
              dictionary: {
                tag: 'report_target_item',
                mode: 'async',
                fetch: async function (params) {
                  const data = await getReportListModelReport();
                  if (data) {
                    data.forEach((item: any) => {
                      item.id = item.modelKey;
                      item.name = item.modelName;
                      item.children = (item.reports as IObject[])?.map((report) => {
                        report.icon =
                          report.reportType === REPORT_TYPE.CROSS_TABLE
                            ? 'icon-jiaochabiao'
                            : 'icon-a-biaoge_table-file4';
                        return report;
                      });
                    });
                  }
                  return data;
                },
              },
              rules: [{ required: true, message: '请选择目标报表' }],
              hidden(form, item, data) {
                return data.type !== REPORT_LINK_TYPE.REPORT;
              },
            },
            {
              name: 'url',
              type: 'item',
              label: '链接地址',
              editor: {
                type: EditorType.TEXTAREA,
                placeholder: '请输入',
                autoSize: { minRows: 4, maxRows: 4 },
              },
              rules: [
                {
                  required: true,
                  trigger: 'blur',
                  validator(rule, value) {
                    return new Promise((resolve, reject) => {
                      if (!value) {
                        reject('请输入链接地址');
                      } else if (!urlReg.test(value)) {
                        reject('链接地址不是一个有效的url');
                      } else {
                        resolve();
                      }
                    });
                  },
                },
              ],
              hidden(form, item, data) {
                return data.type !== REPORT_LINK_TYPE.LINK;
              },
            },
            {
              name: 'openMode',
              type: 'item',
              label: '打开方式',
              dictionary: {
                mode: 'static',
                tag: 'report_jump_open_mode',
                items: [
                  {
                    label: '弹窗打开',
                    value: REPORT_LINK_OPEN_MODE.MODAL,
                  },
                  {
                    label: '新页签打开',
                    value: REPORT_LINK_OPEN_MODE.LINK,
                  },
                ],
              },
              editor: {
                type: EditorType.RADIO,
              },
            },
          ] as IFormItem[],
        },
      ],
    };

    const fieldOptions = computed(() => {
      const data = props.reportData as ITableReportSchema;
      if (props.reportData.reportType === REPORT_TYPE.CROSS_TABLE) {
        const groups: IObject[] = [];
        if (data.rowDimension && data.rowDimension.length > 0) {
          groups.push({
            key: 'rowDimension',
            group: '行维度',
            label: '行（维度）',
            children: data.rowDimension
              .map((key) => {
                const field = data.fieldMap[key];
                return {
                  value: key,
                  label: field.fieldName,
                  type: field.fieldType,
                };
              })
              .filter((p) => ![FIELD_TYPE.IMAGE, FIELD_TYPE.SIGNATURE].includes(p.type)),
          });
        }
        if (data.columnDimension && data.columnDimension.length > 0) {
          groups.push({
            key: 'columnDimension',
            group: '列维度',
            label: '列（维度）',
            children: data.columnDimension
              .map((key) => {
                const field = data.fieldMap[key];
                return {
                  value: key,
                  label: field.fieldName,
                  type: field.fieldType,
                };
              })
              .filter((p) => ![FIELD_TYPE.IMAGE, FIELD_TYPE.SIGNATURE].includes(p.type)),
          });
        }
        if (data.indicatorDimension && data.indicatorDimension.length > 0) {
          groups.push({
            key: 'indicatorDimension',
            group: '指标度量',
            label: '指标（度量）',
            children: data.indicatorDimension.map((key) => {
              const field = data.fieldMap[key];
              return {
                value: key,
                label: field.fieldName,
                type: field.fieldType,
              };
            }),
          });
        }
        return groups;
      }
      return [
        {
          key: 'dataColumn',
          group: '数据列（维度或度量）',
          label: '数据列（维度或度量）',
          children: data.dataColumn
            .map((key) => {
              const field = data.fieldMap[key];
              return {
                value: key,
                label: field.fieldName,
                type: field.fieldType,
              };
            })
            .filter((p) => ![FIELD_TYPE.IMAGE, FIELD_TYPE.SIGNATURE].includes(p.type)),
        },
      ];
    });
    // 列表项的属性选择异常提示
    const fieldErrMap = ref<{ [key: string]: boolean }>({});

    function onAdd() {
      const item = {
        id: createUUID(),
        type: REPORT_LINK_TYPE.REPORT,
        openMode: REPORT_LINK_OPEN_MODE.MODAL,
        report: undefined,
      };
      val.value.push(item);
      nextTick(() => {
        select.value = item;
      });
    }

    // 选中跳转项
    const select = ref<IReportLinkItem>(val.value[0]);
    function onSelect(val: IReportLinkItem) {
      select.value = val;
    }
    function onDelete(e: MouseEvent, i: number) {
      e.stopPropagation();
      const item = val.value[i];
      val.value.splice(i, 1);
      nextTick(() => {
        if (select.value.id === item.id) {
          onSelect(val.value[0]);
        }
      });
    }

    const itemFormData = computed({
      get() {
        return select.value;
      },
      set(val) {
        Object.assign(select.value, val);
      },
    });

    /**
     * @description 处理模态框确认事件的钩子函数。
     * @returns {Promise<object>} 一个 Promise 对象，包含以下属性：
     * - ok: {boolean} 表示操作是否成功。
     * - close: {boolean} (可选) 指示是否应关闭模态框。
     * - data: {Array<IReportLinkItem>} (可选) 处理后的跳转项数据。
     * @example
     * useModal(async () => {
     *   // ... 校验逻辑 ...
     *   if (validationFailed) {
     *     return { ok: false };
     *   }
     *   // ... 数据处理 ...
     *   return { ok: true, data: processedItems };
     * });
     */
    useModal(async () => {
      // 如果选择了字段且表单引用存在，则校验表单
      if (select.value.field && formRef.value) {
        const bol = await formRef.value.c.validate();
        // 如果校验失败，则返回失败状态
        if (!bol) {
          return {
            ok: false,
          };
        }
      }
      // 如果跳转项只有一个或没有
      if (val.value.length <= 1) {
        const item = val.value[0];
        // 如果唯一的跳转项没有选择字段，则认为操作成功，关闭模态框并返回空数据
        if (!item.field) {
          return {
            ok: true,
            close: true,
            data: [],
          };
        }
      }
      // 如果有多个跳转项
      if (val.value.length > 1) {
        let bol = false;
        // 遍历所有跳转项，检查字段是否已选择
        for (const item of val.value) {
          fieldErrMap.value[item.id] = !item.field;
          // 如果有任何一项的字段未选择，则标记为错误
          if (fieldErrMap.value[item.id]) {
            bol = true;
          }
        }
        // 如果存在错误，则返回失败状态
        if (bol) {
          return {
            ok: false,
          };
        }
      }
      // 映射跳转项数据，根据类型清除不必要的属性
      const items = val.value.map((item) => {
        // 如果类型是报表跳转，则清除 URL
        if (item.type === REPORT_LINK_TYPE.REPORT) {
          item.url = undefined;
        }
        // 如果类型是链接跳转，则清除报表相关信息
        if (item.type === REPORT_LINK_TYPE.LINK) {
          item.report = undefined;
          item.reportName = undefined;
        }
        return item;
      });
      // 返回成功状态和处理后的数据
      return {
        ok: true,
        data: items,
      };
    });

    function onFieldSelect(key: string, val: string) {
      fieldErrMap.value[key] = !val;
    }

    function findSelectItem(key: string) {
      let item;
      fieldOptions.value.find((group) => {
        if (group.children) {
          item = group.children.find((item) => {
            return item.value === key;
          });
        }
        if (item) {
          return true;
        }
        return false;
      });
      return item;
    }

    function onInit() {
      val.value = val.value.filter((_) => {
        if (_.field) {
          const item = findSelectItem(_.field);
          if (!item) {
            return false;
          }
        }
        return true;
      });
      if (val.value.length === 0) {
        onAdd();
      }
    }

    onInit();

    return {
      ns,
      formModel,
      itemFormModel,
      fieldOptions,
      fieldErrMap,
      formRef,
      val,
      onAdd,
      select,
      onSelect,
      onDelete,
      itemFormData,
      onFieldSelect,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('form')}>
          <gct-edit-form model={this.formModel} data={this.reportData} adaptModal={false} />
        </div>
        <div class={this.ns.e('config')}>
          <div class={this.ns.e('config-header')}>跳转规则</div>
          <div class={this.ns.e('config-body')}>
            <div class={this.ns.e('config-list')}>
              <div class={this.ns.e('config-list-header')}>
                <div class={this.ns.e('config-list-add')}>
                  <a-button type="link" onClick={this.onAdd}>
                    {{
                      icon: () => {
                        return <i class="iconfont icon-tianjia" />;
                      },
                      default: () => {
                        return '添加规则';
                      },
                    }}
                  </a-button>
                </div>
              </div>
              <div class={this.ns.e('config-list-body')}>
                {this.val.map((item, i) => {
                  const isError = this.fieldErrMap[item.id] && this.val.length > 1;
                  return (
                    <div
                      key={item.id}
                      class={[
                        this.ns.e('config-list-item'),
                        this.ns.is('active', item.id === this.select?.id),
                        this.ns.is('error', isError),
                      ]}
                      onClick={() => this.onSelect(item)}
                    >
                      <div class={this.ns.e('config-list-item-field')}>
                        <a-select
                          v-model:value={item.field}
                          placeholder="请选择字段"
                          allowClear
                          show-search
                          onChange={(args) => this.onFieldSelect(item.id, args)}
                          filter-option={(input: string, option: any) => {
                            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                          }}
                        >
                          {this.fieldOptions.map((item2) => {
                            return (
                              <a-select-opt-group key={item2.key} label={item2.label}>
                                {item2.children
                                  .filter((item2) => {
                                    return (
                                      this.val.findIndex((self) => self.field === item2.value) ===
                                        -1 || item2.value === item.field
                                    );
                                  })
                                  .map((item3) => {
                                    return (
                                      <a-select-option
                                        class={this.ns.e('config-list-item-field-option')}
                                        key={item3.value}
                                        value={item3.value}
                                        label={item3.label}
                                      >
                                        <span>
                                          <i
                                            class={[
                                              'iconfont',
                                              FieldIconMap[item3.type] || 'icon-zidingyi',
                                            ]}
                                          ></i>
                                        </span>
                                        <span>{item3.label}</span>
                                      </a-select-option>
                                    );
                                  })}
                              </a-select-opt-group>
                            );
                          })}
                        </a-select>
                      </div>
                      <div
                        class={[
                          this.ns.e('config-list-item-delete'),
                          this.ns.is('hidden', this.val.length <= 1),
                        ]}
                      >
                        <a-button type="text" onClick={(e) => this.onDelete(e, i)}>
                          {{
                            icon: () => {
                              return <i class="iconfont icon-shanchu" />;
                            },
                          }}
                        </a-button>
                      </div>
                      {isError ? (
                        <div class={this.ns.e('config-list-item-err')}>请选择字段</div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
            <div class={this.ns.e('config-form')}>
              {this.select?.field ? (
                <gct-edit-form
                  ref="formRef"
                  key={this.select.id}
                  model={this.itemFormModel}
                  v-model:data={this.itemFormData}
                  embed
                  adaptModal={false}
                />
              ) : (
                <Empty description="请选择需要触发的字段" image="/assets/images/empty.png" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
