<template>
  <div class="ml--16px mr--16px">
    <draggable :list="styleValue" handle=".mover" :animation="200">
      <template #item="{ element, index }">
        <div class="bg-[#f5f5f5] p16px" :class="{ mt10px: !!index }">
          <div class="ks-row-middle mb10px">
            <span class="iconfont icon-drag cursor-move mover text-[#999] primary-gct-hover"></span>
            <span
              class="text-[500] ml5pxcursor-pointer primary-gct mr10px ml5px cursor-pointer"
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
          <div class="ks-row-middle">
            <span class="mr-auto"> {{ $t('sys.pageDesigner.cellBackgroundColor') }} </span>
            <g-color-picker
              :key="element.id"
              :preset="presetColor"
              :color="element.backgroundColor"
              @update:color="(_e, color) => (element.backgroundColor = color)"
            >
              <template #icon>
                <div
                  :style="{
                    width: '24px',
                    height: '24px',
                    backgroundColor: element.backgroundColor,
                  }"
                ></div>
              </template>
            </g-color-picker>
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

<script setup lang="ts" name="column-backgound-editor">
  import { useStyleEditor, props, presetColor } from '/@page-designer/hooks/useStyleEditor';
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import draggable from 'vuedraggable';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { deptFilter } from '@gct/runtime';
  const { openModal } = useExpression();
  const defProps = defineProps(props);
  const { styleValue } = useStyleEditor(defProps.editor);

  function addlist() {
    styleValue.value?.push(defProps.editor._config!.generator!());
  }
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
  }; /**根据页面的form组装identifiers */
  const _getIdentifiers = async () => {
    const P = [
      {
        id: defProps.widget!.preLocation,
        props: {
          name: $t('sys.pageDesigner.currTableRow'),
          model: defProps.widget!.props.bindModelKey || defProps.widget!.props.model,
        },
      },
    ]
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
