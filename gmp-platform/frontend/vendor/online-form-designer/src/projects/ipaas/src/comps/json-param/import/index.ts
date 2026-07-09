import { IModalData } from "@gct/runtime";
import ImportJsonModal from "./import-json-modal.vue";
import { ITreeJsonParam } from "../types";
import { AuthKeyTypeEnum } from '/@ipaas/enums';
import { isArray, isBoolean, isNumber, isObject, isString } from "lodash-es";

/**
 * 打开导入JSON模态框
 *
 * @export
 * @return {*} 
 */
export async function importJson(jsonStr?:string): Promise<{ ok: boolean, data?: IParams }> {
  const res = await gct.openUtil.modal<IModalData>(
    ImportJsonModal,
    {
      json: jsonStr
    },
    {
      title: $t('sys.import') + 'JSON',
      width: '500px',
      height: 'auto',
      okText: $t('sys.okText'),
      showFooter: true,
    },
  );
  if (res.ok) {
    return {
      ok: true,
      data: res.data?.[0] as IParams
    }
  } else {
    return {
      ok: false,
    }
  }
}

/**
 * 导入参数描述
 * @export
 */
export async function importParamDesc() {

  // 设置默认的提示文本
  const placeholderText = JSON.stringify(
    {
      name: '示例名称',
      array: ['示例数组'],
      object: {
        desc: '示例对象',
      },
    },
    null,
    2,
  );

  const res = await importJson(placeholderText);
  let data: ITreeJsonParam | undefined = undefined

  // 递归遍历json对象，转换成ITreeJsonParam的树形结构
  function recursive(data: any) {
    if (isArray(data)) {
      const result = {
        type: AuthKeyTypeEnum.Array,
        children: [] as any[],
      }
      if(data[0]){
        const child = recursive(data[0]);
        if(child){
          result.children = [child];
        }
      }
      return result;
    } else if (isObject(data)) {
      return {
        type: AuthKeyTypeEnum.Object,
        children: Object.keys(data).map(key => {
          const child = recursive(data[key]);
          if(child){
            return Object.assign({
              key,
            }, child)
          }
        }).filter(Boolean)
      }
    } else if (isNumber(data)) {
      return {
        type: AuthKeyTypeEnum.Integer,
      }
    } else if (isBoolean(data)) {
      return {
        type: AuthKeyTypeEnum.Boolean,
      }
    } else if (isString(data)) {
      return {
        type: AuthKeyTypeEnum.String,
      }
    } else {
      return undefined;
    }
  }


  if (res.ok) {
    data = recursive(res.data!)
  }
  return {
    ok: res.ok,
    data: data
  }
}