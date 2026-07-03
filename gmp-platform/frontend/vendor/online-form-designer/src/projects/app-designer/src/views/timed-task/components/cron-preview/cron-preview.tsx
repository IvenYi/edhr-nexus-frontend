import { defineComponent, ref, watch } from 'vue';
import { useNamespace } from '@gct/runtime';
import { CronosExpression } from 'cronosjs';
import dayjs, { Dayjs } from 'dayjs';
import { useI18n } from 'vue-i18n';
import './cron-preview.scss';
import { postJobCronValid } from '/@/apis/gct-apaas/JobController';

export const CronPreview = defineComponent({
  name: 'CronPreview',
  props: {
    value: {
      type: Array<string>,
      // 预览表达式 0 0 0 1 1 ? 2024-20230，每年的1月1日0时0分0秒触发
      default: [],
    },
    range: {
      type: Array<Dayjs>,
      default: () => [],
    },
  },
  setup(props) {
    const ns = useNamespace('cron-preview');

    // 是否手动触发过预览
    const isTrigger = ref(false);

    const previewList = ref<string[]>([]);

    const calcIsPreview = async (): Promise<boolean> => {
      if (props.value.length === 0) {
        return false;
      }
      await postJobCronValid({ cron: props.value });
      return true;
    };

    const { t } = useI18n() as any;

    const calcPreviewList = async () => {
      const bol = await calcIsPreview();
      if (bol === false) {
        return;
      }
      const startDate = new Date();
      let endDate: Date | null = null;
      if (props.range.length === 2) {
        startDate.setTime(props.range[0].toDate().getTime());
        endDate = props.range[1].toDate();
      }
      // 编译所有表达式
      const intervals = props.value.map((item) => CronosExpression.parse(item));
      // 计算出所有表达式最近10次的触发时间
      const allDates: number[] = [];
      intervals.forEach((interval) => {
        const arr = interval.nextNDates(startDate, 10).map((d) => d.getTime());
        allDates.push(...arr);
      });
      // 将触发时间去重并正序排序
      const arr = Array.from(new Set(allDates)).sort((a, b) => a - b);
      // 将最近的10次触发时间格式化呈现
      previewList.value = arr
        .splice(0, 10)
        .map((date) => dayjs(date))
        .filter((item) => {
          if (endDate) {
            return item.isBefore(endDate);
          }
          return true;
        })
        .map((item) => item.format('YYYY-MM-DD HH:mm:ss'));
    };

    const onPreview = () => {
      isTrigger.value = true;
      calcPreviewList();
    };

    watch(
      props,
      () => {
        previewList.value = [];
        isTrigger.value = false;
      },
      { deep: true },
    );

    return { t, ns, previewList, isTrigger, onPreview };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('preview-action')}>
          <a-button type="primary" onClick={this.onPreview}>
            {this.t('sys.appDesigner.timedTask.cronPreview.title')}
          </a-button>
        </div>
        <div class={this.ns.b('list')}>
          {this.previewList.map((item) => (
            <div class={this.ns.be('list', 'item')}>{item}</div>
          ))}
        </div>
        {this.previewList.length > 0 ? (
          <div class={this.ns.e('preview-info')}>
            {this.t('sys.appDesigner.timedTask.cronPreview.desc')}
          </div>
        ) : null}
        {this.previewList.length === 0 && this.isTrigger === true ? (
          <div class={this.ns.e('no-data')}>
            {this.t('sys.appDesigner.timedTask.cronPreview.noData')}
          </div>
        ) : null}
      </div>
    );
  },
});

export default CronPreview;
