import { defineComponent, ref, watch, h } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { List } from 'vant';
import { Checkbox, Radio } from '/@page-designer/components/common';
import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';

import { Empty } from '../../../common';
import type { Option } from '../../types';
import './printer-select.scss';

export const PrinterSelect = defineComponent({
  name: 'PrinterSelect',
  components: {
    'van-list': List,
  },
  props: {
    options: {
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
    refVersion: {
      //是否引用版本 逻辑参考pc
      type: Boolean,
      default: false,
    },
  },
  emits: ['load', 'change'],
  setup(props, { emit }) {
    const ns = useNamespace('rdo-select');
    console.log(props.options);
    // 展开状态管理：记录哪些父节点是展开的
    const expandedItems = ref<Set<string>>(new Set());
    // 记录已存在的选项值，用于对比新增项
    const existingOptionValues = ref<Set<string>>(new Set());

    /**
     * 初始化或更新展开状态
     * 首次加载时展开所有有子节点的父节点
     * 分页加载时只展开新增的有子节点的父节点，保持已存在项的展开状态
     * @param options 选项列表
     */
    const updateExpandedItems = (options: Option[]): void => {
      const currentOptionValues = new Set(options.map((option) => option.value as string));

      // 如果是首次加载（existingOptionValues 为空），展开所有有子节点的父节点
      if (existingOptionValues.value.size === 0) {
        expandedItems.value.clear();
        options.forEach((option) => {
          if (option.children && option.children.length > 0) {
            expandedItems.value.add(option.value as string);
          }
        });
      } else {
        // 分页加载模式：只对新增的选项进行默认展开
        options.forEach((option) => {
          const optionValue = option.value as string;
          // 如果是新增的选项且有子节点，则默认展开
          if (
            !existingOptionValues.value.has(optionValue) &&
            option.children &&
            option.children.length > 0
          ) {
            expandedItems.value.add(optionValue);
          }
        });
      }

      // 更新已存在的选项值记录
      existingOptionValues.value = currentOptionValues;
    };

    // 监听 options 变化，更新展开状态
    watch(
      () => props.options,
      (newOptions) => {
        console.log('Options changed:', newOptions.length);
        updateExpandedItems(newOptions);
      },
      { immediate: true },
    );
    watch(
      () => props.options.length,
      () => {
        updateExpandedItems(props.options);
      },
    );

    /**
     * 处理加载更多
     */
    const handleLoad = (): void => {
      emit('load');
    };

    /**
     * 处理选项点击
     * @param value 选项值
     * @param option 选项对象
     */
    const handleClick = (value: string, option: Option): void => {
      if (option.isInterParent) return;
      if (props.refVersion && option.children) {
        const defaultChild = option.children.find((child: Option) => child._protoValue?.default_);
        if (!defaultChild) return;
        emit('change', defaultChild.value, defaultChild);
      } else {
        emit('change', value, option);
      }
    };

    /**
     * 切换展开/收缩状态
     * @param itemValue 项的值
     */
    const toggleExpanded = (itemValue: string): void => {
      if (expandedItems.value.has(itemValue)) {
        expandedItems.value.delete(itemValue);
      } else {
        expandedItems.value.add(itemValue);
      }
    };

    /**
     * 渲染父节点（RDO 分类）
     * @param option 父节点选项
     * @returns 渲染结果
     */
    const renderParentItem = (option: Option) => {
      const isExpanded = expandedItems.value.has(option.value as string);

      return (
        <div key={option.value} class={ns.e('parent-item')}>
          <div
            class={[
              ns.e('parent-content'),
              option.disabled ? 'opacity-40 pointer-events-none' : '',
            ]}
            onClick={() => handleClick(option.value as string, option)}
          >
            {/* 展开收缩热区 */}
            <div
              class={ns.e('expand-area')}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(option.value as string);
              }}
            >
              <i
                class={[
                  'gct-iconfont',
                  'icon-zujianziduan-youjiantou2',
                  ns.e('expand-icon'),
                  isExpanded ? ns.em('expand-icon', 'expanded') : '',
                ]}
              />
            </div>

            {/* 标题 */}
            <div class={ns.e('parent-label')}>{option.label}</div>

            {/* 选择框 */}
            {!option.isInterParent && (
              <div class={ns.e('checkbox-area')}>
                {h(props.multiple ? Checkbox : Radio, {
                  checked: props.selectedValues.includes(option.value as string),
                  style: { width: '20px', height: '20px' },
                })}
              </div>
            )}
          </div>

          {/* 子节点列表 */}
          {isExpanded && (
            <div class={ns.e('children-list')}>
              {option.children!.map((child) => renderChildItem(child))}
            </div>
          )}
        </div>
      );
    };

    /**
     * 渲染子节点（RDO 版本）
     * @param child 子节点选项
     * @returns 渲染结果
     */
    const renderChildItem = (child: Option) => {
      const isDefault = child.defaultPrint === '是';

      return (
        <div
          key={child.value}
          class={[ns.e('child-item'), child.disabled ? 'opacity-40 pointer-events-none' : '']}
          onClick={() => handleClick(child.value as string, child)}
        >
          {/* 缩进空间 */}
          <div class={ns.e('child-indent')} />

          {/* 标题区域 */}
          <div class={ns.e('child-content')}>
            <div class={ns.e('child-label')}>{child.label}</div>
            {isDefault && <div class={ns.e('default-badge')}>默认</div>}
          </div>

          {/* 选择框 */}
          <div class={ns.e('checkbox-area')}>
            {h(props.multiple ? Checkbox : Radio, {
              checked: props.selectedValues.includes(child.value as string),
              style: { width: '20px', height: '20px' },
            })}
          </div>
        </div>
      );
    };

    /**
     * 渲染选项列表
     * @returns 选项列表组件
     */
    const renderRdoList = () => {
      return (
        <van-list loading={props.isLoading} finished={props.isFinished} onLoad={handleLoad}>
          {props.options.map((option) => renderParentItem(option))}
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
          {renderRdoList()}
          {/* 无数据状态 */}
          {!props.options.length && !props.isLoading && renderEmpty()}
        </div>
      );
    };
  },
});
