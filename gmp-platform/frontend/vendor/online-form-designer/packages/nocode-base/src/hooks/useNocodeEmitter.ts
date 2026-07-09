import { mitt } from '/@/utils/mitt';

const emitter = mitt();

export enum EmitterEnum {
  /** 打开单个批注详情 */
  __on__open_single_annotation_detail_ = '__on__open_single_annotation_detail_',
  /** 更新页面 */
  __on__update_page_dom_ = '__on__update_page_dom_',
  /** 电子批记录选择单据实例id */
  __on_select_ebr_doc_instance_id = '__on_select_ebr_doc_instance_id',
  /** 循环自动保存 */
  __on_looper_auto_save = '__on_looper_auto_save',
  /** 电子批记录比对formstate */
  __on_diff_ebr_form_state = '__on_diff_ebr_form_state',
}

export function useNocodeEmitter() {
  return {
    emitter,
    EmitterEnum,
  };
}
