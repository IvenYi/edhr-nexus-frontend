import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
import { EntityModelCategoryEnum } from '@gct/runtime';
import { OnlineForm } from '/@page-designer/types/web';
import { postStash } from '/@/apis/gct-apaas/StashController';

export const useOnlineEvent = (widget: OnlineForm) => {
  // const modelCategory = widget.props.modeldata?.modelCategory || EntityModelCategoryEnum.ENTITY;
  const Event = getPageEvent();
  /**提交 */
  async function gctSubmit(modelKey, data) {
    const submitRes = await Event.context.$httpBizService(
      {
        key: modelKey,
        action: 'submit',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      { ...data, _DICT: undefined, _OPCT: undefined, _NOSUBMIT: undefined },
    );
    return submitRes;
  }
  /** 暂存*/
  async function gctTemporaryStorage(data) {
    const stashId = await postStash({
      content: JSON.stringify(data),
    });
    return stashId;
  }
  return { gctSubmit, gctTemporaryStorage };
};
