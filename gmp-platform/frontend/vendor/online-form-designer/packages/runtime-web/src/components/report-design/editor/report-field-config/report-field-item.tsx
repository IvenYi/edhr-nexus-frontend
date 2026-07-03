import { defineComponent, h, PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { ReportFieldContextMenu } from './report-field-context-menu';
import { IFieldContextItem, ITableReportField } from '../../interface';
import { ReportFieldChange } from './report-field-change';
import { FieldIconMap, IGctDndData, IModalData } from '@gct/runtime';
import { MENU_ACTION } from '../../constants';
import { ReportNameChange, modalTitle, SignatureConfig } from '../../components';
import { dimensionEnum, summaryCalculationNameMap } from '../../schema';
import { useReportViewController } from '../../hooks';
import { ReportFieldTooltip } from './report-field-tooltip';
import './report-field-item.scss';

export const ReportFieldItem = defineComponent({
  name: 'ReportFieldItem',
  props: {
    data: {
      type: Object as PropType<ITableReportField>,
      required: true,
    },
    items: {
      type: Array as PropType<IGctDndData[]>,
      default: () => [],
    },
    model: {
      type: Object as PropType<ITableReportField>,
      required: true,
    },
    openSelectedId: {
      type: String,
    },
  },
  emits: ['update:items', 'delete', 'update:openSelectedId', 'replace'],
  setup(props, { emit }) {
    const ns = useNamespace('report-field-item');

    const rootRef = ref();

    const reportView = useReportViewController();

    const operateType = 'REPLACE';

    const selectedItems = ref();

    function changeField(id: string): void {
      selectedItems.value = props.items;
      emit('update:openSelectedId', id);
    }
    function closeAddSelect(value): void {
      emit('update:items', selectedItems.value);
      emit('update:openSelectedId', null);
      emit('replace', value, props.data);
    }

    async function onMenuClick(action: IFieldContextItem): Promise<void> {
      if (action.name === MENU_ACTION.DELETE) {
        emit('delete', props.data);
      } else if (action.name === MENU_ACTION.CHANGE_NAME) {
        const res = await gct.openUtil.modal<IModalData>(
          ReportNameChange,
          { data: props.data },
          { title: '修改显示名称', width: '640px', height: '362px' },
        );
        if (res.ok && res.data) {
          const data = res.data[0];
          Object.assign(props.data, data);
          reportView.updateSchema();
        }
      } else if (action.name === MENU_ACTION.CHANGE_SIGNATURE) {
        console.log('props', props);
        const res = await gct.openUtil.modal<IModalData>(
          SignatureConfig,
          { data: props.data },
          {
            title: h(modalTitle, { name: '签名格式', field: props.data.fieldName }),
            width: '640px',
            height: '362px',
          },
        );
        if (res.ok && res.data) {
          console.log('res.data', res.data, props.data);
          const data = res.data[0];
          Object.assign(props.data, data);
          reportView.updateSchema();
        }
      }
    }

    return {
      ns,
      rootRef,
      changeField,
      closeAddSelect,
      props,
      operateType,
      selectedItems,
      onMenuClick,
    };
  },
  render() {
    return (
      <div>
        <div ref="rootRef" class={this.ns.b()}>
          <div class={this.ns.e('handle')}>
            <i class="iconfont icon-drag" />
          </div>
          <div class={this.ns.e('body')}>
            <a-tooltip
              overlayClassName={this.ns.b('tooltip')}
              placement="left"
              align={{
                offset: [-22, 0],
              }}
            >
              {{
                title: () => {
                  return <ReportFieldTooltip data={this.data} />;
                },
                default: () => {
                  return (
                    <div class={this.ns.e('content')}>
                      <span class={this.ns.e('item-icon')}>
                        <i
                          class={['iconfont', FieldIconMap[this.data.fieldType] || 'icon-zidingyi']}
                        ></i>
                      </span>
                      <span class={this.ns.e('item-title')}>
                        {this.data.fieldName}
                        {this.model.dimension === dimensionEnum.INDICATOR &&
                        this.data.polymerization_function
                          ? `（${summaryCalculationNameMap[this.data.polymerization_function]}）`
                          : ''}
                      </span>
                    </div>
                  );
                },
              }}
            </a-tooltip>
          </div>
          <div
            class={[
              this.ns.e('actions'),
              this.data.id === this.props.openSelectedId ? this.ns.e('actions-active') : '',
            ]}
          >
            <div class={this.ns.e('action-change')}>
              <a-tooltip placement="top">
                {{
                  title: () => {
                    return '替换';
                  },
                  default: () => {
                    return <retweet-outlined onClick={() => this.changeField(this.data.id)} />;
                  },
                }}
              </a-tooltip>
            </div>
            <div
              class={[
                this.data.id === this.props.openSelectedId ? this.ns.e('config-none') : '',
                this.ns.e('action-config'),
              ]}
            >
              <ReportFieldContextMenu data={this.data} onMenu-click={this.onMenuClick} />
            </div>
          </div>
        </div>
        {this.data.id === this.props.openSelectedId ? (
          <ReportFieldChange
            data={this.data}
            v-model:selectItems={this.selectedItems}
            model={this.props.model}
            closeAddSelect={this.closeAddSelect}
            operateType={this.operateType}
          />
        ) : undefined}
      </div>
    );
  },
} as any);
