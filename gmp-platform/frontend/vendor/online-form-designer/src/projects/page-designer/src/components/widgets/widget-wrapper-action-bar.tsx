import { defineComponent, computed, ref, watch, onMounted, nextTick } from 'vue';
import { useNamespace } from '@gct/runtime';
import { useI18n } from 'vue-i18n';
import { useDesignerController } from '../../hooks/useDesigner';
import { watchOnce } from '@vueuse/core';
import './widget-wrapper-action-bar.scss';
import { useSuspensionBar } from '../widget-drag/designer-hooks';

export const WidgetWrapperActionBar = defineComponent({
  name: 'WidgetWrapperActionBar',
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
    isInfo: {
      type: Boolean,
      default: false,
    },
    isHover: {
      type: Boolean,
      default: true,
    },
    isContainer: {
      type: Boolean,
      default: true,
    },
    types: {
      type: Array<string>,
      default: () => [],
    },
    name: {
      type: String,
      default: '',
    },
    index: {
      type: Number,
      default: 0,
    },
    rootRef: {
      type: HTMLElement,
    },
  },
  emits: ['action'],
  setup(_, { emit }) {
    const { t } = useI18n() as any;
    const barRef = ref();
    // 是否显示在容器下方
    const isBottom = ref<boolean>(false);

    // 设计界面控制器
    const designer = useDesignerController();

    const ns = useNamespace('widget-wrapper-action-bar');

    const onClick = (e: MouseEvent, tag: string) => {
      e.stopPropagation();
      designer.resetStack();
      emit('action', tag);
    };

    const renderActions = () => {
      return [
        // _.types.includes('drag') ? (
        //   <a-tooltip>
        //     {{
        //       title: () => t('sys.pageDesigner.move'),
        //       default: () => (
        //         <span class={[ns.e('span'), ns.e('drag')]}>
        //           <i class="iconfont icon-tuozhuai opt-icon"></i>
        //         </span>
        //       ),
        //     }}
        //   </a-tooltip>
        // ) : null,
        _.types.includes('parent') ? (
          <a-tooltip>
            {{
              title: () => t('sys.pageDesigner.selectParentWidget'),
              default: () => (
                <span
                  title={t('sys.pageDesigner.selectParentWidget')}
                  class={[ns.e('span'), ns.e('parent')]}
                  onClick={(e) => onClick(e, 'selectParent')}
                >
                  <i class="iconfont icon-fuzujian"></i>
                </span>
              ),
            }}
          </a-tooltip>
        ) : null,
        // 如果在子表的模态框设计器中 则没有删除
        _.types.includes('delete') ? (
          <a-tooltip>
            {{
              title: () => t('sys.delete'),
              default: () => (
                <span
                  title={t('sys.delete')}
                  class={[ns.e('span'), ns.e('delete')]}
                  onClick={(e) => onClick(e, 'deleteWidget')}
                >
                  <i class="iconfont icon-shanchu1"></i>
                </span>
              ),
            }}
          </a-tooltip>
        ) : null,
      ];
    };

    const renderInfo = () => {
      return t(_.name);
    };

    const { top, right, update, hidden, readyIntersectionObserver } = useSuspensionBar({
      rootRef: _.rootRef,
      positionRef: barRef,
    });
    onMounted(() => {
      if (_.isActive) {
        readyIntersectionObserver();
      }
    });
    watchOnce(
      () => _.isActive,
      async (isActive) => {
        if (!isActive) return;
        readyIntersectionObserver();
      },
    );
    watch(
      () => _.index,
      () => {
        nextTick().then(() => {
          update();
        });
      },
    );
    const positionRect = computed(() => {
      return {
        top: top.value - 29 + 'px',
        left: right.value + 'px',
        hidden: hidden.value,
      };
    });
    return {
      t,
      ns,
      isBottom,
      onClick,
      renderActions,
      renderInfo,
      positionRect,
      barRef,
    };
  },
  render() {
    return (
      <div ref="barRef" class="absolute top--10px right-0 w60px h30px">
        <div
          style={this.positionRect}
          class={[
            this.ns.b(),
            this.ns.is('info', this.isInfo),
            this.ns.is('hidden', this.positionRect.hidden || (!this.isHover && !this.isActive)),
          ]}
        >
          {/* <div class={this.ns.e('mask')}></div> */}
          <div class={this.ns.e('content')}>
            {this.isInfo && !this.isActive ? this.renderInfo() : this.renderActions()}
          </div>
        </div>
      </div>
    );
  },
});
