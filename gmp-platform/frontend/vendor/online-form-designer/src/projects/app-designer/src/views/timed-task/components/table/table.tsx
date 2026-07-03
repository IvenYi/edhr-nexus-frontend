/* eslint-disable vue/no-mutating-props */
import { defineComponent, ref, reactive, watch } from 'vue';
import { useNamespace } from '@gct/runtime';
import { PlusOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { BasicColumn } from '/@/components/Table';
import { TimedTaskAction } from '../../constant';
import { ITimedTaskItem } from '../../interface';
import { TimedTaskController } from '../../controller';
import './table.scss';

export const TimedTaskTable = defineComponent({
  name: 'TimedTaskTable',
  props: {
    c: {
      type: TimedTaskController,
      required: true,
    },
    items: {
      type: Array as () => ITimedTaskItem[],
      default: () => [],
    },
  },
  emits: ['action', 'search'],
  setup(props, { emit }) {
    const { t } = useI18n() as any;
    const ns = useNamespace('timed-task-table');

    const searchValue = ref('');

    const pagination = reactive({
      pageSize: props.c.state.pageSize,
      total: props.c.state.totalCount,
      current: props.c.state.pageNo,
    });

    const onChange = (p) => {
      props.c.state.pageNo = p.current;
      props.c.state.pageSize = p.pageSize;
      props.c.fetch();
    };

    watch(
      () => props.c.state,
      () => {
        pagination.pageSize = props.c.state.pageSize;
        pagination.total = props.c.state.totalCount;
        pagination.current = props.c.state.pageNo;
      },
      { deep: true },
    );

    const columns: BasicColumn[] = [
      {
        title: t('sys.appDesigner.timedTask.entity.name'),
        dataIndex: 'name',
        fixed: 'left',
      },
      {
        title: t('sys.appDesigner.timedTask.entity.state'),
        dataIndex: 'state',
        width: 74,
      },
      {
        title: t('sys.appDesigner.timedTask.entity.type'),
        dataIndex: 'type',
        width: 145,
      },
      {
        title: t('sys.appDesigner.timedTask.entity.mode'),
        dataIndex: 'sourceType',
        width: 148,
      },
      {
        title: t('sys.appDesigner.timedTask.entity.service'),
        dataIndex: 'sourceId',
      },
      {
        title: t('sys.appDesigner.timedTask.entity.updateDate'),
        dataIndex: 'updateDate',
        minWidth: 170,
        width: 170,
      },
      {
        title: t('sys.appDesigner.timedTask.entity.updateMan'),
        dataIndex: 'updateMain',
        width: 88,
      },
      {
        width: 250,
        title: t('sys.appDesigner.operate'),
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    ];

    const onAction = (record: any, type: string) => {
      emit('action', record, type);
    };

    const onSearch = (value: string) => {
      props.c.search(value);
    };

    return { t, ns, pagination, searchValue, columns, onAction, onSearch, onChange };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <basic-table
          striped={false}
          bordered={true}
          showIndexColumn={false}
          ellipsis={true}
          ref="tableRef"
          columns={this.columns}
          dataSource={this.items}
          pagination={this.pagination}
          onChange={this.onChange}
        >
          {{
            toolbar: () => (
              <div class={this.ns.b('header')}>
                <div class={this.ns.b('header-toolbar')}>
                  <a-button
                    class={this.ns.b('header-toolbar-item')}
                    type="primary"
                    onClick={() => this.onAction(null, TimedTaskAction.ADD)}
                  >
                    {{
                      default: () => this.t('sys.appDesigner.timedTask.newTask'),
                      icon: () => <PlusOutlined />,
                    }}
                  </a-button>
                </div>
                <div class={this.ns.be('header', 'quick-search')}>
                  <a-input-search
                    v-model:value={this.searchValue}
                    placeholder={this.t('sys.appDesigner.timedTask.searchPlaceholder')}
                    onSearch={this.onSearch}
                  ></a-input-search>
                </div>
              </div>
            ),
            action: ({ record }) => {
              const actions = [
                {
                  label: this.t('sys.appDesigner.timedTask.grid.actions.edit'),
                  onClick: () => this.onAction(record, TimedTaskAction.EDIT),
                },
                {
                  label: this.t('sys.appDesigner.timedTask.grid.actions.delete'),
                  props: { class: 'delete' },
                  popConfirm: {
                    title: this.t('sys.appDesigner.timedTask.grid.confirm.title'),
                    confirm: () => {
                      this.onAction(record, TimedTaskAction.DELETE);
                    },
                  },
                },
                record.state === 'ENABLED'
                  ? {
                      label: this.t('sys.appDesigner.timedTask.grid.actions.disable'),
                      color: 'error',
                      popConfirm: {
                        title: this.t('sys.appDesigner.timedTask.grid.confirm.title'),
                        confirm: () => {
                          this.onAction(record, TimedTaskAction.DISABLE);
                        },
                      },
                    }
                  : {
                      label: this.t('sys.appDesigner.timedTask.grid.actions.enable'),
                      color: 'success',
                      popConfirm: {
                        title: this.t('sys.appDesigner.timedTask.grid.confirm.title'),
                        confirm: () => {
                          this.onAction(record, TimedTaskAction.ENABLE);
                        },
                      },
                    },
                {
                  label: this.t('sys.appDesigner.timedTask.grid.actions.manualExecution'),
                  color: 'success',
                  popConfirm: {
                    title: this.t('sys.appDesigner.timedTask.grid.confirm.title'),
                    confirm: () => {
                      this.onAction(record, TimedTaskAction.MANUAL_EXECUTION);
                    },
                  },
                },
              ];
              return <table-action class={this.ns.b('column-actions')} actions={actions} />;
            },
            bodyCell: ({ column, text, record }) => {
              if (column.dataIndex === 'state') {
                return (
                  <span
                    class={[
                      this.ns.e('state-row'),
                      this.ns.is('disable', record.state === 'DISABLED'),
                    ]}
                  >
                    {record.state === 'DISABLED'
                      ? this.t('sys.appDesigner.timedTask.grid.actions.disable')
                      : this.t('sys.appDesigner.timedTask.grid.actions.enable')}
                  </span>
                );
              }
              if (column.dataIndex === 'type' && text) {
                return this.c.state.triggerTypeMap[text];
              }
              if (column.dataIndex === 'sourceType' && text) {
                return this.c.state.triggerModeMap[text];
              }
              if (column.dataIndex === 'sourceId' && text) {
                if (record.sourceType === 'SCRIPT_SERVICE') {
                  return this.c.state.triggerScriptServiceMap[text];
                }
                if (record.sourceType === 'SO_SERVICE') {
                  return this.c.state.triggerArrangeServiceMap[text];
                }
              }
              return null;
            },
          }}
        </basic-table>
      </div>
    );
  },
});
