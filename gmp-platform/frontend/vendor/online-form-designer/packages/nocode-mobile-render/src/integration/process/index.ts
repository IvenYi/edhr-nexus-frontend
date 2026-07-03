import { GctPopup } from '@mobile/utils/popup';
import SelectProcessPopup from './select-process-popup.vue';

export interface ProcessProps {
  title?: string;
  categoryId?: '__summary_process__' | '__change_process__'; // 默认： __summary_process__ 汇总的流程
  onClosed?: Function;
}

/**
 * 打开流程选择弹窗
 * @param [props={}]
 * @return {*}
 */
export async function openSelectProcessPopup(props: ProcessProps = {}): Promise<any> {
  return new Promise((resolve) => {
    GctPopup.open(SelectProcessPopup, {
      categoryId: props?.categoryId,
      title: props?.title || '汇总流程选择',
      beforeClose: (data) => {
        console.log('popup close', data);
        resolve(data);
      },
    });
  });
}
