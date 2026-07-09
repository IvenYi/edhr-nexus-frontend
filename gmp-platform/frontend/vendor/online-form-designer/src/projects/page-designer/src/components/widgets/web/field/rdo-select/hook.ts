import type { TreeSelectProps } from 'ant-design-vue';
import { ref, h, nextTick } from 'vue';
import {
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  postModelComprehensiveQueryRefChainDataByModelCategory,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { cacheAdapter } from '/@page-designer/components/widgets/hooks/cacheAdapter';
import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
import { IRuleConfig } from '/@/components/relationship-diagram-config';
import { QueryRefChainDataRequest } from 'packages/runtime/src';
import selectMore from './select-more.vue';

export function useAsyncOptions({
  fieldKey,
  modelKey,
  bindModelKey,
  customApi,
  modelCategory,
  rdoUniqueFieldKey,
}) {
  const rdoApis = customApi || postModelDataQueryRefData;
  const treeData = ref<TreeSelectProps['treeData']>([]);

  const selectValueLabel = ref();
  function calcLinkageData(
    fieldKey: string,
    data: IData,
    ruleConfig: IRuleConfig,
  ): QueryRefChainDataRequest {
    const first = ruleConfig.nodes[0];
    const last = ruleConfig.nodes[ruleConfig.nodes.length - 1];
    const val = data[ruleConfig.fieldId!] || data[ruleConfig.fieldKey!];
    if (first !== last && !last.fieldKey) {
      last.fieldKey = 'id_';
      last.modelCategory = 'entity';
    }
    return {
      dataIds: val,
      modelKey: ruleConfig.modelKey,
      fieldKey,
      refModelChain: ruleConfig.nodes,
    };
  }

  async function getRdoAsyncOptions(arg: IParams = { isLinkage: false }) {
    let complete = true;
    let optionsData: any[] = [];
    let res: any = {};

    if (arg.keyword && arg.queryData) {
      arg.queryData[`${rdoUniqueFieldKey}.like`] = arg.keyword;
    }
    if (arg.isLinkage === true) {
      const { modelCategory, fieldKey, data, ruleConfig } = arg;
      const linkageData = calcLinkageData(fieldKey, data, ruleConfig);
      if (!linkageData.dataIds) {
        return { complete, optionsData };
      }
      res  = await postModelComprehensiveQueryRefChainDataByModelCategory(
        { modelCategory: modelCategory! },
        {
          // keyword: arg.keyword,
          pageSize: arg.pageSize ?? 30,
          pageNo: arg.pageNo,
          query: arg.queryData,
          exp: arg.exp,
          ...linkageData,
        },
      );
      /**自定义数据源可能不存在 totalPage 默认 全部加载完成*/
      complete = res?.totalPage ? res?.totalPage <= res?.pageNo : true;
      if (res?.data) {
        optionsData = (res.data as IData[])!.map((i) => {
          const rdoLabel = i.__LABEL__ || i.name_;
          return {
            label: rdoLabel,
            value: i.id_,
            title: i.__SHOW_LABEL__ || rdoLabel,
            _info: i.__CHILDREN__?.find((k) => k.default_),
            full_path: () =>
              h('div', [
                h('span', `${rdoLabel}`),
                h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default')),
              ]),
            children: i.__CHILDREN__?.map((j) => {
              const versionName = j.__LABEL__ || j.version_;
              return {
                label: rdoLabel,
                versionName: versionName,
                value: `${i.id_}:${j.id_}`,
                title: () =>
                  h('div', [
                    h('span', { class: 'version' }, versionName),
                    j.default_
                      ? h('span', { class: 'version gct-custom-tag ml8px' }, $t('sys.default'))
                      : null,
                  ]),
                name: versionName,
                default_: j.default_,
                _info: { ...j },
                full_name: j.__SHOW_LABEL__ ? j.__SHOW_LABEL__ : `${rdoLabel}:${versionName}`,
                full_path: () => h('div', [h('span', `${rdoLabel}:${versionName}`)]),
              };
            }),
          };
        });
      }
    } else {
      res =
        (await rdoApis({
          fieldKey,
          modelKey,
          // keyword: arg.keyword,
          pageSize: arg.pageSize ?? 30,
          pageNo: arg.pageNo,
          query: arg.queryData,
          exp: arg.exp,
        })) || {};
      /**自定义数据源可能不存在 totalPage 默认 全部加载完成*/
      complete = res.totalPage ? res.totalPage <= res.pageNo : true;
      optionsData = (res?.data || []).map((i) => {
        const rdoLabel = i.__LABEL__ || i.name_;

        return {
          label: rdoLabel,
          value: i.id_,
          title: i.__SHOW_LABEL__ || rdoLabel,
          _info: i.__CHILDREN__?.find((k) => k.default_),
          full_path: () =>
            h('div', [
              h('span', `${rdoLabel}`),
              h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default')),
            ]),
          children: i.__CHILDREN__?.map((j) => {
            const versionName = j.__LABEL__ || j.version_;
            return {
              label: rdoLabel,
              versionName: versionName,
              value: `${i.id_}:${j.id_}`,
              title: () =>
                h('div', [
                  h('span', { class: 'version' }, versionName),
                  j.default_ ? h('span', { class: 'version gct-custom-tag ml8px' }, $t('sys.default')) : null,
                ]),
              name: versionName,
              default_: j.default_,
              _info: { ...j },
              full_name: j.__SHOW_LABEL__ ? j.__SHOW_LABEL__ : `${rdoLabel}:${versionName}`,
              full_path: () => h('div', [h('span', `${rdoLabel}:${versionName}`)]),
            };
          }),
        };
      });
    }
    return { complete, optionsData, res };
  }
  /**
   * 补全查询
   * @param v
   */
  async function getChildrens({ id_ } = {}) {
    if (!id_) return;
    const [_fId, _cId] = id_?.split(':');
    const res =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        { bsKey: 'rdoListVersionByRefIdsWithParent', modelKey: bindModelKey, modelCategory },
        { foreignFields: [] },
        {
          refIds: id_,
          includeDeleted: 1,
          originalFieldKey: fieldKey,
          originalModelKey: modelKey,
        },
      )) || {};
    const data = res?.data?.[0];
    const rdoLabel = data.__LABEL__ || data.name_;
    // let children = [];
    // 下面的children 删除查不到的时候 __CHILDREN__可以兜底
    // try {
    //   const chl =
    //     (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
    //       { bsKey: 'rdoListVersionById', modelKey: bindModelKey, modelCategory },
    //       { foreignFields: [] },
    //       { id: _fId, originalFieldKey: fieldKey, originalModelKey: modelKey },
    //     )) || {};
    //   children = (chl.data?.length ? chl.data : data.__CHILDREN__)?.map((i) => {
    //     const versionName = i.__LABEL__ || i.version_;
    //     return {
    //       label: versionName,
    //       versionName: versionName,
    //       value: `${_fId}:${i.id_}`,
    //       title: () =>
    //         h('div', [
    //           h('span', { class: 'version' }, versionName),
    //           i.default_ ? h('span', { class: 'version gct-custom-tag ml8px' }, '默认') : null,
    //         ]),
    //       name: versionName,
    //       default_: i.default_,
    //       _info: { ...i },
    //       full_name: i.__SHOW_LABEL__ ? i.__SHOW_LABEL__ : `${rdoLabel}:${versionName}`,
    //       full_path: () => h('div', [h('span', `${rdoLabel}:${versionName}`)]),
    //     };
    //   });
    // } catch (error) {}
    return {
      label: rdoLabel,
      value: _fId,
      title: data.__SHOW_LABEL__ || rdoLabel,
      _info: data.__CHILDREN__?.find((k) => k.default_),
      full_path: () =>
        h('div', [
          h('span', `${rdoLabel}`),
          h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default')),
        ]),
      children: data.__CHILDREN__?.map((j) => {
        const versionName = j.__LABEL__ || j.version_;
        return {
          label: rdoLabel,
          versionName: versionName,
          value: `${data.id_}:${j.id_}`,
          title: () =>
            h('div', [
              h('span', { class: 'version' }, versionName),
              j.default_ ? h('span', { class: 'version gct-custom-tag ml8px' }, $t('sys.default')) : null,
            ]),
          name: versionName,
          default_: j.default_,
          _info: { ...j },
          full_name: j.__SHOW_LABEL__ ? j.__SHOW_LABEL__ : `${rdoLabel}:${versionName}`,
          full_path: () => h('div', [h('span', `${rdoLabel}:${versionName}`)]),
        };
      }),
    };
  }

  async function getAsyncOptions(arg) {
    if (!arg.pageNo) {
      arg.pageNo = 1;
    }
    const { optionsData, complete } = await cacheAdapter({ ...arg, fieldKey }, getRdoAsyncOptions);
    if (treeData?.value?.length) {
      if (arg.pageNo > 1) {
        treeData.value?.pop();
      } else {
        treeData.value = [];
      }
    }
    optionsData.forEach((i) => {
      if (treeData.value?.some((j) => j.value === i.value)) return;
      treeData.value?.push(i);
    });
    if (!complete) {
      treeData.value?.push({
        value: 1,
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
    getSelectOption: getChildrens,
    getChildrens: async (id_) => {
      try {
        if (!id_) return;
        const [_fId, _cId] = id_?.split(':');
        const existingData = treeData.value?.find((i) => i.value === _fId);
        if (existingData) return;
        const row = await cacheAdapter({ id_, fieldKey }, getChildrens);
        /**第二次验证是否存在  有可能再调接口期间  treeData 更新了*/
        const checked = treeData.value?.find((i) => i.value === _fId);
        if (checked) return;
        row && treeData.value?.unshift(row);
      } catch (error) {}
    },
    getAsyncOptions,
    getRdoAsyncOptions,
    treeData,
  };
}
