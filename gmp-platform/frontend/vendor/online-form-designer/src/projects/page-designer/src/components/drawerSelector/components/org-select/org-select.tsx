import { defineComponent, ref, computed, watch, h, nextTick } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { List } from 'vant';
import { Checkbox, Radio } from '/@page-designer/components/common';
import { GctSvgIcon } from '../../../common/svg-icon/svg-icon';
import { Empty } from '../../../common';
import type { Option } from '../../types';
import './org-select.scss';

/** 路径节点接口 */
interface PathNode {
  label: string;
  options: Option[];
}

export const OrgSelect = defineComponent({
  name: 'OrgSelect',
  components: {
    'van-list': List,
  },
  props: {
    allOptions: {
      type: Array as () => Option[],
      default: () => [],
    },
    selectedValues: {
      type: Array as () => string[],
      default: () => [],
    },
    searchValue: {
      type: String,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    isFinished: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    ignoreCase: {
      type: Number,
      default: 1,
    },
  },
  emits: ['load', 'change'],
  setup(props, { emit }) {
    const ns = useNamespace('org-select');

    // 当前路径，用于面包屑导航和数据追踪
    const currentPath = ref<PathNode[]>([{ label: '根目录', options: [] }]);
    const breadcrumbRef = ref<HTMLElement>();

    /**
     * 过滤当前层级选项（仅在当前展开层级搜索）
     * @param options 当前层级的选项列表
     * @param searchValue 搜索值
     * @returns 过滤后的当前层级选项
     */
    const filterCurrentLevelOptions = (options: Option[], searchValue?: string): Option[] => {
      if (!searchValue?.trim()) {
        return options;
      }

      if (props.ignoreCase) {
        const searchLower = searchValue.toLowerCase();
        return options.filter((option) => option.label.toLowerCase().includes(searchLower));
      } else {
        return options.filter((option) => option.label.includes(searchValue));
      }
    };

    // 计算当前显示的选项列表
    const currentOptions = computed(() => {
      const currentLevel = currentPath.value[currentPath.value.length - 1];
      const baseOptions = currentLevel.options.length > 0 ? currentLevel.options : props.allOptions;

      // 只在当前层级进行搜索过滤，不进行递归搜索
      return filterCurrentLevelOptions(baseOptions, props.searchValue);
    });

    // 监听 allOptions 变化，重置路径
    watch(
      () => props.allOptions,
      (newOptions) => {
        currentPath.value = [{ label: '根目录', options: newOptions }];
      },
      { immediate: true },
    );

    const handleLoad = (): void => {
      emit('load');
    };

    const handleClick = (value: string, option: Option): void => {
      emit('change', value, option);
    };

    /**
     * 滚动面包屑到最右边
     */
    const scrollBreadcrumbToRight = (): void => {
      nextTick(() => {
        if (breadcrumbRef.value) {
          breadcrumbRef.value.scrollLeft = breadcrumbRef.value.scrollWidth;
        }
      });
    };

    /**
     * 下钻到子组织
     * @param option 目标选项
     */
    const drillDown = (option: Option): void => {
      if (!option.leaf && option.children && option.children.length > 0) {
        currentPath.value.push({
          label: option.label,
          options: option.children,
        });
        scrollBreadcrumbToRight();
      }
    };

    /**
     * 面包屑导航
     * @param index 目标层级索引
     */
    const navigateTo = (index: number): void => {
      if (index >= 0 && index < currentPath.value.length) {
        currentPath.value = currentPath.value.slice(0, index + 1);
        scrollBreadcrumbToRight();
      }
    };

    const renderBreadcrumb = () => {
      return (
        <div ref={breadcrumbRef} class={ns.e('breadcrumb')}>
          {currentPath.value.map((pathItem, index) => (
            <span key={index}>
              <span
                class={[
                  ns.e('breadcrumb-item'),
                  index === currentPath.value.length - 1
                    ? ns.em('breadcrumb-item', 'current')
                    : ns.em('breadcrumb-item', 'clickable'),
                ]}
                onClick={() => navigateTo(index)}
              >
                {pathItem.label}
              </span>
              {index < currentPath.value.length - 1 && (
                <span class={ns.e('breadcrumb-separator')}> / </span>
              )}
            </span>
          ))}
        </div>
      );
    };

    const renderOrgList = () => {
      return (
        <van-list
          class={ns.e('org-list')}
          loading={props.isLoading}
          finished={props.isFinished}
          onLoad={handleLoad}
        >
          {currentOptions.value.map((option) => (
            <div
              key={option.value}
              class={[
                'flex items-center rounded-lg',
                ns.e('org-item'),
                option.disabled ? 'opacity-40 pointer-events-none' : '',
              ]}
              onClick={() => handleClick(option.value as string, option)}
            >
              {/* 选择框 */}
              {h(props.multiple ? Checkbox : Radio, {
                checked: props.selectedValues.includes(option.value as string),
                style: { width: '20px', height: '20px' },
              })}

              {/* 图标 */}
              <GctSvgIcon
                class={ns.e('item-icon')}
                src={import.meta.env.BASE_URL + 'assets/pad/org-select/pic_zzjg_blue.svg'}
              />

              {/* 组织名称 - 支持搜索高亮 */}
              <div class={['flex-grow', 'break-all']}>{option.label}</div>

              {/* 下钻热区 - 只在非搜索状态下显示 */}
              {!option.leaf && option.children && option.children.length > 0 && (
                <div
                  class={ns.e('drill-area')}
                  onClick={(e) => {
                    e.stopPropagation();
                    drillDown(option);
                  }}
                >
                  <i class="gct-iconfont icon-youjiantou-Padduan"></i>
                </div>
              )}
            </div>
          ))}
        </van-list>
      );
    };

    /**
     * 渲染无数据状态
     * @returns 无数据组件
     */
    const renderEmpty = () => {
      return (
        <div class="flex justify-center items-center absolute z-0 inset-0">
          <Empty
            iconType={props.searchValue ? 'search' : undefined}
            tip={props.searchValue ? '暂无搜索结果' : '暂无数据'}
          />
        </div>
      );
    };

    return () => {
      return (
        <div class={ns.b()}>
          {/* 面包屑导航 */}
          {renderBreadcrumb()}
          {/* 组织列表 */}
          <div class={[ns.e('content'), 'relative']}>
            {renderOrgList()}
            {/* 无数据状态 */}
            {!currentOptions.value.length && !props.isLoading && renderEmpty()}
          </div>
        </div>
      );
    };
  },
});
