<template>
  <div class="ml--16px mr--16px">
    <!-- {{ styleValue }} -->
    <draggable :list="styleValue" handle=".mover" :animation="200">
      <template #item="{ element, index }">
        <div class="bg-[#f5f5f5] p16px" :class="{ mt10px: !!index }">
          <div class="ks-row-middle mb10px">
            <span class="iconfont icon-drag text-[#999] mover cursor-move primary-gct-hover"></span>
            <span
              class="text-[500] ml5px cursor-pointer primary-gct mr10px"
              @click="handleOpenExpr(element)"
              >{{ $t('sys.pageDesigner.configurationRules') }}</span
            >
            <a-tag v-show="element.displayRule">
              <span class="text-[#999]">{{ $t('sys.pageDesigner.configured') }}</span>
            </a-tag>
            <span
              class="iconfont icon-shanchu error-gct cursor-pointer ml-auto"
              @click="styleValue.splice(index, 1)"
              v-if="styleValue.length > 1"
            ></span>
          </div>
          <div class="flex">
            <span v-if="isForm" class="mr-10px" style="line-height: 32px">{{
              $t('sys.content')
            }}</span>
            <fonteditor style="flex: 1" :fontStyle="element.contentFont" :key="element.id" />
          </div>
          <div class="ks-row-center-between mt10px mb10px">
            {{ $t('sys.pageDesigner.tagStyle') }}
            <a-checkbox v-model:checked="element.tagStyleOpen">
              {{
                isNumber
                  ? $t('sys.pageDesigner.configureContentStyle')
                  : $t('sys.pageDesigner.configureContentAsLabelStyle')
              }}
            </a-checkbox>
          </div>
          <div v-if="element.tagStyleOpen" :key="element.id">
            <a-select v-model:value="element.tagType" v-if="isNumber">
              <a-select-option :value="tagEnum.TAG">{{
                $t('sys.pageDesigner.tagStyle')
              }}</a-select-option>
              <a-select-option :value="tagEnum.PROGRESS">{{
                $t('sys.pageDesigner.progressBarStyle')
              }}</a-select-option>
            </a-select>
            <tageditor
              :key="element.tagType"
              :tagType="element.tagType"
              :tagStyle="element.tagType === tagEnum.TAG ? element.tagStyle : element.progressStyle"
              class="mt10px"
            />
          </div>
        </div>
      </template>
    </draggable>
    <div class="mt12px ml16px mr16px">
      <a-button type="dashed" style="line-height: 1" block ghost @click="addlist">
        <span class="iconfont icon-tianjia"></span>
        <span> {{ $t('sys.pageDesigner.addNextLine') }}</span>
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="column-tag-editor">
  import { useStyleEditor, props } from '/@page-designer/hooks/useStyleEditor';
  import tageditor from '../common/table-tageditor.vue';
  import fonteditor from '../common/table-fonteditor.vue';
  import draggable from 'vuedraggable';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FormComponents, tagEnum } from '/@page-designer/enum';
  import { ReturnTypeEnum, EntityFormulaReturnTypeEnum } from '/@/components/Expression/types';
  import { computed } from 'vue';
  import { MaterialEnum } from '/@/enums/appEnum';
  import { deptFilter } from '@gct/runtime';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  const { openModal } = useExpression();
  const defProps = defineProps(props);
  const { styleValue } = useStyleEditor(defProps.editor);
  const { allFormWidget } = useDesigner();
  function addlist() {
    styleValue.value?.push(defProps.editor._config!.generator!());
  }

  const isForm = computed(() => {
    return [MaterialEnum.MaterialFormField, MaterialEnum.cardListFormField].includes(
      defProps.widget?.materialType!,
    );
  });
  const isNumber = computed(() => {
    return (
      defProps.widget?.props.fieldType === ReturnTypeEnum.Number ||
      [
        EntityFormulaReturnTypeEnum.Double,
        EntityFormulaReturnTypeEnum.Int,
        EntityFormulaReturnTypeEnum.Long,
      ].includes(defProps.widget?.props.returnType)
    );
  });
  const handleOpenExpr = async (value) => {
    openModal({
      expr: value.displayRule,
      mode: ExpressionModeEnum.DISPLAY_RULE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: await _getIdentifiers(),
      },
      callback: (expr) => {
        value.displayRule = expr;
      },
    });
  };
  const deptOriginData = computed(() => {
    if (isForm.value) {
      return allFormWidget.value;
    } else {
      return [
        {
          id: defProps.widget!.preLocation,
          props: {
            name: $t('sys.pageDesigner.currTableRow'),
            // 子表中的公式字段，取bindModelKey
            model: defProps.widget!.props.bindModelKey || defProps.widget!.props.model,
          },
        },
      ];
    }
  });

  /**根据页面的form组装identifiers */
  const _getIdentifiers = async () => {
    const P = deptOriginData.value
      .filter((i) => i.props.model)
      .map(async (form) => {
        const fieldList = await getFieldMetaList({ modelKey: form.props.model! });
        const children =
          fieldList
            ?.filter(deptFilter)
            ?.map((i) => ({ id: i.key!, name: i.name!, valueType: i.type! })) || [];
        return {
          id: form.id,
          name: form.props.name || form.id,
          children,
        };
      });
    return await Promise.all(P);
  };
</script>

<style lang="less" scoped>
  :deep(.ant-btn.ant-btn-background-ghost) {
    border-color: var(--ant-primary-color);
    color: var(--ant-primary-color);
  }
</style>
