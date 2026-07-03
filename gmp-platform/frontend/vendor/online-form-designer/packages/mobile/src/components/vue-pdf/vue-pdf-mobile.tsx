import { defineComponent, ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import Panzoom, { PanzoomObject } from '@panzoom/panzoom';
import { Loading as VanLoading } from 'vant';
import { postFilePdfEncode } from '@mobile/apis/gct-apaas/MinioController';
import './vue-pdf-mobile.scss';

export const VuePdfMobile = defineComponent({
  name: 'VuePdfMobile',
  props: {
    source: {
      type: String,
      required: true,
    },
    // 是否显示关闭按钮
    isClose: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const imgRef = ref<HTMLImageElement | null>(null);
    const panzoom = ref<PanzoomObject | null>(null);

    // 图片列表
    const images = ref<string[]>([]);
    // 是否加载中
    const loading = ref(false);

    // 仅用于顶部比例数字显示，不驱动重新渲染
    const scaleDisplay = ref<number>(1);

    // 当前页码（1-based）
    const page = ref<number>(1);
    // 总页数
    const pageCount = ref(0);

    // 旋转角度
    const rotation = ref(0);

    // 是否全屏
    const full = ref(false);

    // 监听 source 变化，调接口获取图片列表
    watch(
      () => props.source,
      async (value) => {
        if (!value) return;
        images.value = [];
        page.value = 1;
        pageCount.value = 0;
        loading.value = true;
        // 重置 panzoom
        if (panzoom.value) {
          panzoom.value.reset({ animate: false });
          scaleDisplay.value = 1;
        }
        const data = await postFilePdfEncode({ url: value._url, dpi: 288 }).finally(() => {
          loading.value = false;
        });
        images.value = data ?? [];
        pageCount.value = images.value.length;
      },
      { immediate: true },
    );

    // 上一页
    const onPre = (e: Event) => {
      e.stopPropagation();
      if (page.value > 1) page.value--;
    };

    // 下一页
    const onNext = (e: Event) => {
      e.stopPropagation();
      if (page.value < pageCount.value) page.value++;
    };

    // 向左旋转
    const onRotateLeft = (e: Event) => {
      e.stopPropagation();
      rotation.value -= 90;
    };

    // 向右旋转
    const onRotateRight = (e: Event) => {
      e.stopPropagation();
      rotation.value += 90;
    };

    // 放大
    const onEnlarge = (e: Event) => {
      e.stopPropagation();
      if (panzoom.value) {
        panzoom.value.zoomIn();
        scaleDisplay.value = panzoom.value.getScale();
      }
    };

    // 缩小
    const onReduce = (e: Event) => {
      e.stopPropagation();
      if (panzoom.value) {
        panzoom.value.zoomOut();
        scaleDisplay.value = panzoom.value.getScale();
      }
    };

    // 全屏切换
    const onFull = (e: Event) => {
      e.stopPropagation();
      full.value = !full.value;
    };

    // 重置缩放和位置
    const onReset = (e: Event) => {
      e.stopPropagation();
      if (panzoom.value) {
        panzoom.value.reset();
        scaleDisplay.value = panzoom.value.getScale();
      }
    };

    // 关闭
    const onClose = (e: Event) => {
      e.stopPropagation();
      emit('close');
    };

    // 跳转到指定页
    const jumpToPage = (pageNum: number) => {
      page.value = pageNum;
    };

    // 供外部调用
    const reload = () => {};

    // 初始化 panzoom（作用于图片容器）
    const initPanzoom = () => {
      if (!imgRef.value) return;
      if (panzoom.value) {
        panzoom.value.destroy();
      }
      panzoom.value = Panzoom(imgRef.value, {
        maxScale: 5,
        minScale: 0.1,
        smoothScroll: false,
        startScale: 1,
        startX: 0,
        startY: 0,
      });
      imgRef.value.addEventListener('panzoomend', (e: Event) => {
        scaleDisplay.value = (e as CustomEvent).detail.scale;
      });
    };

    onMounted(async () => {
      await nextTick();
      initPanzoom();
    });

    onUnmounted(() => {
      panzoom.value?.destroy();
    });

    return {
      imgRef,
      images,
      loading,
      page,
      pageCount,
      scaleDisplay,
      full,
      rotation,
      onPre,
      onNext,
      onRotateLeft,
      onRotateRight,
      onEnlarge,
      onReduce,
      onFull,
      onReset,
      onClose,
      reload,
      jumpToPage,
      initPanzoom,
    };
  },
  render() {
    const cls = ['m-vue-pdf', this.full ? 'is-full' : ''];
    // 当前显示图片（page 为 1-based）
    const currentImage = this.images[this.page - 1];
    const imgStyle = `transform: rotate(${this.rotation}deg); transform-origin: center center;`;

    return (
      <div class={cls}>
        <div class="m-vue-pdf__header">
          {/* 旋转 + 重置（绝对定位靠左） */}
          <div class="m-vue-pdf-rotate">
            <span class="m-vue-pdf-action" onClick={this.onRotateLeft} title="向左旋转">
              <i class="iconfont icon-xuanzhuan_rotate" />
            </span>
            <span class="m-vue-pdf-action" onClick={this.onRotateRight} title="向右旋转">
              <i
                class="iconfont icon-xuanzhuan_rotate"
                style="display:inline-block;transform:scaleX(-1)"
              />
            </span>
            <span class="m-vue-pdf-action" onClick={this.onReset} title="重置视图">
              <i class="iconfont icon-recover" />
            </span>
          </div>

          {/* 翻页（绝对定位居中） */}
          <div class="m-vue-pdf-page-turning">
            <span class="m-vue-pdf-action" onClick={this.onPre}>
              <i class="iconfont icon-pad_arrow_back" />
            </span>
            <span class="m-vue-pdf-page-turning__page">
              &nbsp;{this.pageCount > 0 ? this.page : 0}&nbsp;/&nbsp;{this.pageCount}&nbsp;
            </span>
            <span class="m-vue-pdf-action" onClick={this.onNext}>
              <i class="iconfont icon-pad_arrow_right" />
            </span>
          </div>

          {/* 缩放 + 全屏 + 关闭（靠右） */}
          <div class="m-vue-pdf-right">
            <div class="m-vue-pdf-zoom">
              <span class="m-vue-pdf-action" onClick={this.onReduce} title="缩小">
                <i class="iconfont  icon-a-suoxiao_zoom-out1" />
              </span>
              <span class="m-vue-pdf-zoom__ratio">{(this.scaleDisplay * 100).toFixed(0)}%</span>
              <span class="m-vue-pdf-action" onClick={this.onEnlarge} title="放大">
                <i class="iconfont icon-fangda_zoom-in" />
              </span>
            </div>
            <span
              class="m-vue-pdf-action"
              onClick={this.onFull}
              title={this.full ? '退出全屏' : '全屏'}
            >
              <i class={this.full ? 'iconfont icon-tuichuquanping' : 'iconfont icon-quanping'} />
            </span>
            {this.isClose ? (
              <span class="m-vue-pdf-action" onClick={this.onClose} title="关闭">
                <i class="gct-iconfont icon-guanbi-Paddanchuang"></i>
              </span>
            ) : null}
          </div>
        </div>

        <div class="m-vue-pdf__content">
          {this.loading ? (
            <div class="m-vue-pdf__loading">
              <VanLoading />
            </div>
          ) : currentImage ? (
            <img
              ref="imgRef"
              class="m-vue-pdf__img"
              src={currentImage}
              style={imgStyle}
              onLoad={() => {
                this.initPanzoom();
              }}
            />
          ) : null}
        </div>
      </div>
    );
  },
});

export default VuePdfMobile;
