import { defineComponent, ref, watch, computed, nextTick } from 'vue';
import { cloneDeep, throttle } from 'lodash-es';
import { PanelEnum, SCOPE } from '/@page-designer/enum';
import { useI18n } from '/@/hooks/web/useI18n';
import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
import { useScope } from '/@page-designer/hooks/useScope';
import { useDesigner, useDesignerController } from '/@page-designer/hooks/useDesigner';
import { togglePanel } from '/@page-designer/hooks/usePage';
import { flatten } from '/@page-designer/schema/field/form/utils';
import { findNode } from '/@/utils/helper/treeHelper';
import { MaterialEnum } from '/@/enums/appEnum';
import './index.less';

export default defineComponent({
  name: 'TagNav',
  setup() {
    const { selectedRef, setSelectedWidget, resetSelectedModal, resetSelectedWidget } =
      useSelectedWidget();
    const { setModalDesignState, setSubTableModalDesignState, isNewDesigner } = useDesigner();
    const { navTagScopeData } = useScope();
    const { t } = useI18n() as any;

    const c = useDesignerController();

    const cmpMap = ref({});
    const tagClientRef = ref<any>(null);
    const tagScrollRef = ref<any>(null);
    const navOffset = ref<number>(0); // 偏移量

    watch(
      () => navTagScopeData.value,
      (dataCenter) => {
        const cloneDataCenter = cloneDeep(dataCenter);
        const widgetList = flatten(cloneDataCenter as any, 'board', false);

        cmpMap.value = Object.fromEntries(
          widgetList.filter((item) => item.key).map((item) => [item.key, item]),
        );
      },
      {
        immediate: true,
        deep: true,
      },
    );

    watch(
      () => selectedRef.value.id,
      () => {
        nextTick(() => {
          if (tagScrollRef.value) {
            const childNodes = tagScrollRef.value.childNodes;
            setTimeout(() => {
              childNodes.forEach((node) => {
                if (node?.dataset?.selected === 'true') {
                  const node_offsetLeft = node.offsetLeft;
                  const node_offsetWidth = node.offsetWidth;
                  const val = moveToView(node_offsetLeft, node_offsetWidth);
                  if (val !== null) {
                    navOffset.value = val;
                  }
                }
              });
            }, 100);
          }
        });
      },
      {
        immediate: true,
      },
    );

    const navList = computed(() => {
      const currentId = selectedRef.value.id as string;
      const key =
        selectedRef.value?.materialType === MaterialEnum.MaterialSubTableModalField
          ? `modalfield_${currentId}`
          : currentId;

      const cmp = cmpMap.value[key];

      if (cmp) {
        const paths = cmp.path.split('|').filter((i) => i !== 'undefined');

        return paths.map((path) => {
          const data =
            path === 'board'
              ? {
                  name: 'sys.pageDesigner.page',
                  id: 'board',
                  type: 'board',
                }
              : cmpMap.value[path];

          return {
            title: data.customName || data.name,
            id: data.id,
            type: data.type,
            inSubTable: data.inSubTable,
            // icon不需要显示的情况 当前选择的节点
            isHideIcon: currentId === data.id,
            selected: currentId === data.id,
          };
        });
      }

      return [];
    });

    const getWidth = () => {
      const tagClientRect = tagClientRef.value?.getBoundingClientRect();
      const tagScrollRect = tagScrollRef.value?.getBoundingClientRect();
      if (tagClientRect && tagClientRect) {
        return {
          tagClientW: tagClientRect.width,
          tagScrollW: tagScrollRect.width,
        };
      }
      return null;
    };

    const moveToView = (nodeL, nodeW) => {
      const widths = getWidth();
      if (widths) {
        const { tagClientW, tagScrollW } = widths;
        let num;
        if (tagScrollW <= tagClientW) {
          num = 0;
        } else if (nodeL < -navOffset.value) {
          // 可视区左侧
          console.log('标签在可视区域左侧');
          num = -nodeL;
        } else if (nodeL >= -navOffset.value && nodeL + nodeW < -navOffset.value + tagClientW) {
          // 可视区域中
          console.log('标签在可视区域');
          num = Math.min(0, tagClientW - nodeW - nodeL);
        } else {
          // 可视区域右侧
          console.log('标签在可视区域右侧');
          num = -(nodeL - (tagClientW - nodeW));
        }
        return num;
      }
      return null;
    };

    const setOpacity = () => {
      const widths = getWidth();
      const opacitys = {
        left: false,
        right: false,
      };
      if (widths) {
        const { tagClientW, tagScrollW } = widths;
        if (tagClientW < tagScrollW) {
          // 右侧要显示
          opacitys.right = true;
          if (navOffset.value < 0) {
            // 左侧要显示了
            opacitys.left = true;
          }
          if (navOffset.value === Math.min(navOffset.value, tagClientW - tagScrollW)) {
            opacitys.right = false;
          }
        }
      }

      return opacitys;
    };

    const handleScroll = (offset) => {
      if (offset > 0) {
        // 鼠标向右滑动，数据向左滚动
        const offsetNum = Math.min(0, navOffset.value + offset);
        navOffset.value = offsetNum;
      } else {
        const widths = getWidth();
        if (widths) {
          const { tagClientW, tagScrollW } = widths;
          let num = 0;
          // 判断内容是否超过需要滚动的宽度
          if (tagClientW < tagScrollW) {
            if (navOffset.value < -(tagScrollW - tagClientW)) {
              num = navOffset.value;
            } else {
              num = Math.max(navOffset.value + offset, tagClientW - tagScrollW);
            }
          }
          navOffset.value = num;
        }
      }
    };

    const onWheel = throttle((event) => {
      const { wheelDeltaX } = event;
      const delta = wheelDeltaX || 0;
      handleScroll(delta);
    }, 100);

    const onMoveToView = (event, item) => {
      // if(isConfigCrumbs) return
      const node_offsetLeft = event.currentTarget.offsetLeft;
      const node_offsetWidth = event.currentTarget.offsetWidth;
      const val = moveToView(node_offsetLeft, node_offsetWidth);
      if (val !== null) {
        navOffset.value = val;
      }

      if (item.id === selectedRef.value.id) {
        return;
      }

      if (item.id === 'board') {
        setSubTableModalDesignState(false);
        setModalDesignState(false);
        resetSelectedWidget(SCOPE.PAGE);
        resetSelectedModal();
        togglePanel(PanelEnum.PAGE);
      } else {
        const widget = findNode(navTagScopeData.value, (node) => {
          return node.id === item.id;
        });
        if (widget) {
          setSelectedWidget(widget);
          if (isNewDesigner.value === true) {
            //嵌套子表下链路无法选中
            c.setSelect(widget.id);
          } else {
            if (!item.inSubTable) {
              setSubTableModalDesignState(false);
            }
          }
        }
      }
    };

    const setCls = () => {
      const { left, right } = setOpacity();
      return `${left ? 'opacity-left' : ''} ${right ? 'opacity-right' : ''}`;
    };

    return {
      navList,
      t,
      tagClientRef,
      tagScrollRef,
      navOffset,
      setCls,
      onWheel,
      onMoveToView,
    } as any;
  },

  render() {
    return Array.isArray(this.navList) && this.navList.length ? (
      <div class="tags-nav-wrap">
        <div class="lt-tags">
          <div ref="tagClientRef" class={['scroll-area', this.setCls()]} onWheel={this.onWheel}>
            <div
              ref="tagScrollRef"
              class="scroll-body"
              style={{ transform: `translate(${this.navOffset}px, 0px)` }}
            >
              {this.navList.length > 0
                ? this.navList.map((item: any, index: number) => {
                    const { id, title, selected, isHideIcon } = item;

                    return (
                      <div
                        key={`${id}_${title}_${index}`}
                        data-selected={selected}
                        class={['tag-item tags-nav-item-bursh', selected && 'selected']}
                        onClick={(event) => this.onMoveToView(event, item)}
                      >
                        <div class="tag-content">
                          <span class="tag-title" title={this.t(title)}>
                            {this.t(title)}
                          </span>
                        </div>
                        {!isHideIcon && (
                          <span class="tag-item-icon">
                            <i class="iconfont icon-a-Rightarrow"></i>
                          </span>
                        )}
                      </div>
                    );
                  })
                : null}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div class="h48px"></div>
    );
  },
});
