import { computed, defineComponent, onUnmounted, PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { FieldIconMap, FieldMetaDTO } from '@gct/runtime';
import { AsyncSeriesHook } from 'qx-util';
import { ITableReportField } from '../../../interface';
import './report-default-drill-item.scss';

export const ReportDefaultDrillItem = defineComponent({
  name: 'ReportDefaultDrillItem',
  props: {
    size: {
      type: Number,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    data: {
      type: Object as PropType<ITableReportField>,
      required: true,
    },
    fields: {
      type: Array<FieldMetaDTO>,
      required: true,
    },
    hook: {
      type: Object as PropType<AsyncSeriesHook<void, { isClose: boolean }>>,
      required: true,
    },
  },
  emits: ['delete'],
  setup(props, { emit }) {
    const ns = useNamespace('report-default-drill-item');

    const elRef = ref<HTMLElement | null>(null);
    // 是否有错误，字段未选择时则为true
    const isError = ref<boolean>(false);

    const getParentNode = computed<HTMLElement>(() => {
      return elRef.value?.parentNode!.parentNode!.parentNode!.parentNode!.parentNode as HTMLElement;
    });

    async function onValidate(ctx: { isClose: boolean }): Promise<void> {
      if (props.size <= 1) {
        return;
      }
      if (!props.data.field || props.data.field === '') {
        isError.value = true;
        ctx.isClose = false;
      }
    }

    function getSelectContainer(): HTMLElement {
      return getParentNode.value;
    }

    function onFieldChange(value: string): void {
      const f = props.fields.find((f) => f.key === value);
      if (f && props.data) {
        Object.assign(props.data, {
          field: f.key,
          fieldName: f.name,
          fieldType: f.type,
        });
      }
      if (value) {
        isError.value = false;
      }
    }

    function onDeleteItem(field: string): void {
      emit('delete', field);
    }

    props.hook.tapPromise(onValidate);

    onUnmounted(() => {
      props.hook.removeTapPromise(onValidate);
    });

    return { ns, isError, elRef, getSelectContainer, onFieldChange, onDeleteItem };
  },
  render() {
    return (
      <div ref="elRef" class={[this.ns.b(), this.ns.is('error', this.isError)]}>
        <div class={this.ns.e('select')}>
          <a-select
            v-model:value={this.data.field}
            placeholder="请选择字段"
            getPopupContainer={this.getSelectContainer}
            onChange={this.onFieldChange}
            allowClear
            show-search
            filter-option={(input: string, option: any) => {
              console.log('filter-option', option);
              return option.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            }}
          >
            {this.fields.map((field) => (
              <a-select-option key={field.key} value={field.key} label={field.name}>
                <span class={this.ns.e('select-icon')}>
                  <i class={'iconfont ' + FieldIconMap[field.type!] || 'icon-zidingyi'} />
                </span>
                <span class={this.ns.e('select-title')}>{field.name}</span>
              </a-select-option>
            ))}
          </a-select>
        </div>
        <div class={[this.ns.e('actions'), this.ns.is('hidden', this.size <= 1)]}>
          <a-button
            type="text"
            size="small"
            icon={<i class="iconfont icon-shanchu1" />}
            onClick={this.onDeleteItem}
          />
          <a-button
            type="text"
            class="drag-handle"
            size="small"
            icon={<i class="iconfont icon-drag" />}
          />
        </div>
        <div v-show={this.isError} class={this.ns.e('error-info')}>
          请选择字段
        </div>
        <div class={this.ns.e('dot')}></div>
        <div class={this.ns.e('line')}></div>
      </div>
    );
  },
});
