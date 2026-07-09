import { defineComponent, ref, nextTick, onMounted, onUnmounted } from 'vue';
import { useNamespace } from '@gct/runtime';
import {
  LeftOutlined,
  RightOutlined,
  CloseOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  DownloadOutlined,
} from '@ant-design/icons-vue';
import VuePdfEmbedComp from 'vue-pdf-embed';
import Panzoom, { PanzoomObject } from '@panzoom/panzoom';
import './vue-pdf.scss';
import { debounce } from 'lodash-es';

export const VuePdf = defineComponent({
  name: 'VuePdf',
  props: {
    source: {
      type: [String, Object],
      required: true,
    },
    // 是否允许旋转
    isRotate: {
      type: Boolean,
      default: true,
    },
    // 是否允许缩放
    isScale: {
      type: Boolean,
      default: true,
    },
    // 是否允许全屏
    isFull: {
      type: Boolean,
      default: true,
    },
    // 是否显示关闭按钮
    isClose: {
      type: Boolean,
      default: false,
    },
    // 是否显示下载按钮
    isDownload: {
      type: Boolean,
      default: false,
    },
    // 下载文件名
    downloadFileName: {
      type: String,
      default: 'download.pdf',
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const ns = useNamespace('vue-pdf');
    const pdfRef = ref<any>();
    const width = ref(0);
    const panzoom = ref<PanzoomObject | null>(null);

    // 仅用于顶部比例数字显示，不驱动 PDF 组件重新渲染
    const scaleDisplay = ref<number>(1);

    // 当前页码
    const page = ref<number>(1);
    // 总页数
    const pageCount = ref(1);

    const rotation = ref(0);

    // 是否全屏
    const full = ref<boolean>(false);

    // 上一页
    const onPre = (e: MouseEvent) => {
      e.stopPropagation();
      if (page.value > 1) {
        page.value--;
      }
    };

    // 下一页
    const onNext = (e: MouseEvent) => {
      e.stopPropagation();
      if (page.value < pageCount.value) {
        page.value++;
      }
    };

    // 向左旋转
    const onRotateLeft = (e: MouseEvent) => {
      e.stopPropagation();
      rotation.value -= 90;
    };

    // 向右旋转
    const onRotateRight = (e: MouseEvent) => {
      e.stopPropagation();
      rotation.value += 90;
    };

    // 放大
    const onEnlarge = (e: MouseEvent) => {
      e.stopPropagation();
      if (panzoom.value) {
        panzoom.value.zoomIn();
        scaleDisplay.value = panzoom.value.getScale();
      }
    };

    // 缩小
    const onReduce = (e: MouseEvent) => {
      e.stopPropagation();
      if (panzoom.value) {
        panzoom.value.zoomOut();
        scaleDisplay.value = panzoom.value.getScale();
      }
    };

    // 全屏
    const onFull = (e: MouseEvent) => {
      e.stopPropagation();
      full.value = !full.value;
    };

    // 重置缩放和位置到初始状态
    const onReset = (e: MouseEvent) => {
      e.stopPropagation();
      rotation.value = 0;
      if (panzoom.value) {
        panzoom.value.reset();
        scaleDisplay.value = panzoom.value.getScale();
      }
    };

    const onClose = (e: MouseEvent) => {
      e.stopPropagation();
      emit('close');
    };

    // 下载
    const onDownload = async (e: MouseEvent) => {
      e.stopPropagation();
      const source = props.source;
      const fileName = props.downloadFileName || 'download.pdf';
      const url = typeof source === 'string' ? source : (source as any)?.url;
      if (!url) return;
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch {
        // fetch 失败时降级直接打开
        window.open(url, '_blank');
      }
    };

    // 跳转到指定页
    const jumpToPage = (pageNum: number) => {
      page.value = pageNum;
    };

    // 抛给外部使用
    const reload = () => {};
    const updatewidth = debounce((w: number) => {
      width.value = w > 768 ? 768 : w;
    }, 100);
    onMounted(async () => {
      await nextTick();
      // 监听缩放事件
      panzoom.value = Panzoom(pdfRef.value.$el, {
        maxScale: 5,
        minScale: 0.1,
        smoothScroll: false,
        startScale: 1,
        startX: 0,
        startY: 0,
      });
      // 监听 panzoom 变化事件（含移动端手势缩放），同步更新比例显示
      // pdfRef.value.$el.addEventListener('panzoomchange', (e: CustomEvent) => {
      //   scale.value = e.detail.scale;
      // });
      // 手势结束后更新缩放比例，避免实时更新造成闪动
      pdfRef.value.$el.addEventListener('panzoomend', (e: CustomEvent) => {
        scaleDisplay.value = e.detail.scale;
      });
      const pdfContent = pdfRef.value.$el.parentNode as Element;
      const resizeObserver = new ResizeObserver((entries) => {
        // 当元素大小发生变化时执行的回调函数
        for (const entry of entries) {
          const width = entry.contentRect.width;
          if (!width) return;
          updatewidth(width);
        }
      });
      // 开始观察目标元素的大小变化
      resizeObserver.observe(pdfContent);
    });

    onUnmounted(() => {
      panzoom.value?.destroy();
    });

    return {
      ns,
      pdfRef,
      page,
      pageCount,
      scaleDisplay,
      full,
      onPre,
      onNext,
      onEnlarge,
      onReduce,
      onFull,
      onClose,
      onDownload,
      onReset,
      reload,
      jumpToPage,
      width,
      rotation,
      onRotateLeft,
      onRotateRight,
    };
  },
  render() {
    console.log('in vue-pdf.tsx', this.source);
    return (
      <div class={[this.ns.b(), this.ns.is('full', this.full)]}>
        <div class={this.ns.e('header')}>
          <div class={this.ns.b('page-turning')}>
            <div class={this.ns.be('page-turning', 'pre')} onClick={this.onPre}>
              <LeftOutlined />
            </div>
            <div class={this.ns.be('page-turning', 'page')}>
              &nbsp;{this.page}&nbsp;/&nbsp;{this.pageCount}&nbsp;
            </div>
            <div class={this.ns.be('page-turning', 'next')} onClick={this.onNext}>
              <RightOutlined />
            </div>
          </div>
          <div class={this.ns.b('toolbar-left')}>
            {this.isRotate ? (
              <>
                <div class={this.ns.be('rotate', 'left')} onClick={this.onRotateLeft}>
                  <RotateLeftOutlined />
                </div>
                &nbsp;
                <div class={this.ns.be('rotate', 'right')} onClick={this.onRotateRight}>
                  <RotateRightOutlined />
                </div>
                &nbsp;
                <div class={this.ns.be('rotate', 'reset')} onClick={this.onReset} title="重置视图">
                  <i class="iconfont icon-huanyuan" />
                </div>
                &nbsp;
              </>
            ) : null}
            {this.isDownload ? (
              <div class={this.ns.b('download')} onClick={this.onDownload} title="下载">
                <DownloadOutlined />
              </div>
            ) : null}
          </div>
          
          {this.isScale ? (
            <div class={this.ns.b('zoom')}>
              <div class={this.ns.be('zoom', 'reduce')} onClick={this.onReduce}>
                <i class="iconfont icon-a--" />
              </div>
              &nbsp;
              <div class={this.ns.be('zoom', 'ratio')}>{(this.scaleDisplay * 100).toFixed(0)}%</div>
              &nbsp;
              <div class={this.ns.be('zoom', 'enlarge')} onClick={this.onEnlarge}>
                <i class="iconfont icon-a-" />
              </div>
            </div>
          ) : null}
          {this.isFull ? (
            <div class={this.ns.b('full')} onClick={this.onFull}>
              {this.full ? (
                <i class="iconfont icon-tuichuquanping" />
              ) : (
                <i class="iconfont icon-quanping" />
              )}
            </div>
          ) : null}
          {this.isClose ? (
            <div class={this.ns.b('close')} onClick={this.onClose}>
              <CloseOutlined />
            </div>
          ) : null}
        </div>
        <div id="pdfContent" class={this.ns.e('content')}>
          <VuePdfEmbedComp
            class={[this.ns.e('pdf')]}
            rotation={this.rotation}
            width={this.width}
            scale={5}
            source={this.source}
            page={this.page}
            ref="pdfRef"
            onLoaded={(data) => {
              this.pageCount = data.numPages;
            }}
          />
        </div>
      </div>
    );
  },
});

export default VuePdf;
