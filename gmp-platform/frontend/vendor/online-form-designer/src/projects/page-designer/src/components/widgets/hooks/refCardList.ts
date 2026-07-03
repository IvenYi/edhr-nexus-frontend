/**关联字段信息卡逻辑 */
import { ref, reactive, provide, inject, toRef, h, toRefs, nextTick } from 'vue';
import { Select } from '/@page-designer/types/web';
import { FIELD_TYPE } from '@/enums/appEnum';
import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import { gctMemoizeAsync } from '@gct/base';
import { transformDataToDict } from '/@page-designer/components/widgets/hooks/utils';

export function useRefCardData(props: { widget: Select; modelValue?: string }) {
  const { fieldType, refCard, refCardId, readonly } = props.widget.props;
  if (
    (fieldType === FIELD_TYPE.REF ||
      fieldType === FIELD_TYPE.REF_MULTI ||
      fieldType === FIELD_TYPE.RDO_REF) &&
    refCard &&
    refCardId &&
    readonly
  ) {
    const refCardValues = toRef(() => {
      const values = props.modelValue ?? [];
      if (values instanceof Array) {
        return values;
      } else {
        return values.split(',');
      }
    });

    provide('refCardValues', { refCardValues, widget: props.widget });
  }
}

export function useGetRefCard() {
  const refCardInfo = inject<any>('refCardValues');
  if (!refCardInfo) return {};
  const { fieldType, bindModelKey, refCardId, cardTrigger } = refCardInfo?.widget?.props || {};
  return {
    refCardValues: refCardInfo?.refCardValues,
    trigger: cardTrigger,
    getCardData: gctMemoizeAsync(getDataByModelType, { fieldType, modelKey: bindModelKey }),
    modelKey: bindModelKey,
    refCardId,
  };
}

export async function getDataByModelType({ fieldType, modelKey }, id) {
  if (fieldType === FIELD_TYPE.RDO_REF) {
    const { data = {}, dict = {} } =
      await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelKey,
          bsKey: 'rdoGetVersionByRefId',
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        {
          foreignFields: [],
        },
        {
          includeDeleted: 1,
          refId: id,
        },
      );
    return transformDataToDict(data, dict);
  } else {
    const { data = {}, dict = {} } =
      await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelKey,
          bsKey: 'getOne',
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        {
          query: { 'id_.eq': id },
          foreignFields: [],
        },
        {
          includeDeleted: 1,
        },
      );
    return transformDataToDict(data, dict);
  }
}
