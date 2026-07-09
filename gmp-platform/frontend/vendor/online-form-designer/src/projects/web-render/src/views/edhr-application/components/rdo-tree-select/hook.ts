import { ref, h } from 'vue';
import type { TreeSelectProps } from 'ant-design-vue';
import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';
import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { cacheAdapter } from '/@page-designer/components/widgets/hooks/cacheAdapter';
import selectMore from './select-more.vue';

export function useAsyncOptions({ bindModelKey, modelCategory }) {
  const { businessSetting } = useBusinessSetting();

  const treeData = ref<TreeSelectProps['treeData']>([]);

  const searchField = (businessSetting.productSearchFields || 'name_,code_')?.split(',') || [];

  const getQueryDateByKeyWord = (keyword): object => {
    return (
      searchField?.reduce((total, filedKey: string) => {
        const expkey = filedKey.split('.').length > 1 ? filedKey : filedKey + '.like';
        total[expkey] = keyword;
        return total;
      }, {}) || {}
    );
  };

  const getExp = () => {
    return `OR(${searchField.map((key) => `${key}.like`).join(',')})`;
  };

  async function getRdoAsyncOptions(arg: IParams = {}) {
    let complete = true;
    let optionsData: any[] = [];

    const queryData = arg.keyword ? getQueryDateByKeyWord(arg.keyword) : {};
    const queryExp = arg.keyword ? getExp() : undefined;

    const res: any =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        { bsKey: 'rdoListByPage', modelKey: bindModelKey, modelCategory },
        {
          exp: queryExp,
          query: queryData,
          pageSize: 30,
          pageNo: arg.pageNo,
        },
      )) || {};

    /**自定义数据源可能不存在 totalPage 默认 全部加载完成*/
    complete = res.totalPage ? res.totalPage <= res.pageNo : true;

    optionsData = (res?.data || []).map((i) => {
      const rdoLabel = i.__LABEL__ || i.name_;
      return {
        value: i.id_,
        title: rdoLabel,
        _info: i.__CHILDREN__?.find((k) => k.default_),
        full_path: () =>
          h('div', [
            h('span', `${rdoLabel}`),
            h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default')),
          ]),
        children: i.__CHILDREN__?.map((j) => {
          const versionLabel = j.__LABEL__ || j.version_;
          return {
            value: `${i.id_}:${j.id_}`,
            title: () =>
              h('div', [
                h('span', { class: 'version' }, versionLabel),
                j.default_
                  ? h(
                      'span',
                      { class: 'version gct-custom-tag ml8px' },
                      $t('sys.component.table.settingDensDefault'),
                    )
                  : null,
              ]),
            _info: { ...j },
            full_path: () => h('div', [h('span', `${rdoLabel}:${versionLabel}`)]),
          };
        }),
      };
    });
    return { complete, optionsData };
  }

  /**
   * 补全查询
   * @param v
   */
  async function getChildrens({ id_ } = {}) {
    const [_fId, _cId] = id_?.split(':');

    const res =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        { bsKey: 'rdoListVersionByRefIdsWithParent', modelKey: bindModelKey, modelCategory },
        { foreignFields: [] },
        {
          refIds: id_,
          includeDeleted: 1,
        },
      )) || {};

    const data = res?.data?.[0];

    const rdoLabel = data.__LABEL__ || data.name_;
    let children = [];
    try {
      const chl =
        (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
          { bsKey: 'rdoListVersionById', modelKey: bindModelKey, modelCategory },
          { foreignFields: [] },
          { id: _fId },
        )) || {};
      children = chl.data?.map((i) => {
        const versionLabel = i.__LABEL__ || i.version_;
        return {
          value: `${_fId}:${i.id_}`,
          title: () =>
            h('div', [
              h('span', { class: 'version' }, versionLabel),
              i.default_
                ? h(
                    'span',
                    { class: 'version gct-custom-tag ml8px' },
                    $t('sys.component.table.settingDensDefault'),
                  )
                : null,
            ]),
          _info: { ...i },
          full_path: () => h('div', [h('span', `${rdoLabel}:${versionLabel}`)]),
        };
      });
    } catch (error) {}

    return {
      value: _fId,
      title: rdoLabel,
      full_path: () =>
        h('div', [
          h('span', `${rdoLabel}`),
          h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default')),
        ]),
      children,
    };
  }

  async function getAsyncOptions(arg) {
    if (!arg.pageNo) {
      arg.pageNo = 1;
    }
    const { optionsData, complete } = await cacheAdapter({ ...arg }, getRdoAsyncOptions);
    if (treeData.value?.length) {
      if (arg.pageNo > 1) {
        treeData.value?.pop();
      } else {
        treeData.value = [];
      }
    }
    optionsData.forEach((i) => {
      treeData.value?.push(i);
    });
    if (!complete) {
      treeData.value?.push({
        selectable: false,
        title: () =>
          h(selectMore, {
            onNextOnce: () => {
              arg.pageNo += 1;
              getAsyncOptions(arg);
            },
          }),
      });
    }
  }
  return {
    getChildrens: async (id_) => {
      try {
        if (!id_) return;
        const [_fId, _cId] = id_?.split(':');
        const existingData = treeData.value?.find((i) => i.value === _fId);
        if (existingData) return;
        const row = await cacheAdapter({ id_ }, getChildrens);
        /**第二次验证是否存在  有可能再调接口期间  treeData 更新了*/
        const checked = treeData.value?.find((i) => i.value === _fId);
        if (checked) return;
        row && treeData.value?.unshift(row);
      } catch (error) {}
    },
    getAsyncOptions,
    treeData,
  };
}
