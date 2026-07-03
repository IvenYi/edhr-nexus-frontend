import { computed, defineComponent, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { useReportViewController } from '../hooks';
import { REPORT_MODE, REPORT_TYPE } from '../constants';
import './report-config.scss';

export const ReportConfig = defineComponent({
  name: 'ReportConfig',
  setup() {
    const ns = useNamespace('report-config');

    const mode = ref<REPORT_MODE>(REPORT_MODE.TABLE);

    const formRef = ref();

    const c = useReportViewController();

    c.hooks.save.before.tapPromise(async (ctx) => {
      if (formRef.value) {
        const bol = await formRef.value.c.validate();
        if (bol !== true) {
          ctx.isSave = false;
        }
      }
    });

    const formData = computed({
      get() {
        const count = c.state.count;
        console.log(count);
        return c.state.schema;
      },
      set(data) {
        c.updateSchema(data);
      },
    });

    function onChangeReportType(type: REPORT_TYPE): void {
      c.state.data.reportType = type;
      c.updateSchema({ reportType: type });
    }

    return { ns, mode, formRef, c, formData, provider: c.provider, onChangeReportType };
  },
  render() {
    return (
      <div key={this.c.state.schema.modelKey} count={this.c.state.count} class={this.ns.b()}>
        <div class={this.ns.e('type-select')}>
          <div class={this.ns.e('type-select-title')}>
            <a-select v-model:value={this.mode} size="small">
              <a-select-option key={REPORT_MODE.ALL} value={REPORT_MODE.ALL}>
                全部
              </a-select-option>
              <a-select-option key={REPORT_MODE.TABLE} value={REPORT_MODE.TABLE}>
                表格
              </a-select-option>
            </a-select>
          </div>
          <div class={this.ns.e('type-select-actions')}>
            <div
              class={[
                this.ns.e('type-select-actions-icon'),
                this.ns.is('active', this.c.state.schema.reportType === REPORT_TYPE.SCHEDULE_TABLE),
              ]}
              onClick={() => this.onChangeReportType(REPORT_TYPE.SCHEDULE_TABLE)}
            >
              <a-tooltip overlayClassName={this.ns.e('report-tooltip')}>
                {{
                  default: () => {
                    return <i class="iconfont icon-a-biaoge_table-file4" />;
                  },
                  title: () => {
                    return (
                      <div>
                        <div class={this.ns.e('type-select-tooltip-title')}>明细表</div>
                        <div>至少&nbsp;1&nbsp;个列/行（维度或度量）</div>
                      </div>
                    );
                  },
                }}
              </a-tooltip>
            </div>
            <div
              class={[
                this.ns.e('type-select-actions-icon'),
                this.ns.is('active', this.c.state.schema.reportType === REPORT_TYPE.CROSS_TABLE),
              ]}
              onClick={() => this.onChangeReportType(REPORT_TYPE.CROSS_TABLE)}
            >
              <a-tooltip overlayClassName={this.ns.e('report-tooltip')}>
                {{
                  default: () => {
                    return <i class="iconfont icon-jiaochabiao" />;
                  },
                  title: () => {
                    return (
                      <div>
                        <div class={this.ns.e('type-select-tooltip-title')}>交叉表</div>
                        <div>至少 1 个行（维度）或列（维度）或指标（度量）</div>
                      </div>
                    );
                  },
                }}
              </a-tooltip>
            </div>
          </div>
        </div>
        <div class={this.ns.e('form')}>
          {this.provider ? (
            <gct-edit-form
              ref="formRef"
              key={this.provider.type}
              v-model:data={this.formData}
              model={this.provider.formModel}
              count={this.c.state.count}
              embed
            />
          ) : null}
        </div>
      </div>
    );
  },
});
