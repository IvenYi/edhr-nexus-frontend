import { defineComponent, onMounted, PropType, ref } from 'vue';
import { IModal, useNamespace } from '@gct/runtime';
import './import-loading.scss';
import { message } from 'ant-design-vue';

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

    const loading = ref<boolean>(false);

    const errorMsg = ref();

    const upload = async () => {
      loading.value = true;
      const t = setInterval(() => {
        schedule.value += Math.random() * 5;
      }, 300);
      errorMsg.value = '';
      try {
        const res = await props.importEvent();
        if (res?.code == 211) {
          errorMsg.value = res.subMessage;
          isComplete.value = false;
        } else {
          data.value = res.data;
          isComplete.value = true;
          setTimeout(() => {
            props.modal?.dismiss({ ok: true, data: { ...data.value } });
          }, 1000);
        }
      } catch (error) {
        console.error(error);
      } finally {
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

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(errorMsg.value);
        message.success('复制成功！');
      } catch (err) {
        message.warning('复制失败，请手动复制');
      }
    };

    return { ns, schedule, data, loading, isComplete, upload, errorMsg, handleCopy };
  },
  render() {
    const isSuccess = this.data?.url && this.loading === false;
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
                  : this.data?.url
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
          <div class={this.ns.e('info')}>
            {this.loading
              ? '正在导入，请稍后'
              : this.isComplete
                ? '导入完成'
                : '抱歉，上传出现错误'}
          </div>
          {!isSuccess && this.errorMsg ? (
            <div class={this.ns.e('desc')}>
              <div class={'w-full flex justify-between items-center h-32px'}>
                <span>报错详情</span>
                <span class={'copy-info cursor-pointer'} onClick={this.handleCopy}>
                  复制详情
                </span>
              </div>
              <div class={'error-msg'}>
                <span>{this.errorMsg}</span>
              </div>
            </div>
          ) : null}
        </div>
        {this.loading !== true ? (
          <div class={this.ns.b('footer')}>
            <a-button onClick={() => this.modal.dismiss({ ok: true, data: { ...this.data } })}>
              关闭
            </a-button>
          </div>
        ) : null}
      </div>
    );
  },
});
