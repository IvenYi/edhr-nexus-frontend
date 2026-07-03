import { PropType, computed, defineComponent, inject, onUnmounted, ref } from 'vue';
import {
  IEditFormController,
  IFormItemController,
  ISelectEditor,
  useNamespace,
} from '@gct/runtime';
import './gct-form-group-select.scss';

export const GctFormSelectGroup = defineComponent({
  name: 'GctFormSelectGroup',
  props: {
    c: {
      type: Object as PropType<IFormItemController>,
      required: true,
    },
    model: {
      type: Object as PropType<ISelectEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
    size: {
      type: String,
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const ns = useNamespace('form-select-group');

    const formC = inject('formController') as IEditFormController;

    const searchValue = ref<string>('');

    const selectRef = ref<any>(null);

    const open = ref(false);

    // 分组收缩状态管理，存在里边的值表示该分组已收起
    const collapsedGroups = ref<Set<string>>(new Set());

    const nameVal = computed({
      get() {
        if (props.model.nameField) {
          return (formC.item[props.model.nameField] as IFormItemController).value;
        }
        return '';
      },
      set(v) {
        if (props.model.nameField) {
          return ((formC.item[props.model.nameField] as IFormItemController).editorValue = v);
        }
      },
    });

    function findParentByClassName(el: HTMLElement, className: string) {
      if (el.className.indexOf(className) > -1) {
        return el;
      }
      if (el.parentElement) {
        return findParentByClassName(el.parentElement, className);
      }
      return null;
    }

    function onWheel(e: MouseEvent) {
      const el = findParentByClassName(e.target as HTMLElement, 'ant-select-dropdown');
      if (el) {
        return;
      }
      selectRef.value?.blur();
    }
    window.addEventListener('wheel', onWheel);

    const rootRef = ref();

    const val = computed({
      get: () => {
        const opt = props.c.state.options.find((_) => {
          return _.value === props.value;
        });
        if (!opt && nameVal.value) {
          return nameVal.value;
        }
        return props.value || undefined;
      },
      set: (newVal: any) => {
        if (!newVal) {
          emit('update:value', undefined);
          nameVal.value = '';
          return;
        }
        if (typeof newVal === 'string') {
          newVal = newVal.trim();
        }
        emit('update:value', newVal);
        let item;
        options.value.find((_) => {
          if (_.children) {
            item = _.children.find((item) => {
              return item.value == newVal;
            });
          }
          if (item) {
            return true;
          }
          return false;
        });
        if (item) {
          nameVal.value = item.label;
        }
      },
    });

    const options = computed(() => {
      if (props.c.state.options && props.c.state.options.length > 0) {
        return props.c.state.options;
      }
      return [];
    });

    const loadOptions = async () => {
      return props.c.loadDictionary();
    };

    // 初始化有值时直接加载选项
    if (val.value != null) {
      loadOptions();
    }

    // 切换分组收缩状态
    const toggleGroupCollapse = (groupValue: string) => {
      if (!props.model.groupCollapsible) {
        return;
      }
      if (collapsedGroups.value.has(groupValue)) {
        collapsedGroups.value.delete(groupValue);
      } else {
        collapsedGroups.value.add(groupValue);
      }
    };

    // 判断分组是否收缩
    const isGroupCollapsed = (groupValue: string) => {
      if (props.model.groupCollapsible !== true) {
        return true;
      }
      // 存在组里则收起
      return collapsedGroups.value.has(groupValue) ? false : true;
    };

    onUnmounted(() => {
      window.removeEventListener('wheel', onWheel);
    });

    return {
      ns,
      selectRef,
      searchValue,
      open,
      rootRef,
      val,
      options,
      loadOptions,
      toggleGroupCollapse,
      isGroupCollapsed,
    };
  },
  render() {
    return (
      <div ref="rootRef" class={this.ns.b()}>
        <a-select
          ref="selectRef"
          open={this.open}
          v-model:value={this.val}
          allowClear
          disabled={this.c.state.disabled}
          size={this.size}
          placeholder={this.model.placeholder}
          onDropdownVisibleChange={this.loadOptions}
          show-search
          filter-option={(input: string, option: any) => {
            return true; // 这里不需要过滤选项，搜索功能在下拉框内实现
          }}
          searchValue={this.searchValue}
          onSearch={val => this.searchValue = val?.trim()}
          onFocus={() => (this.open = true)}
          onBlur={() => (this.open = false)}
          onChange={() => (this.open = false)}
        >
          {this.options.map((option) => {
            const labelGroup = option.label != null ? option.label : ' ';
            const groupKey = String(option.value);
            const isCollapsed = this.isGroupCollapsed(groupKey);
            const items = (!isCollapsed ? [] : option.children || []).filter((item) => {
              if (this.searchValue) {
                return item.label.toLowerCase().indexOf(this.searchValue.toLowerCase()) >= 0;
              }
              return true;
            });
            if (items.length === 0) {
              return null; // 如果没有子项，则不渲染该分组
            }
            return (
              <a-select-opt-group
                key={option.value}
                label={
                  <div
                    class={[
                      this.ns.b('group-header'),
                      this.model.groupCollapsible ? this.ns.b('group-header--clickable') : '',
                    ]}
                    onClick={() => this.toggleGroupCollapse(groupKey)}
                  >
                    {this.model.groupCollapsible && (
                      <span
                        class={[
                          this.ns.be('group-header', 'arrow'),
                          isCollapsed ? this.ns.bem('group-header', 'arrow', 'collapsed') : '',
                        ]}
                      >
                        <i class={["iconfont", isCollapsed != true ? 'icon-right' : 'icon-Down', ]}></i>
                      </span>
                    )}
                    <span class={this.ns.be('group-header', 'title')}>{labelGroup}</span>
                  </div>
                }
              >
                {items.map((item) => {
                  return (
                    <a-select-option
                      class={this.ns.b('item-option')}
                      key={item.value}
                      value={item.value}
                    >
                      {item.icon ? (
                        <span class={this.ns.be('item-option', 'item-icon')}>
                          <i class={`iconfont ${item.icon}`}></i>
                        </span>
                      ) : (
                        ''
                      )}
                      <span class={this.ns.be('item-option', 'item-label')}>{item.label}</span>
                    </a-select-option>
                  );
                })}
              </a-select-opt-group>
            );
          })}
        </a-select>
      </div>
    );
  },
});

export default GctFormSelectGroup;
