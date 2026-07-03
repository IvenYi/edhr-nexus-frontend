import { AuthKeyTypeEnum, ParameterPosition } from '/@ipaas/enums';
import { IApiJsonParam, ITreeJsonParam } from './types';

/**
 * 删掉其他的字段
 * 转换成后台要的参数格式
 * @export
 * @template T
 * @param param
 * @return {*}
 */
export function toApiJsonParam(param: ITreeJsonParam, callback?: Function): IApiJsonParam {
  const apiParam: IApiJsonParam = {
    type: param.type,
    description: param.description,
    required: param.required,
    ...callback?.(param),
  } as any;
  // 数组类型的递归处理
  if (apiParam.type === AuthKeyTypeEnum.Array && param.children?.[0]) {
    apiParam.items = toApiJsonParam(param.children[0], callback);
  } else if (apiParam.type === AuthKeyTypeEnum.Object) {
    apiParam.properties = {};
    param.children?.forEach((item) => {
      //排除key为空的字段
      if (item.key) {
        apiParam.properties[item.key!] = toApiJsonParam(item, callback);
      }
    });
  }
  return apiParam;
}

/**
 * 转换成界面用的树形结构
 *
 * @export
 * @param param
 * @return {*}
 */
export function toTreeJsonParam(param: IApiJsonParam, callback?: Function): ITreeJsonParam {
  const treeParam: ITreeJsonParam = {
    type: param.type,
    description: param.description,
    required: param.required,
    ...callback?.(param),
  };
  // 数组类型的递归处理
  if (param.type === AuthKeyTypeEnum.Array) {
    treeParam.children = param.items ? [toTreeJsonParam(param.items, callback)] : [];
  } else if (param.type === AuthKeyTypeEnum.Object) {
    treeParam.children = Object.keys(param.properties).map((k) => {
      return {
        key: k,
        ...toTreeJsonParam(param.properties[k], callback),
      };
    });
  }
  return treeParam;
}
