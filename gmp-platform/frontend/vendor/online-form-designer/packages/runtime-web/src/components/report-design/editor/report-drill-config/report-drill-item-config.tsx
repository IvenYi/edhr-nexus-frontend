import { computed, defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { FieldIconMap, IModalData, IPopoverOptions } from '@gct/runtime';
import { IReportField } from '../../interface';
import { useReportViewController } from '../../hooks';
import { DrillTypeEnum } from '../../schema';
import { ReportDefaultDrill } from './modal/report-default-drill';
import { ReportCustomDrill } from './modal/report-custom-drill';
import { FloatingUIConfig } from '../../../app-popover/app-popover-component';
import { REPORT_TYPE } from '../../constants';
import './report-drill-item-config.scss';

export const ReportDrillItemConfig = defineComponent({
  name: 'ReportDrillItemConfig',
  props: {
    field: {
      type: Object as PropType<IReportField>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('report-drill-item-config');

    const reportView = useReportViewController();

    if (!props.field.drillMode) {
      props.field.drillMode = DrillTypeEnum.DEFAULT;
    }

    const items = computed({
      get() {
        return props.field.drillAttrs ? props.field.drillAttrs.split(',') : [];
      },
      set(keys: string[] = []) {
        props.field.drillAttrs = keys.join(',');
        reportView.updateSchema();
      },
    });

    async function onOpenDrillAttrsModal(e: MouseEvent): Promise<void> {
      const res = await window.gct.openUtil.popover<IModalData>(
        e.target as HTMLElement,
        ReportDefaultDrill,
        {
          field: props.field,
          schema: reportView.state.schema,
          provider: reportView.provider,
        },
        { placement: 'bottom-start' } as IPopoverOptions<FloatingUIConfig>,
      );
      if (res.ok) {
        reportView.updateSchema();
      }
    }

    async function onEditReportDrill(): Promise<boolean> {
      const res = await window.gct.openUtil.modal<IModalData>(
        ReportCustomDrill,
        {
          field: props.field,
          schema: reportView.state.schema,
          selectReport: props.field.drillReport,
          selectReportName: props.field.drillReportName,
          selectReportType: props.field.drillReportType,
        },
        { title: '自定义下钻', width: '640px', height: '360px' },
      );
      if (res.ok && res.data) {
        props.field.drillReport = res.data[0].reportId;
        props.field.drillReportName = res.data[0].reportName;
        props.field.drillReportType = res.data[0].reportType;
        reportView.updateSchema();
        return true;
      }
      if (!props.field.drillReport) {
        props.field.drillMode = DrillTypeEnum.DEFAULT;
        reportView.updateSchema();
      }
      return false;
    }

    async function onSelectChange(val: string): Promise<void> {
      if (val === DrillTypeEnum.CUSTOM) {
        if (!onEditReportDrill()) {
          props.field.drillMode = DrillTypeEnum.DEFAULT;
        }
      }
      reportView.updateSchema();
    }

    function onEditReport() {
      onEditReportDrill();
    }

    function onDeleteReport() {
      props.field.drillReport = undefined;
      props.field.drillReportName = undefined;
      props.field.drillMode = DrillTypeEnum.DEFAULT;
      reportView.updateSchema();
    }

    return {
      ns,
      reportView,
      items,
      onOpenDrillAttrsModal,
      onSelectChange,
      onEditReport,
      onDeleteReport,
    };
  },
  render() {
    const isDrill = !!this.field.drillAttrs;
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('header')}>
          <div class={this.ns.e('icon')}>
            <i class={['iconfont', FieldIconMap[this.field.fieldType] || 'icon-zidingyi']}></i>
          </div>
          <div class={this.ns.e('title')} title={this.field.fieldName}>
            {this.field.fieldName}
          </div>
          <div class={this.ns.e('select')}>
            <a-select
              v-model:value={this.field.drillMode}
              size="small"
              placeholder="请选择"
              onChange={this.onSelectChange}
            >
              <a-select-option value={DrillTypeEnum.DEFAULT}>默认下钻</a-select-option>
              <a-select-option value={DrillTypeEnum.CUSTOM}>自定义下钻</a-select-option>
            </a-select>
          </div>
          {this.field.drillMode === DrillTypeEnum.CUSTOM
            ? null
            : [
                <div
                  class={[this.ns.e('action'), this.ns.is('active', isDrill)]}
                  onClick={this.onOpenDrillAttrsModal}
                >
                  <a-tooltip title={'设置钻取层级'}>
                    <span class={this.ns.e('action-icon')}>
                      <i class="iconfont icon-a-zuanqu2" />
                    </span>
                  </a-tooltip>
                </div>,
                <div class={[this.ns.e('line'), this.ns.e('half-line')]}></div>,
              ]}
        </div>
        {this.field.drillMode === DrillTypeEnum.CUSTOM && this.field.drillReport ? (
          <div class={this.ns.e('report-body')}>
            <div class={this.ns.e('report-body-title')}>目标报表</div>
            <div class={this.ns.e('report-body-content')}>
              <div class={this.ns.e('report-body-label')}>
                <span class={this.ns.em('report-body-label', 'icon')}>
                  <i
                    class={[
                      'iconfont',
                      this.field.drillReportType === REPORT_TYPE.CROSS_TABLE
                        ? 'icon-jiaochabiao'
                        : 'icon-a-biaoge_table-file4',
                    ]}
                  />
                </span>
                <span class={this.ns.em('report-body-label', 'title')}>
                  {this.field.drillReportName}
                </span>
              </div>
              <div class={this.ns.e('report-body-actions')}>
                <a-button
                  type="text"
                  size="small"
                  icon={<i class="iconfont icon-a-Single-linetext" />}
                  onClick={this.onEditReport}
                />
                <a-button
                  type="text"
                  size="small"
                  icon={<i class="iconfont icon-shanchu1" />}
                  onClick={this.onDeleteReport}
                />
              </div>
            </div>
          </div>
        ) : null}
        {this.field.drillMode === DrillTypeEnum.DEFAULT && this.items.length > 0 ? (
          <div class={this.ns.e('body')}>
            {this.items.map((key) => {
              const field = this.reportView.state.schema.drillMap[key];
              return (
                <div class={this.ns.e('field')}>
                  <div class={this.ns.e('field-icon')}>
                    <i class={['iconfont', FieldIconMap[field.fieldType] || 'icon-zidingyi']} />
                  </div>
                  <div class={this.ns.e('field-title')}>{field.fieldName}</div>
                  <div class={this.ns.e('dot')}></div>
                  <div class={this.ns.e('line')}></div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  },
});
