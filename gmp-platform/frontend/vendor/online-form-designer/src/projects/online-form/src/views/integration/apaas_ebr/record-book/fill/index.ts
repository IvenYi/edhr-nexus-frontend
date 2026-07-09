import RecordBookFillModal from './record-book-fill-modal.vue';
import { useFillBeforeChecker } from './hooks/useFillBeforeChecker';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

export function useRecordBookFill() {
  /**
   * 记录本填报
   * @param options.recordBookId  记录本id
   * @param options.isViewPage    是否是详情页面
   * @param options.pageType      页面类型
   * @param options.isFillRangeOn 是否启用表单填报时间段限制
   * @param options.entryTime     进入时间
   * @param options.params        参数
   * @param options.startTime     开始时间
   * @param options.endTime       截止时间
   * @param options.callback      弹框关闭回调
   */
  function openRecordBookFillFullModal(options) {
    console.log('记录本填报', options);
    try {
      const { checkClickFill, checkEnterFillPage } = useFillBeforeChecker({
        displayFormat: 'YYYY-MM-DD HH:mm',
      });

      const now = dayjs();

      const startRes = checkClickFill(options.startTime, now);
      if (!startRes.allowed) {
        message.warning(startRes.message);
        return;
      }

      const endRes = checkEnterFillPage(options.endTime, now);

      gct.openUtil.fullScreen(RecordBookFillModal, {
        recordBookId: options.id,
        isViewPage: options.isViewPage,
        pageType: options.pageType,
        isFillRangeOn: options.isFillRangeOn,
        entryTime: now,
        paramExtraProps: options?.params,
        isFillDeadlineOn: endRes.limited,
        fillDeadlineOnMsg: endRes.message,
        callback: options.callback,
      });
      return true;
    } catch (err) {
      console.error('打开填报器失败：', err);
      message.error($t('sys.onlineForm.failedToOpenFillerPleaseRetry'));
      return false;
    }
  }

  return {
    openRecordBookFillFullModal,
  };
}
