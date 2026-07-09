import { EntityModelCategoryEnum } from '@gct/runtime';
import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { postEdhrInstancePageListGroup } from '/@/apis/gct-apaas/EdhrInstanceController';
import { transformUtils } from '@gct/nocode-base';

export function useAsyncOptions({ ignoreArchived, customFetch }) {
  const randomKey = () => {
    return 't_' + Math.random().toString(36).substring(2, 9);
  };

  const buildQuery = (keyword) => {
    const query = {};
    const keys: any = [];

    const vals = Array.isArray(keyword) ? keyword : keyword ? [keyword] : [];

    const clean: any = [];

    for (const v of vals) {
      if (v === null || v === undefined) continue;
      const normalized = typeof v === 'string' ? v.trim() : v;
      if (normalized === '') continue;
      clean.push(normalized);
    }

    let instanceKey;
    if (ignoreArchived) {
      instanceKey = `instance_status_.ne:${randomKey()}`;
      query[instanceKey] = 'ARCHIVED';
    }

    for (const v of clean) {
      const k = `material_no_.like:${randomKey()}`;
      query[k] = v;
      keys.push(k);
    }

    let exp = '';
    if (ignoreArchived) {
      if (keys.length > 0) {
        exp = `AND(${instanceKey},OR(${keys.join(',')}))`;
      } else {
        exp = `AND(${instanceKey})`;
      }
    } else {
      if (keys.length > 0) exp = `OR(${keys.join(',')})`;
      else exp = '';
    }

    return { query, exp };
  };

  // 将新更换的接口返回的字段key转为原接口返回的字段key
  const transformKeys = (obj) => {
    const map = {}
    for (let k in obj) {
      const fk = k.replace(/([A-Z])/g, '_$1').toLowerCase() + '_';
      map[fk] = obj[k]
    }
    return map
  }

  async function getLotAsyncOptions(arg: IParams = {}) {
    if (customFetch) {
      return await customFetch(arg);
    }
    // const params = buildQuery(arg.keyword);
    const nos = Array.isArray(arg.keyword) ? arg.keyword : arg.keyword ? [arg.keyword] : [];
    const body = {
      pageSize: arg.pageSize,
      pageNo: arg.pageNo,
      materialNos: nos.reduce((list, e) => {
        if (e && e.trim()) list.push(e.trim());
        return list
      }, []),
      // ...params,
    }
    const res: any = await postEdhrInstancePageListGroup(body)
    //  await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
    //   {
    //     modelCategory: EntityModelCategoryEnum.ENTITY,
    //     modelKey: 'edhr-instance',
    //     bsKey: 'page/list/group',
    //   },
    //   {
    //     pageSize: arg.pageSize,
    //     pageNo: arg.pageNo,
    //     ...params,
    //   },
    // );

    const { data = [], totalPage, dict, totalCount } = res || {};
    const options = (data || []).map(e => {
      return {
        ...transformKeys(e),
        data: {
          ...e
        },
      }
    })
    return {
      // options: transformUtils.transformSourceData2SubTable(data || [], dict),
      options,
      finished: totalPage && totalPage === 1,
      totalCount,
    };
  }

  // 获取缺失的选项（用于回显）
  const fetchMissingOption = async (value: string | string[]) => {
    const res = await getLotAsyncOptions({
      keyword: value,
      pageNo: 1,
      pageSize: 1,
    });

    return res?.options?.map((item) => {
      return {
        label: item.material_no_,
        value: item.material_no_,
      };
    });
  };

  return {
    getLotAsyncOptions,
    fetchMissingOption,
  };
}
