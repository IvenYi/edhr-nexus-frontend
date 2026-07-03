import {
  defineComponent,
  PropType,
  watch,
  h,
  ref,
  resolveComponent,
  onMounted,
  onUnmounted,
  computed,
} from 'vue';
import {
  ITable,
  ITableActionItem,
  ITableEditItemController,
  ITableItem,
  ITableRowController,
  GctTableController,
  useTableController,
  useAntTableScrollHeight,
  useNamespace,
  ITableEditItem,
  nullDisplayEnum,
} from '@gct/runtime';
import { clone, cloneDeep, defaults, isNil } from 'lodash-es';
import { TablePaginationConfig, TableProps } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { isAsync, isPromise } from 'qx-util';
import './gct-table.scss';
import { isBoolean } from '/@/utils/is';

export const GctTable = defineComponent({
  name: 'GctTable',
  props: {
    // local 必给，避免vue的双向数据绑定不生效
    count: {
      type: Number,
      default: 0,
    },
    model: {
      type: Object as PropType<ITable>,
      required: true,
    },
    data: {
      type: Array as PropType<IData[]>,
      default: () => [],
    },
  },
  emits: ['rowChange'],
  setup(props, { emit }) {
    const ns = useNamespace('gct-table');

    const { t } = useI18n();

    const loadingState = ref<IObject>({});

    const elRef = ref<HTMLDivElement>();

    const formRef = ref();

    const tableRef = ref();

    let hoverRow: ITableRowController | null = null;

    let activeRow: ITableRowController | null = null;

    const c = useTableController(() => new GctTableController(props.model));

    c.evt.on('change', async (data, name, val, oldVal) => {
      emit('rowChange', cloneDeep(data), name, val, oldVal);
    });

    if (c.model.local === true) {
      watch(
        () => props.count,
        () => {
          c.setData(cloneDeep(props.data));
        },
      );
    }

    // 要放在 return 之前，避免初始化顺序问题导致加载参数异常
    if (c.model.local !== true && c.model.autoLoad !== false) {
      c.load();
    }

    const findRowId = (el: HTMLElement): string | null => {
      if (!el || el === elRef.value) {
        return null;
      }
      const id = el.getAttribute('data-row-key');
      if (id) {
        return id;
      }
      return findRowId(el.parentElement as HTMLElement);
    };

    const mouseOver = (e: MouseEvent) => {
      const rowId = findRowId(e.target as HTMLElement);
      if (rowId) {
        const row = c.row[rowId];
        if (hoverRow) {
          hoverRow.state.hover = false;
        }
        row.state.hover = true;
        hoverRow = row;
      }
    };

    const mouseOut = (e: MouseEvent) => {
      const rowId = findRowId(e.target as HTMLElement);
      if (!rowId && hoverRow) {
        hoverRow!.state.hover = false;
        hoverRow = null;
      }
    };

    const mouseLeave = (e: MouseEvent) => {
      const rowId = findRowId(e.target as HTMLElement);
      if (!rowId && hoverRow) {
        hoverRow!.state.hover = false;
        hoverRow = null;
      }
    };

    const click = (e: MouseEvent) => {
      const rowId = findRowId(e.target as HTMLElement);
      if (rowId) {
        const row = c.row[rowId];
        if (activeRow) {
          activeRow.unActive();
        }
        row.active();
        activeRow = row;
      } else {
        if (activeRow) {
          activeRow.unActive();
          activeRow = null;
        }
      }
    };

    const winClick = () => {
      if (activeRow) {
        activeRow.unActive();
        activeRow = null;
      }
    };

    onMounted(() => {
      if (elRef.value) {
        elRef.value.addEventListener('mouseover', mouseOver, { capture: true });
        elRef.value.addEventListener('mouseout', mouseOver, { capture: true });
        elRef.value.addEventListener('mouseleave', mouseLeave, { capture: true });
        elRef.value.addEventListener('click', click, { capture: true });
      }
      window.addEventListener('click', winClick, { capture: true });
    });

    onUnmounted(() => {
      if (elRef.value) {
        elRef.value.removeEventListener('mouseover', mouseOver, { capture: true });
        elRef.value.removeEventListener('mouseout', mouseOver, { capture: true });
        elRef.value.removeEventListener('mouseleave', mouseLeave, { capture: true });
        elRef.value.removeEventListener('click', click, { capture: true });
      }
      window.removeEventListener('click', winClick, { capture: true });
    });

    const onValidate = (name: string, status: boolean, errorMsgs: string[]) => {
      const keys = name.split('___');
      if (keys.length === 2) {
        const [name, id] = keys;
        const row = c.row[id];
        if (row) {
          const item = row.item[name] as ITableEditItemController;
          if (item) {
            item.state.error = !status;
            if (errorMsgs && errorMsgs.length > 0) {
              item.state.errMessage = errorMsgs[0];
            } else {
              item.state.errMessage = '';
            }
          }
        }
      }
    };

    const validate = () => {
      return formRef.value.validate();
    };

    const reload = (params) => {
      return c.load(params);
    };

    const pagination = computed<TablePaginationConfig | false>(() => {
      if (isNil(props.model.pagination)) {
        return false;
      }
      const pagination = clone(props.model.pagination);
      defaults(pagination, {
        pageSizeOptions: [10, 20, 30, 40, 50],
        showSizeChanger: true,
        showTotal: true,
      });
      const showTotal =
        pagination.showTotal === true
          ? (total) => t('sys.component.table.total', { total })
          : pagination.showTotal || undefined;

      const sizeOptions = pagination.pageSizeOptions?.map((item) => `${item}`); //ant组件识别纯数字数组的时候不会显示中文

      return {
        class: 'pagination-total-left',
        total: c.state.total,
        current: c.state.page,
        pageSize: c.state.size,
        pageSizeOptions: sizeOptions,
        showSizeChanger: pagination.showSizeChanger,
        showTotal: showTotal,
      } as TablePaginationConfig;
    });

    const handleTableChange: TableProps['onChange'] = (pagination, filters, sorter) => {
      console.log('[ pagination ] >', pagination, filters, sorter);
      c.updatePagination({ page: pagination.current, size: pagination.pageSize });
      c.reload();
    };

    const { scrollHeight } = useAntTableScrollHeight(elRef, {
      pagination: !!pagination.value,
    });

    // 是否有编辑项
    const isEdit = computed(() => {
      return c.model.columns.some((col) => col.type === 'edit');
    });

    return {
      ns,
      c,
      loadingState,
      elRef,
      formRef,
      tableRef,
      scrollHeight,
      pagination,
      isEdit,
      handleTableChange,
      mouseOver,
      mouseOut,
      onValidate,
      validate,
      reload,
    };
  },
  render() {
    return (
      <div ref="elRef" class={this.ns.b()} onMouseover={this.mouseOver} onMouseout={this.mouseOut}>
        <a-form ref="formRef" model={this.c.state.formData} onValidate={this.onValidate}>
          <a-table
            ref="tableRef"
            class={[
              'flex-1',
              this.ns.is('pagination', !!this.pagination),
              this.ns.is('not-edit', !this.isEdit),
            ]}
            scroll={{ y: this.scrollHeight }}
            columns={this.model.columns}
            data-source={this.c.state.items}
            row-key={(record) => record[this.c.model.key]}
            pagination={this.pagination}
            onChange={this.handleTableChange}
            {...this.$attrs}
          >
            {{
              headerCell: ({ title, column }) => {
                const _column = column as ITableEditItem;
                if (_column.type === 'edit' && _column.rules && _column.rules.length > 0) {
                  const isRequired = _column.rules.some((rule) => rule.required === true);
                  return (
                    <span
                      title={title}
                      class={[this.ns.e('table-header'), this.ns.is('required', isRequired)]}
                    >
                      <span class={this.ns.e('table-item')}>{title}</span>
                    </span>
                  );
                }
                return title;
              },
              bodyCell: ({ column, text, record }) => {
                text =
                  text == null && this.model.isEmptyText == true
                    ? nullDisplayEnum[gct.appSetting.emptyDisplay]
                    : isBoolean(text)
                      ? text.toString()
                      : text;
                const _column = column as ITableItem;
                if (_column.customRender) {
                  return _column.customRender({ record });
                }
                if (column.type === 'edit') {
                  const key = record[this.c.model.key];
                  const row = this.c.row[key];
                  if (row) {
                    const provider = this.c.editorProviders[column.name];
                    const com = resolveComponent(provider.component);
                    const item = row.item[column.name] as ITableEditItemController;
                    const isEdit =
                      row.state.hover === true ||
                      item.state.error === true ||
                      row.state.active === true ||
                      this.c.model.rowEditMode === 'all';
                    return (
                      <a-form-item
                        name={`${column.name}___${key}`}
                        class={[this.ns.b('table-item'), this.ns.bm('table-item', 'edit')]}
                        rules={item.model.rules || []}
                      >
                        {h(com, {
                          key: item.model.name,
                          c: item,
                          model: item.model.editor,
                          readonly: item.state.readonly,
                          disabled: item.state.disabled,
                          value: item.value,
                          itemModel: item.model,
                          data: row.data,
                          keepalive: item.state.keepalive,
                          visible: item.state.visible,
                          isEdit,
                          'onUpdate:value': (value: any) => {
                            item.value = value;
                          },
                        })}
                      </a-form-item>
                    );
                  }
                }
                if (column.type === 'actions') {
                  const item = column as ITableActionItem;
                  return (
                    <div class={this.ns.b('table-actions')}>
                      {item.actions
                        .filter((_) => {
                          if (_.hidden) {
                            return !_.hidden(record);
                          }
                          return true;
                        })
                        .map((_) => {
                          if (_.mode === 'divider') {
                            return <a-divider type="vertical" />;
                          }
                          const loadingKey = `${_.type}___${_.tag}___${record[this.c.model.key]}`;
                          const button = (
                            <a-button
                              class={this.ns.b('table-action-item')}
                              type={_.type}
                              size="small"
                              loading={this.loadingState[loadingKey] === true}
                              onClick={async (e: MouseEvent) => {
                                if (_.confirm) {
                                  return;
                                }
                                e.stopPropagation();
                                if (_.action) {
                                  if (isPromise(_.action) || isAsync(_.action)) {
                                    this.loadingState[loadingKey] = true;
                                    try {
                                      await _.action(record);
                                    } catch (error) {
                                      console.log(error);
                                    } finally {
                                      this.loadingState[loadingKey] = false;
                                    }
                                  } else {
                                    _.action(record);
                                  }
                                } else {
                                  item.action(_.tag, record);
                                }
                              }}
                              {..._.props}
                            >
                              {_.text}
                            </a-button>
                          );
                          if (_.confirm) {
                            return (
                              <a-popconfirm
                                onConfirm={async () => {
                                  if (_.action) {
                                    if (isPromise(_.action) || isAsync(_.action)) {
                                      this.loadingState[loadingKey] = true;
                                      try {
                                        await _.action(record);
                                      } catch (error) {
                                        console.log(error);
                                      } finally {
                                        this.loadingState[loadingKey] = false;
                                      }
                                    } else {
                                      _.action(record);
                                    }
                                  } else {
                                    item.action(_.tag, record);
                                  }
                                }}
                                {..._.confirm}
                              >
                                {button}
                              </a-popconfirm>
                            );
                          } else {
                            return button;
                          }
                        })}
                    </div>
                  );
                }
                if (column.type === 'link') {
                  return (
                    <a
                      class={this.ns.e('table-link')}
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        if (_column.click) {
                          _column.click(record);
                        }
                      }}
                    >
                      {text}
                    </a>
                  );
                }
                return text;
              },
            }}
          </a-table>
        </a-form>
      </div>
    );
  },
});
