import { createVNode, defineComponent, onUnmounted, PropType, h, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IModal, IModalData } from '@gct/runtime';
import { DesignViewLayout } from '../../design-view-layout/design-view-layout';
import { DataResource } from '../components/data-resource';
import { useReportDataSetDesignStore } from '../store';
import { ModelConfig } from '../widgets/model-config';
import { initX6 } from '../x6';
import { ReportDataSetStep } from '../enums';
import { Button, message, Modal, ModalFuncProps } from 'ant-design-vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import { ReportDataSetSave } from './report-data-set-save';
import { FieldsConfig } from '../widgets/fields-config';
import './report-data-set-design.scss';

initX6();

export const ReportDataSetDesign = defineComponent({
  name: 'ReportDataSetDesign',
  props: {
    id: {
      type: String,
    },
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
  },
  setup(props) {
    const t = (window as any).$t;
    const ns = useNamespace('report-data-set-design');
    const fieldRef = ref();
    const store = useReportDataSetDesignStore();
    // 初始化数据集设计存储
    store.$reset();

    // DataResource 展开状态
    const dataResourceExpanded = ref(true);
    // 下一步
    async function onNext() {
      if ((await validateLinkConfig()) !== true) {
        return;
      }
      if (store.step === ReportDataSetStep.MODEL_CONFIG) {
        store.step = ReportDataSetStep.FIELD_CONFIG;
      }
    }
    // 验证连线配置是否通过
    async function validateLinkConfig(): Promise<boolean> {
      if (store.step === ReportDataSetStep.MODEL_CONFIG) {
        if (store.links && store.links.length > 0) {
          const valid = await store.validateLinks();
          return valid;
        }
      }
      return true;
    }
    // 验证属性配置是否通过
    async function validateFieldConfig(): Promise<boolean> {
      if (store.step === ReportDataSetStep.FIELD_CONFIG) {
        const errors = await fieldRef.value.validate();
        if (errors && errors.length > 0) {
          let msgs: string[] = [];
          errors.forEach((errItem: any) => {
            if (errItem.errors && errItem.errors.length > 0) {
              msgs.push(...errItem.errors);
            }
          });
          msgs = Array.from(new Set(msgs)); // 去重
          if (msgs.includes('请输入显示名称')) {
            message.error(t('sys.dataSet.pleaseInputFieldLabelErr'));
          } else if (msgs.includes('字段KEY重复，请重新输入')) {
            message.error(t('sys.dataSet.fieldKeyDuplicateErr'));
          }
          return false;
        }
      }
      return true;
    }
    // 设置当前步骤
    async function onChangeStep(step: ReportDataSetStep) {
      if ((await validateLinkConfig()) !== true) {
        return;
      }
      if (step === ReportDataSetStep.FIELD_CONFIG && store.nodes.length === 0) {
        return;
      }
      store.step = step;
    }
    // 保存
    async function onSave(): Promise<void> {
      if ((await validateFieldConfig()) !== true) {
        return;
      }
      if ((await validateLinkConfig()) !== true) {
        return;
      }
      const res = await window.gct.openUtil.modal<IModalData>(
        ReportDataSetSave,
        { data: store.data },
        { title: t('sys.dataSet.saveTitle'), width: '640px', height: '370px', okText: t('sys.okText') },
      );
      if (res.ok && res.data) {
        const data = res.data[0];
        if (data.name) {
          store.data.name = data.name;
          store.data.description = data.description;
        }
        await store.save();
        onClose();
      }
    }
    // 关闭界面
    let cfg: {
      destroy: () => void;
      update: (newConfig: ModalFuncProps) => void;
    } | null = null;
    function onClose() {
      if (store.isChanged === true) {
        cfg?.destroy();
        cfg = null;
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
            await onSave();
          },
        });
        return;
      }
      props.modal.dismiss({ ok: true });
    }

    // function onSaveName(name: string): void {
    //   store.data.name = name;
    //   if (store.data.id) {
    //     store.saveName();
    //   }
    // }

    // 处理DataResource展开状态变化
    function onDataResourceExpandedChange(expanded: boolean): void {
      dataResourceExpanded.value = expanded;
    }

    onUnmounted(() => {
      store.$reset();
    });

    async function onInit(): Promise<void> {
      // 指定主键时加载数据
      if (props.id) {
        await store.load(props.id);
        store.updateX6Layout();
      } else {
        store.isNew = true;
        store.data.name = t('sys.dataSet.unnamedDataSet');
      }
    }
    onInit();

    return {
      ns,
      t,
      store,
      fieldRef,
      onNext,
      onChangeStep,
      onSave,
      onClose,
      // onSaveName,
      dataResourceExpanded,
      onDataResourceExpandedChange,
    };
  },
  render() {
    return (
      <DesignViewLayout
        class={this.ns.b()}
        onClose={this.onClose}
        subTitle={this.t('sys.dataSet.dataSetSubTitle')}
        v-model:name={this.store.data.name}
        // onChangeName={this.onSaveName}
        leftPanelExpanded={this.dataResourceExpanded}
      >
        {{
          headerCenter: () => {
            return (
              <div class={this.ns.e('steps-container')}>
                <div
                  class={[
                    this.ns.e('step-item'),
                    this.ns.is('active', this.store.step === ReportDataSetStep.MODEL_CONFIG),
                  ]}
                  onClick={() => this.onChangeStep(ReportDataSetStep.MODEL_CONFIG)}
                >
                  <div class={this.ns.e('step-number')}>1</div>
                  <div class={this.ns.e('step-label')}>{this.t('sys.dataSet.modelConfig')}</div>
                </div>
                <div
                  class={[
                    this.ns.e('step-item'),
                    this.ns.is('active', this.store.step === ReportDataSetStep.FIELD_CONFIG),
                  ]}
                  onClick={() => this.onChangeStep(ReportDataSetStep.FIELD_CONFIG)}
                >
                  <div class={this.ns.e('step-number')}>2</div>
                  <div class={this.ns.e('step-label')}>{this.t('sys.dataSet.fieldConfig')}</div>
                </div>
              </div>
            );
          },
          headerRight: () => {
            return (
              <div class={this.ns.e('actions')}>
                {this.store.step === ReportDataSetStep.MODEL_CONFIG ? (
                  <a-button
                    type="primary"
                    disabled={this.store.nodes.length === 0}
                    onClick={this.onNext}
                  >
                    {this.t('sys.dataSet.nextStep')}
                  </a-button>
                ) : (
                  <a-button class={this.ns.e('save-button')} type="primary" onClick={this.onSave}>
                    <i class="gct-iconfont icon-icon_baocun_btn" />
                    {this.t('sys.dataSet.saveTitle')}
                  </a-button>
                )}
              </div>
            );
          },
          bodyLeft: () => {
            return (
              <DataResource
                class={this.ns.is('hidden', this.store.step === ReportDataSetStep.FIELD_CONFIG)}
                onUpdate:expanded={this.onDataResourceExpandedChange}
              />
            );
          },
          default: () => {
            if (this.store.step === ReportDataSetStep.FIELD_CONFIG) {
              return <FieldsConfig ref="fieldRef" />;
            }
            return <ModelConfig />;
          },
        }}
      </DesignViewLayout>
    );
  },
});
