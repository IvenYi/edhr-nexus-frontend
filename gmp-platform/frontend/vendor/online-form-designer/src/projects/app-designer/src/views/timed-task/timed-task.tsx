import { defineComponent, reactive } from 'vue';
import { useNamespace } from '@gct/runtime';
import { TimedTaskTable, ViewHeader } from './components';
import { TimedTaskController } from './controller/timed-task.controller';
import { ITimedTaskItem } from './interface';
import { useI18n } from 'vue-i18n';
import './timed-task.scss';

const TimedTask = defineComponent({
  name: 'TimedTask',
  components: {
    TimedTaskTable,
  },
  setup() {
    const { t } = useI18n() as any;
    const ns = useNamespace('timed-task');
    const c = new TimedTaskController();
    c.state = reactive(c.state);
    c.t = t;
    c.fetch().then(() => {
      c.state.isLoaded = true;
    });

    const onAction = (data: ITimedTaskItem, type: string) => {
      c.action(type, data);
    };

    return { t, ns, c, onAction };
  },
  render() {
    return (
      <basic-page class={this.ns.b()}>
        <ViewHeader
          title={this.t('sys.appDesigner.timedTask.title')}
          desc={this.t('sys.appDesigner.timedTask.desc')}
        />
        <a-divider class={this.ns.b('divider')} />
        <div class={this.ns.b('content')}>
          <TimedTaskTable c={this.c} items={this.c.state.items} onAction={this.onAction} />
        </div>
      </basic-page>
    );
  },
});

export default TimedTask;
