import { defineComponent, onUnmounted } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { ReportJumpModal } from './modal/report-jump-modal';
import { useReportViewController } from '../../hooks';
import { cloneDeep, merge } from 'lodash-es';
import { FieldIconMap, IModalData, useGctFormValue } from '@gct/runtime';
import { IReportField, IReportLinkItem } from '../../interface';
import './report-jump-config.scss';

export const ReportJumpConfig = defineComponent({
  name: 'ReportJumpConfig',
  props: {
    value: {
      type: Array,
      default: () => [],
    }
  },
  setup() {
    const ns = useNamespace('report-jump-config');
    const val = useGctFormValue<IReportLinkItem[]>();

    const reportView = useReportViewController();

    function onFieldDelete(_, field: IReportField) {
      const i = val.value.findIndex(v => v.field === field.id);
      if (i > -1) {
        val.value.splice(i, 1);
        val.value = val.value;
      }
    }

    reportView.hooks.field.delete.tap(onFieldDelete);

    onUnmounted(() => {
      reportView.hooks.field.delete.removeTap(onFieldDelete);
    });

    async function openConfig(): Promise<void> {
      const res = await window.gct.openUtil.modal<IModalData>(
        ReportJumpModal,
        {
          reportData: merge(cloneDeep(reportView.state.schema), { reportName: reportView.state.data.name }),
          items: cloneDeep(val.value),
        },
        {
          title: '跳转配置',
          width: 800,
          height: 640,
        },
      );
      if (res.ok && res.data) {
        val.value = res.data as IReportLinkItem[];
      }
    }

    function onInit(): void {
      val.value = val.value.filter((item: IReportLinkItem) => {
        const field = reportView.state.schema.fieldMap[item.field!];
        if (field) {
          return true;
        }
        return false;
      })
    }

    onInit();

    return { ns, val, reportView, openConfig };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('header')}>
          <span class={this.ns.e('title')}>跳转</span>
          <span class={this.ns.e('action')}>
            <a-button type="link" onClick={this.openConfig}>
              跳转配置
            </a-button>
          </span>
        </div>
        <div class={this.ns.e('info')}>点击当前报表数据，跳转至其他报表或网页链接</div>
        <div class={this.ns.e('body')}>
          {this.val.map((item: IReportLinkItem) => {
            const field = this.reportView.state.schema.fieldMap[item.field!];
            if (!field) {
              return null;
            }
            return <div class={this.ns.e('item')}>
              <span class={this.ns.e('item-icon')}>
                <i class={['iconfont', FieldIconMap[field.fieldType] || 'icon-zidingyi']}></i>
              </span>
              <span class={this.ns.e('item-title')}>
                {field.fieldName}
              </span>
            </div>
          })}
        </div>
      </div>
    );
  },
});
