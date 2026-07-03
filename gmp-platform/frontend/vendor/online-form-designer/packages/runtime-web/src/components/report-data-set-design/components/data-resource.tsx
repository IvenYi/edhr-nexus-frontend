import { computed, defineComponent, PropType, ref, onMounted } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { groupBy } from 'lodash-es';
import { SourceModeEnum } from '../enums';
import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { DataResourceItem } from './data-resource-item';
import { SourceModeIconEnum } from '../constants';
import { getReportListSystemModels } from '/@/apis/gct-apaas/ReportController';
import {
  getOnlineFormTmplFormModelsById,
  getOnlineFormTmplListBaseAndProcessForm,
} from '/@/apis/gct-apaas/OnlineFormTmplController';
import './data-resource.scss';
import { CaretRightOutlined } from '@ant-design/icons-vue';

/**
 * 数据来源
 */
export const DataResource = defineComponent({
  name: 'DataResource',
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
  },
  emits: ['update:sourceMode', 'update:expanded'],
  setup(props, { emit }) {
    const ns = useNamespace('data-resource');
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
    // 数据源模式变化
    const onSourceModeChange = (value: SourceModeEnum) => {
      if (selectedSourceMode.value != value) {
        selectedSourceMode.value = value;
        // 触发更新
        emit('update:sourceMode', value);
        searchValue.value = '';
        loadOptions();
      }
    };

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
    async function loadModelOptions(category: string): Promise<void> {
      const arr = await getModelComprehensiveModelSummary({
        type: 'NDO,BASE,TREE,TRANSACTION,SIGN',
        category,
        report: true,
      });
      options.value = groupBy(arr, 'group');
      calcActiveKey();
    }

    async function loadFormOptions(): Promise<void> {
      const items = await getOnlineFormTmplListBaseAndProcessForm();
      if (items && items.length > 0) {
        const models = await Promise.all(
          items.map(async (item) => {
            const res = await getOnlineFormTmplFormModelsById({ id: item.id! });
            res?.forEach((model) => {
              model.group = item.name;
              (model as any).formType = item.formType;
            });
            return res;
          }),
        );
        options.value = groupBy(models.flat(), 'group');
      } else {
        options.value = [];
      }
      calcActiveKey();
    }

    /**
     * 加载系统数据源选项
     *
     * @returns {*}  {Promise<void>}
     */
    async function loadSystemOptions(): Promise<void> {
      options.value = (await getReportListSystemModels()) || [];
      calcActiveKey();
    }

    /**
     * 加载选项
     *
     * @returns {*}  {Promise<void>}
     */
    async function loadOptions(): Promise<void> {
      switch (selectedSourceMode.value) {
        case SourceModeEnum.VIEW:
          return loadModelOptions(SourceModeEnum.VIEW);
        case SourceModeEnum.FORM:
          return loadFormOptions();
        case SourceModeEnum.SYSTEM:
          return loadSystemOptions();
        case SourceModeEnum.ENTITY:
          return loadModelOptions(SourceModeEnum.ENTITY);
      }
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

    function renderItem(i: number, item: IObject) {
      // 将 sourceMode 传递给 DataResourceItem
      return (
        <DataResourceItem
          key={item.id}
          index={i}
          data={item}
          sourceMode={selectedSourceMode.value}
        />
      );
    }

    function renderGroup(i: number, title: string, items: IObject[]) {
      return (
        <a-collapse-panel
          key={i.toString()}
          header={<span class={ns.e('collapse-panel-title')}>{title}</span>}
        >
          {items.map((item) => {
            return renderItem(i, item);
          })}
        </a-collapse-panel>
      );
    }

    function renderList() {
      if (Array.isArray(showOptions.value)) {
        return showOptions.value.map((item, i) => {
          return renderItem(i, item);
        });
      }
      const groups = Object.keys(showOptions.value);
      const key = selectedSourceMode.value + showOptions.value.length;
      return (
        <a-collapse
          key={key}
          v-model:activeKey={activeKey.value}
          ghost
          expandIcon={(props) => {
            return <CaretRightOutlined class={ns.is('active', props.isActive)} />;
          }}
        >
          {groups.map((group, i) => {
            const items = showOptions.value[group];
            return renderGroup(i, group, items);
          })}
        </a-collapse>
      );
    }

    return {
      ns,
      t,
      isExpand,
      toggleExpand,
      selectedSourceMode,
      sourceModeOptions,
      onSourceModeChange,
      searchValue,
      onSearch,
      renderList,
    };
  },
  render() {
    return (
      <div class={[this.ns.b(), this.ns.is('retract', !this.isExpand)]}>
        <div class={this.ns.e('sidebar')}>
          <div class={this.ns.e('sidebar-icon')}>
            <i class="iconfont icon-AlignLeft" onClick={this.toggleExpand} />
          </div>
          <div class={this.ns.e('sidebar-label')}>{this.t('sys.dataSet.dataSource')}</div>
        </div>
        <div class={this.ns.e('header')}>
          <div class={this.ns.e('header-label')}>{this.t('sys.dataSet.dataSource')}</div>
          <div class={this.ns.e('header-icon')}>
            <i class="iconfont icon-AlignLeft" onClick={this.toggleExpand} />
          </div>
        </div>
        <div class={this.ns.e('source')}>
          <div class={this.ns.e('source-label')}>{this.t('sys.dataSet.selectDataSource')}</div>
          <div class={this.ns.e('source-select')}>
            <a-select
              value={this.selectedSourceMode}
              placeholder={this.t('sys.pleaseSelectSth')}
              onChange={this.onSourceModeChange}
            >
              {this.sourceModeOptions.map((item) => {
                return (
                  <a-select-option
                    class={this.ns.e('source-option')}
                    value={item.value}
                    key={item.value}
                  >
                    <div class={this.ns.e('source-option')}>
                      <span class={this.ns.e('source-icon')}>
                        <i class={['iconfont', SourceModeIconEnum[item.value]]} />
                      </span>
                      <span class={this.ns.e('source-label')}>{item.label}</span>
                    </div>
                  </a-select-option>
                );
              })}
            </a-select>
          </div>
        </div>
        <div class={this.ns.e('body')}>
          <div class={this.ns.e('data-label')}>{this.t('sys.dataSet.modelLabel')}</div>
          <div class={this.ns.e('data-search')}>
            <a-input
              class={this.ns.e('search')}
              v-model:value={this.searchValue}
              placeholder={this.t('sys.dataSet.searchModelPlaceholder')}
              allow-clear
              onSearch={this.onSearch}
              suffix={
                <i class="iconfont icon-sousuo" onClick={() => this.onSearch(this.searchValue)} />
              }
            />
          </div>
          <div class={this.ns.e('data-list')}>{this.renderList()}</div>
        </div>
      </div>
    );
  },
});
