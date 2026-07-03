import { EntityModelCategoryEnum, IModalData } from '@gct/runtime';
import QueryTabConfig from './query-tab-config.vue';
import QueryTabModal from './query-tab-modal.vue';
import { IQueryTab, IQueryTabConfig, QueryTabControllerConstructorOpts } from './types';
import { postStash, getStashFindByClientKey, deleteStash } from '/@/apis/gct-apaas/StashController';
import { cloneDeep, isNil } from 'lodash-es';
import dayjs from 'dayjs';
import { useGetBodyBySearch } from '/@page-designer/components/widgets/hooks/hooks';
import { reactive } from 'vue';
import { QueryValueType } from './constants';

/** 根据类型获取动态的时间范围值 */
function getTimeRange(type) {
  if (type !== 'week') {
    return {
      start: dayjs().startOf(type).format('YYYY-MM-DD HH:mm:ss'),
      end: dayjs().endOf(type).format('YYYY-MM-DD HH:mm:ss'),
    };
  } else {
    const currentDate = dayjs();
    const day = currentDate.day();
    const subtractDays = day === 0 ? 6 : day - 1;
    const start = currentDate.subtract(subtractDays, 'day').startOf('day');
    const end = start.add(6, 'day').endOf('day');
    return {
      start: start.format('YYYY-MM-DD HH:mm:ss'),
      end: end.format('YYYY-MM-DD HH:mm:ss'),
    };
  }
}

/** 默认的配置数据 */
const DefaultQueryConfig: IQueryTabConfig = {
  hiddenTabs: [],
  customTabs: [],
  builtinTabs: [],
};

export class QueryTabController {
  opts: QueryTabControllerConstructorOpts;

  configData?: IQueryTabConfig;

  state = reactive<{
    tabs: IQueryTab[];
  }>({
    tabs: [],
  });

  constructor(opts: QueryTabControllerConstructorOpts) {
    this.opts = opts;
  }

  /** 获取存储的配置数据 */
  async getStoredConfig() {
    try {
      const res = await getStashFindByClientKey({ clientKey: this.opts.configId });
      // if (!res) {
      //   // 没有后台配置的时候给默认的配置数据
      //   this.configData = cloneDeep(DefaultQueryConfig);
      //   // 创建一条后台数据，不然修改接口改不进去（后面让后台提供创建并更新接口）
      //   postSysConfig({
      //     id: this.opts.configId,
      //     value: JSON.stringify(this.configData),
      //   });
      //   return;
      // }
      this.configData = res?.content ? JSON.parse(res.content) : cloneDeep(DefaultQueryConfig);
      // 更新最新的内置页面数据
      this.configData!.builtinTabs = this.opts.builtinTabs;
      console.log(this.configData, 'configData');
    } catch (error) {
      console.log('getStoredConfig错误', error);
    }
  }

  /** 保存或修改配置数据 */
  async saveConfig(config: IQueryTabConfig) {
    // putSysConfigById({ id: this.opts.configId }, { value: JSON.stringify(config) });
    postStash({ clientKey: this.opts.configId, content: JSON.stringify(config) });
    this.configData = config;
  }

  /** 清除存储的配置数据 */
  async clearStoreConfig() {
    deleteStash({ ids: this.opts.configId });
    this.configData = undefined;
  }

  /** 刷新tabs的数据(根据this.configData重新计算tabs相关数据,并请求计数) */
  async refreshTabs() {
    const showTabs = [...this.configData!.builtinTabs, ...this.configData!.customTabs].filter(
      (i) => !this.configData!.hiddenTabs.includes(i.id),
    );
    console.log('showTabs', showTabs);
    this.state.tabs = showTabs;
    await this.refreshTabsCount();
  }

  /**
   * 刷新计数数据（根据tabs配置请求数据）
   */
  async refreshTabsCount() {
    if (!this.opts.countRequest) {
      console.error('countRequest未配置');
      return;
    }
    for (const tab of this.state.tabs) {
      const query = this.parseTabQuery(tab);
      const count = await this.opts.countRequest!(query);
      tab.count = count;
    }
    console.log('refreshTabsCount', this.state.tabs);
  }

  /** 初始化逻辑 */
  async init() {
    await this.getStoredConfig();
    await this.refreshTabs();
  }

  /** 打开抽屉并修改config */
  async openConfigDrawer(config: IQueryTabConfig) {
    const res = await gct.openUtil.drawer<IModalData>(
      QueryTabConfig,
      { controller: this, config },
      {
        title: $t('sys.appDesigner.add'),
        width: 400,
        showFooter: true,
      },
    );
    return {
      isModified: !!res.ok,
      config: res.data![0] as IQueryTabConfig,
    };
  }

  /** 补全移动端要的配置 */
  completeMobileConfig(config: IQueryTabConfig) {
    const { customTabs, builtinTabs } = config;
    [...customTabs, ...builtinTabs].forEach((tab) => {
      for (const key in tab.queryFields) {
        const queryField = tab.queryFields[key];
        if (queryField.field || queryField.ope) {
          return;
        }
        // 补充漏的field和ope
        const fieldWidget = this.opts.searchWidgets.find((i) => i.id === key);
        if (fieldWidget && queryField) {
          Object.assign(queryField, {
            field: fieldWidget.props.field,
            ope: fieldWidget.props.ope,
          });
        } else {
          console.warn(`${key}字段在搜索组件中不存在`);
        }
      }
    });
  }

  /** 编辑总的配置 */
  async editConfig() {
    const res = await this.openConfigDrawer(this.configData || cloneDeep(DefaultQueryConfig));
    if (res.isModified) {
      this.completeMobileConfig(res.config);
      await this.saveConfig(res.config);
      await this.refreshTabs();
    }
  }

  /** 打开模态并编辑Tab配置，无修改则返回undefined */
  async editTab(tab: IQueryTab) {
    const res = await gct.openUtil.modal<IModalData>(
      QueryTabModal,
      { tab, searchWidgets: this.opts.searchWidgets, modelCategory: this.opts.modelCategory },
      {
        title: $t('sys.edhr.queryDefinitionPage'),
        width: 1000,
        okText: $t('sys.okText'),
      },
    );
    if (!res.ok) {
      return;
    }
    return res.data![0] as IQueryTab;
  }

  /** 解析存储的值并转换成接口要的query */
  parseTabQuery(tab: IQueryTab): IParams {
    const formState: IParams = {};
    for (const key in tab.queryFields) {
      const field = tab.queryFields[key];
      if (field.valueType === QueryValueType.RAW && !isNil(field.rawValue)) {
        formState[key] = field.rawValue;
      } else if (field.valueType === QueryValueType.DYNAMIC_DATE && field.dynamicDateType) {
        // 计算
        const { start, end } = getTimeRange(field.dynamicDateType);
        formState[key] = [start, end];
      }
    }
    const { query } = useGetBodyBySearch(formState, this.opts.searchWidgets);
    console.log('parseTabQuery', query, tab);
    return query;
  }
}
