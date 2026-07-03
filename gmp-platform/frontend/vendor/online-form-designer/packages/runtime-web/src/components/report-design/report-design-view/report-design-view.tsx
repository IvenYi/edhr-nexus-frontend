import { createVNode, defineComponent, h, PropType, ref } from 'vue';
import { IModal, useNamespace } from '@gct-paas/core';
import { useAppInst } from '@gct/runtime';
import { ModalNameEditor } from '../../modal-name-editor/modal-name-editor';
import { useReportViewController } from '../hooks';
import { ReportConfig } from '../report-config/report-config';
import { ShrinkPanel } from '../../shrink-panel/shrink-panel';
import { ReportDataConfig } from '../report-data-config/report-data-config';
import ReportEditor from '../editor';
import { REPORT_TYPE } from '../constants';
import { Button, Modal, ModalFuncProps } from 'ant-design-vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import Empty from '../report-table/table/components/empty.vue';
import './report-design-view.scss';

/**
 * 报表设计界面
 */
export const ReportDesignView = defineComponent({
  name: 'ReportDesignView',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    // 编辑时给的报表标识
    id: {
      type: String,
    },
    // 新建时给的报表类型
    reportType: {
      type: Object as PropType<REPORT_TYPE>,
      default: REPORT_TYPE.SCHEDULE_TABLE,
    },
    // 分类id
    categoryId: {
      type: String,
    },
    isDesign: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const app = useAppInst();
    app.use(ReportEditor);

    const t = (window as any).$t;

    const ns = useNamespace('report-design-view');
    // 报表名称输入框
    const nameInputRef = ref(null);
    // 报表设计界面总控制器
    const c = useReportViewController();
    // 保存报表
    function onSave() {
      return c.save(props.modal as any);
    }

    // 保存并发布
    function onSaveAndPublish() {
      return c.saveAndPublish(props.modal as any);
    }
    // 保存名称
    async function onSaveName(name: string) {
      c.state.data.name = name;
      if (c.state.data.id) {
        await c.updateName();
      }
    }

    let cfg: {
      destroy: () => void;
      update: (newConfig: ModalFuncProps) => void;
    } | null = null;

    const onClose = () => {
      if (c.state.modified === true) {
        if (cfg) {
          return;
        }
        cfg = Modal.confirm({
          title: t('sys.designView.saveConfirm.title'),
          icon: createVNode(ExclamationCircleFilled),
          mask: false,
          content: h('div', {}, [
            h('span', {}, t('sys.designView.saveConfirm.content')),
            h(
              Button,
              {
                type: 'link',
                class: 'continue-btn',
                onClick: () => {
                  cfg?.destroy();
                  cfg = null;
                },
              },
              t('sys.app.continueEdit'),
            ),
          ]),
          cancelText: t('sys.designView.saveConfirm.cancel'),
          okText: t('sys.designView.saveConfirm.confirm'),
          wrapClassName: ns.b('confirm-dialog'),
          onCancel() {
            cfg?.destroy();
            cfg = null;
            props.modal.dismiss({ ok: false });
          },
          onOk: async () => {
            await c.onSave();
            props.modal.dismiss({ ok: true });
            cfg?.destroy();
            cfg = null;
          },
        });
        return;
      }
      props.modal.dismiss({ ok: true });
    };

    // 加载报表数据
    c.load(props.reportType, props.id, props.categoryId);

    return {
      ns,
      nameInputRef,
      c,
      provider: c.provider,
      onSave,
      onSaveName,
      onClose,
      onSaveAndPublish,
    };
  },
  render() {
    if (!this.c.state.loaded) {
      return null;
    }
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('header')}>
          <div class={this.ns.e('header-left')}>
            <span class={this.ns.em('header', 'icon')} onClick={this.onClose}>
              <i class="iconfont icon-a-Leftarrow" />
            </span>
            <span class={this.ns.em('header', 'title')}>
              <div class={this.ns.m('report-categorize')}>报表中心</div>
              <div class={this.ns.e('report-info')}>
                <ModalNameEditor v-model:value={this.c.state.data.name} save={this.onSaveName} />
              </div>
            </span>
          </div>
          <div class={this.ns.e('header-right')}>
            {this.c.state?.data?.publish ? null : (
              <a-button
                loading={this.c.state.saving}
                onClick={this.onSave}
                disabled={!this.c.state.schema.modelKey}
              >
                保存
              </a-button>
            )}
            <a-button
              type="primary"
              loading={this.c.state.saving}
              onClick={this.onSaveAndPublish}
              disabled={!this.c.state.schema.modelKey}
            >
              保存并发布
            </a-button>
          </div>
        </div>
        <div class={this.ns.e('body')}>
          <div class={this.ns.e('body-left')} id="reportTable">
            {this.c.provider && this.c.state.schema?.reportType && this.c.state.schema?.modelKey ? (
              h(this.provider.previewComponent, {
                schema: this.c.state.runtimeSchema,
                reportName: this.c.state.data.name,
              })
            ) : (
              <Empty isDesign={this.isDesign} reportType={this.c.state.schema?.reportType} />
            )}
          </div>
          <div class={this.ns.e('body-right')}>
            <ShrinkPanel
              title={
                this.c.state.schema?.reportType === REPORT_TYPE.CROSS_TABLE ? '交叉表' : '明细表'
              }
              retractedSuffix="配置"
            >
              <ReportConfig />
            </ShrinkPanel>
            <ShrinkPanel title="数据">
              <ReportDataConfig />
            </ShrinkPanel>
          </div>
        </div>
      </div>
    );
  },
});
