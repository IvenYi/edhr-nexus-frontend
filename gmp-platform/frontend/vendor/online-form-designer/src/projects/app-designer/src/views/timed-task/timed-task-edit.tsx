import { defineComponent, PropType, ref } from 'vue';
import { IModal, useNamespace } from '@gct/runtime';
import { message, Modal } from 'ant-design-vue';
import { TimedTaskEditForm } from './components';
import { getJobInfo, postJob, postJobExec, putJobById } from '/@/apis/gct-apaas/JobController';
import { ITimedTaskItem } from './interface';
import { TimedTaskItem } from './entity';
import { useI18n } from 'vue-i18n';
import './timed-task-edit.scss';

export const TimedTaskEdit = defineComponent({
  name: 'TimedTaskEdit',
  props: {
    isInfo: { type: Boolean, default: false },
    modal: Object as PropType<IModal>,
    context: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const ns = useNamespace('timed-task-edit');
    const formRef = ref<any>();

    const { t } = useI18n() as any;

    const data = ref<ITimedTaskItem>(new TimedTaskItem());

    const isNew = props.context.id == null || props.context.id === '';

    // 加载表单数据
    const load = async (id: string) => {
      const result = await getJobInfo({ id });
      if (result) {
        data.value = new TimedTaskItem(result);
      }
    };

    const save = async () => {
      const data = formRef.value!.getData() as ITimedTaskItem;
      if (isNew) {
        const result = await postJob(data.getData());
        if (result) {
          data.id = result;
        }
        message.success(t('sys.appDesigner.timedTask.info.createSuccess'));
      } else {
        const result = await putJobById({ id: data.id }, data.getData());
        if (result) {
          data.id = result;
        }
        message.success(t('sys.appDesigner.timedTask.info.updateSuccess'));
      }
      return data;
    };

    if (!isNew) {
      load(props.context.id);
    }

    if (props.modal) {
      // eslint-disable-next-line vue/no-mutating-props
      props.modal.ok = async () => {
        if (props.isInfo) {
          return { ok: false, data: [] };
        }
        const result = await formRef.value!.validate();
        if (result === true) {
          const data = await save();
          return {
            ok: true,
            data: [data],
          };
        }
        return null;
      };
    }

    const runTask = () => {
      Modal.confirm({
        title: t('sys.appDesigner.timedTask.grid.confirm.title'),
        onOk: async () => {
          await postJobExec({ id: props.context.id }, { joinParamsToUrl: true });
          message.success(t('sys.appDesigner.timedTask.info.manualExecutionSuccess'));
        },
      });
    };

    return { t, ns, formRef, data, runTask };
  },
  render() {
    return (
      <basic-page class={this.ns.b()}>
        <TimedTaskEditForm ref="formRef" data={this.data} isInfo={this.isInfo} />
        {this.isInfo ? (
          <div class={this.ns.b('footer')}>
            <a-button type="primary" onClick={this.runTask}>
              {this.t(`sys.appDesigner.timedTask.grid.actions.manualExecution`)}
            </a-button>
          </div>
        ) : null}
      </basic-page>
    );
  },
});

export default TimedTaskEdit;
