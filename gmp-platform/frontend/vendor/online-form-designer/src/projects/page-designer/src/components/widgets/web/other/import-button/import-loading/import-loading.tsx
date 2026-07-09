import { computed, defineComponent, onMounted, PropType, ref } from 'vue';
import { IModal, useNamespace } from '@gct/runtime';
import './import-loading.scss';

export const ImportLoading = defineComponent({
  name: 'ImportLoading',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    importEvent: { type: Function, required: true },
  },
  setup(props) {
    const ns = useNamespace('import-loading');

    const schedule = ref<number>(0);

    // 是否上传完成
    const isComplete = ref<boolean>(false);

    const data = ref<IData>({});

    // 上传总条数
    const total = computed<number>(() => {
      return (data.value.errNumber || 0) + (data.value.succeed || 0);
    });

    const loading = ref<boolean>(false);

    const upload = async () => {
      loading.value = true;
      const t = setInterval(() => {
        schedule.value += Math.random() * 10;
      }, 300);
      try {
        data.value = await props.importEvent();
      } catch (error) {
        console.error(error);
      } finally {
        isComplete.value = true;
        clearInterval(t);
        loading.value = false;
        schedule.value = 100;
        const el = document.querySelector(
          '.import-button-state-modal .ant-modal-close',
        ) as HTMLDivElement;
        if (el) {
          el.style.display = 'block';
        }
      }
    };

    upload();

    onMounted(() => {
      const el = document.querySelector(
        '.import-button-state-modal .ant-modal-close',
      ) as HTMLDivElement;
      if (el) {
        el.style.display = 'none';
      }
    });

    return { ns, schedule, data, total, loading, isComplete, upload };
  },
  render() {
    const isSuccess = this.data.succeed === this.total && this.loading === false;
    return (
      <div class={this.ns.b()}>
        <div class={[this.ns.b('content'), this.ns.is('loading', this.loading)]}>
          <div class={[this.ns.e('icon'), this.ns.is('abnormal', !isSuccess && this.isComplete)]}>
            <a-progress
              type="circle"
              percent={this.schedule}
              success={
                isSuccess || this.loading
                  ? {}
                  : {
                      percent: this.schedule,
                      strokeColor: '#FF792E',
                    }
              }
              status={
                this.isComplete === false || this.loading
                  ? 'normal'
                  : this.data.succeed === this.total
                  ? 'success'
                  : 'exception'
              }
              format={(percent) => {
                if (percent === 100 && !isSuccess && !this.loading) {
                  return (
                    <svg
                      width="112"
                      height="111"
                      viewBox="0 0 112 111"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M57.527 37.6607H53.9591V64.4196H57.527V37.6607ZM57.6579 74.2574V70.3923H53.7927V74.2574H57.6579Z"
                        fill="#FF792E"
                      />
                    </svg>
                  );
                }
                if (percent < 100 || this.loading) {
                  return `${Math.floor(percent)}%`;
                }
                return (
                  <svg
                    width="114"
                    height="113"
                    viewBox="0 0 114 113"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M71.0855 43.4557L73.8662 46.2364L52.2619 67.8406L38.7723 54.3511L41.553 51.5704L52.2619 62.2792L71.0855 43.4557Z"
                      fill="#48C65C"
                    />
                  </svg>
                );
              }}
            />
          </div>
          <div class={this.ns.e('info')}>{this.loading ? '正在导入，请稍后' : '导入完成'}</div>
          {this.isComplete ? (
            <div class={this.ns.e('desc')}>
              共导入&nbsp;{this.total}&nbsp;条数据，成功&nbsp;{this.data.succeed || 0}&nbsp;条，失败
              <span class={this.ns.e('error-count')}>&nbsp;{this.data.errNumber || 0}&nbsp;</span>条
            </div>
          ) : null}
        </div>
        {this.loading !== true ? (
          <div class={this.ns.b('footer')}>
            <a-button onClick={() => this.modal.dismiss()}>关闭</a-button>
          </div>
        ) : null}
      </div>
    );
  },
});
