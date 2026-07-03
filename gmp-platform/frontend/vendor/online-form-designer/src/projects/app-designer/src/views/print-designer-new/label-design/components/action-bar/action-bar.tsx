import { defineComponent, ref, onMounted, reactive, computed } from 'vue';
import { useNamespace } from '@gct/runtime';
import './action-bar.scss';
import { Tooltip } from 'ant-design-vue';

export const ActionBar = defineComponent({
  name: 'ActionBar',
  props: {
    zoom: {
      type: Number,
      default: 1,
    },
    min: {
      type: Number,
      default: 0.3,
    },
    max: {
      type: Number,
      default: 3,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  emits: ['zoomReset', 'zoomAuto', 'zoomIn', 'zoomOut'],
  setup(props, { emit }) {
    const ns = useNamespace('label-design-action-bar');

    const rootRef = ref<HTMLDivElement>();

    const state = reactive({
      x: 0,
      y: 35,
    });

    const rootStyle = computed(() => {
      return {
        top: state.y + 'px',
        left: state.x + 'px',
      };
    });

    onMounted(() => {
      if (!rootRef.value) {
        return;
      }
      state.x = rootRef.value.parentElement!.clientWidth - 6 - 160;
      // interact(rootRef.value).draggable({
      //   modifiers: [
      //     interact.modifiers.restrictRect({
      //       restriction: '.designer-canvas',
      //       endOnly: true,
      //     }),
      //   ],
      //   cursorChecker: () => {
      //     return 'move';
      //   },
      //   listeners: {
      //     move: (event) => {
      //       // 计算偏移量保持位置
      //       state.x += event.dx;
      //       state.y += event.dy;
      //     },
      //   },
      // });
    });

    const scale = computed(() => {
      return Math.floor(props.zoom * 100) + '%';
    });

    function zoomIn(): void {
      emit('zoomIn');
    }

    function zoomOut(): void {
      emit('zoomOut');
    }

    function reset(): void {
      emit('zoomReset');
    }

    function zoomAuto(): void {
      emit('zoomAuto');
    }

    return { ns, rootRef, state, rootStyle, scale, zoomIn, zoomOut, reset, zoomAuto };
  },
  render() {
    return (
      <div ref="rootRef" class={this.ns.b()}>
        <Tooltip title={$t('sys.pageDesigner.restore')}>
          <div class={[this.ns.e('action'), this.ns.e('reset')]} onClick={this.reset}>
            <i class={['iconfont', 'icon-recover']} />
          </div>
        </Tooltip>
        <Tooltip title={$t('sys.pageDesigner.selfAdaption')}>
          <div class={[this.ns.e('action'), this.ns.e('auto')]} onClick={this.zoomAuto}>
            <i class={['iconfont', 'icon-zishiying']} />
          </div>
        </Tooltip>
        <div class={this.ns.e('zoom')}>
          <span class={[this.ns.e('zoom-action'), this.ns.e('zoom-out')]} onClick={this.zoomOut}>
            <i class={['iconfont', 'icon-a--']} />
          </span>
          <span class={[this.ns.e('zoom-info')]}>{this.scale}</span>
          <span class={[this.ns.e('zoom-action'), this.ns.e('zoom-in')]} onClick={this.zoomIn}>
            <i class={['iconfont', 'icon-a-']} />
          </span>
        </div>
      </div>
    );
  },
});
