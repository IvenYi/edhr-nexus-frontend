import { computed, defineComponent, PropType, ref, onMounted, watch, nextTick } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { SourceModeEnum } from '../enums';
import { DataResourceItemBI } from './data-resource-item-BI';
import './data-resource-BI.scss';
import { getDatabaseTableInformation } from '/@/apis/gct-platform/DatabaseController';

/**
 * 数据来源
 */
export const DataResourceBI = defineComponent({
  name: 'DataResourceBI',
  props: {
    // 数据源配置
    sourceMode: {
      type: String as PropType<SourceModeEnum>,
      default: SourceModeEnum.ENTITY,
    },
    /**
     * 是否默认展开
     */
    defaultExpand: {
      type: Boolean,
      default: true,
    },
    databaseId: {
      type: String,
      default: '',
    },
  },
  emits: ['update:sourceMode', 'update:expanded'],
  setup(props, { emit }) {
    const ns = useNamespace('data-resource-BI');
    const t = (window as any).$t;

    const activeKey = ref<string[]>([]);

    // 是否展开
    const isExpand = ref(props.defaultExpand);

    // 初始化时通知父组件展开状态
    onMounted(() => {
      emit('update:expanded', isExpand.value);
    });
    // 控制展开和收起
    const toggleExpand = (e: MouseEvent) => {
      e.stopPropagation();
      isExpand.value = !isExpand.value;
      // 通知父组件展开状态变化
      emit('update:expanded', isExpand.value);
    };

    // 选中数据源模式
    const selectedSourceMode = ref(props.sourceMode);
    // 数据源类型可选项
    const sourceModeOptions = computed(() => {
      const vals = Object.values(SourceModeEnum);
      return vals.map((item) => {
        return {
          label: t(`sys.report.dataSet.sourceMode.${item}`),
          value: item,
        };
      });
    });

    // 搜索值
    const searchValue = ref('');
    // 触发搜索
    const onSearch = (value: string) => {
      searchValue.value = value;
    };
    // 可拖拽数据项
    const options = ref<IObject[] | IObject>({});

    const showOptions = computed(() => {
      const searchVal = searchValue.value.trim();
      if (!searchVal) {
        return options.value;
      }
      let _opts: IObject | IObject[] = [];
      if (Array.isArray(options.value)) {
        _opts = options.value.filter((item) => {
          return item.name.includes(searchVal);
        });
      } else {
        const keys = Object.keys(options.value);
        _opts = {};
        keys.forEach((key) => {
          const items = options.value[key];
          const isIncludeGroup = key.includes(searchVal);
          const _items = items.filter((item: IObject) => {
            return item.name.includes(searchVal);
          });
          if (_items.length > 0) {
            _opts[key] = _items;
          } else if (isIncludeGroup) {
            _opts[key] = items;
          }
        });
      }
      return _opts;
    });

    /**
     * 默认展开所有分组
     *
     * @returns {*}  {void}
     */
    function calcActiveKey(): void {
      activeKey.value = [];
      if (Array.isArray(options.value)) {
        return;
      } else {
        const keys = Object.keys(options.value);
        keys.forEach((_, i) => {
          activeKey.value.push(i.toString());
        });
      }
    }

    /**
     * 加载实体数据源选项
     *
     * @returns {*}  {Promise<void>}
     */
    async function loadModelOptions(): Promise<void> {
      const arr = await getDatabaseTableInformation({ id: props.databaseId });
      // options.value = groupBy(arr, 'group');
      await nextTick();
      options.value = arr;
      calcActiveKey();
    }

    /**
     * 加载选项
     *
     * @returns {*}  {Promise<void>}
     */
    async function loadOptions(): Promise<void> {
      loadModelOptions();
    }

    /**
     * 初始化
     *
     * @returns {*}  {Promise<void>}
     */
    async function onInit(): Promise<void> {
      // 默认加载数据源
      await loadOptions();
    }

    onInit();

    watch(
      () => props.databaseId,
      () => {
        loadOptions();
      },
    );

    function renderItem(index: number, item: IObject) {
      // 将 sourceMode 传递给 DataResourceItem
      return (
        <DataResourceItemBI
          key={index}
          index={index}
          data={item}
          sourceMode={selectedSourceMode.value}
        />
      );
    }

    // function renderGroup(i: number, title: string, items: IObject[]) {
    //   return (
    //     <a-collapse-panel
    //       key={i.toString()}
    //       header={<span class={ns.e('collapse-panel-title')}>{title}</span>}
    //     >
    //       {items.map((item) => {
    //         return renderItem(i, item);
    //       })}
    //     </a-collapse-panel>
    //   );
    // }

    function renderList() {
      if (Array.isArray(showOptions.value)) {
        return showOptions.value.map((item, index) => {
          const data = { ...item, databaseId: props.databaseId };
          return renderItem(index, data);
        });
      }
      // const groups = Object.keys(showOptions.value);
      // const key = selectedSourceMode.value + showOptions.value.length;
      // return (
      //   <a-collapse
      //     key={key}
      //     v-model:activeKey={activeKey.value}
      //     ghost
      //     expandIcon={(props) => {
      //       return <CaretRightOutlined class={ns.is('active', props.isActive)} />;
      //     }}
      //   >
      //     {groups.map((group, i) => {
      //       const items = showOptions.value[group];
      //       return renderGroup(i, group, items);
      //     })}
      //   </a-collapse>
      // );
    }

    return {
      ns,
      t,
      isExpand,
      toggleExpand,
      selectedSourceMode,
      sourceModeOptions,
      searchValue,
      onSearch,
      renderList,
    };
  },
  render() {
    return (
      <div class={[this.ns.b(), this.ns.is('retract', !this.isExpand)]}>
        <div class={this.ns.e('body')}>
          <div class={this.ns.e('data-label')}>数据表</div>
          <div class={this.ns.e('data-search')}>
            <a-input
              class={this.ns.e('search')}
              v-model:value={this.searchValue}
              placeholder={this.t('sys.dataSet.searchDataTablePlaceholder')}
              allow-clear
              onSearch={this.onSearch}
              suffix={
                <i class="iconfont icon-sousuo" onClick={() => this.onSearch(this.searchValue)} />
              }
            />
          </div>
          <div class={[this.ns.e('data-list'), 'mt-10px']}>{this.renderList()}</div>
        </div>
      </div>
    );
  },
});
