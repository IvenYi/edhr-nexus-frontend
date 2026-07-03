import { ref, h } from 'vue';
import type { TreeSelectProps } from 'ant-design-vue';
import {
  getOnlineFormTmplListVersionById,
  getOnlineFormTmplGetVersionById,
} from '/@/apis/gct-apaas/OnlineFormTmplController';

import { cacheAdapter } from '/@page-designer/components/widgets/hooks/cacheAdapter';
import selectMore from './select-more.vue';
import { getInterfaceApi } from '@gct/runtime';

export function useAsyncOptions() {
  const treeData = ref<TreeSelectProps['treeData']>([]);

  async function getRdoAsyncOptions(arg: IParams = {}) {
    let complete = true;
    let optionsData: any[] = [];

    const res = await getInterfaceApi.getTmplsList({
      ...arg,
      pageSize: 30,
      pageNo: arg.pageNo,
      name: arg.keyword,
      moduleType: 'online_form_module',
    });

    // 数据转化为 rdo 结构
    res.data.forEach((item) => {
      item.id_ = item.id;
      item.name_ = item.name;
      item.__CHILDREN__ = item.children.map((v) => {
        v.base_id_ = v.baseId;
        v.default_ = v.default === 1;
        v.id_ = v.id;
        v.name_ = v.name;
        v.version_ = v.version;
        v.formType = item.formType;
        return v;
      });
    });

    /**自定义数据源可能不存在 totalPage 默认 全部加载完成*/
    complete = res.totalPage ? res.totalPage <= res.pageNo : true;

    optionsData = (res?.data || []).map((i) => {
      return {
        label: i.name_,
        value: i.id_,
        title: i.name_,
        _info: i.__CHILDREN__?.find((k) => k.default_),
        full_path: () =>
          h('div', [
            h('span', `${i.name_}`),
            h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default')),
          ]),
        children: i.__CHILDREN__?.map((j) => {
          return {
            label: j.name_,
            versionName: j.version_,
            value: `${i.id_}:${j.id_}`,
            title: () =>
              h('div', [
                h('span', { class: 'version' }, j.version_),
                j.default_ ? h('span', { class: 'version gct-custom-tag ml8px' }, $t('sys.default')) : null,
              ]),
            name: i.name_,
            default_: j.default_,
            _info: { ...j },
            full_path: () => h('div', [h('span', `${j.name_}:${j.version_}`)]),
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
    const { data } =
      (await getOnlineFormTmplGetVersionById({
        id: id_,
      })) || {};
    // 数据转化为 rdo 结构
    data.base_id_ = data.baseId;
    data.default_ = data.default === 1;
    data.id_ = data.id;
    data.name_ = data.name;
    data.version_ = data.version;
    let children = _cId ? [{ label: data.name_, versionName: data.version_, value: id_ }] : [];
    try {
      const chl = (await getOnlineFormTmplListVersionById({ id: _fId })) || {};

      // 数据转化为 rdo 结构
      chl.data.forEach((v) => {
        v.base_id_ = v.baseId;
        v.default_ = v.default === 1;
        v.id_ = v.id;
        v.name_ = v.name;
        v.version_ = v.version;
      });

      children = chl.data?.map((i) => {
        return {
          label: i.name_,
          versionName: i.version_,
          value: `${_fId}:${i.id_}`,
          title: () =>
            h('div', [
              h('span', { class: 'version' }, i.version_),
              i.default_ ? h('span', { class: 'version gct-custom-tag ml8px' }, $t('sys.default')) : null,
            ]),
          name: i.name_,
          default_: i.default_,
          _info: { ...i },
          full_path: () => h('div', [h('span', `${i.name_}:${i.version_}`)]),
        };
      });
    } catch (error) {}
    return {
      label: data.name_,
      value: _fId,
      selectable: false,
      full_path: () =>
        h('div', [
          h('span', `${data.name_}`),
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
