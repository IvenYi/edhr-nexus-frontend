<template>
  <div
    :style="{
      height: widget.style.height ? `${widget.style.height}px` : 'auto',
      overflowY: 'auto',
    }"
  >
    <div v-if="!readonly" class="signature-add-wrap" :class="[disabled && 'disabled']">
      <i
        class="iconfont icon-dianziqianmingdd color-theme"
        style="height: 22px; font-size: 20px"
      ></i>
      <div class="mt8px color-theme">{{ $t('sys.pageDesigner.addSignature') }}</div>
    </div>
    <div
      v-else
      class="w120px"
      :class="{ horizontal: displayStyle === SignatureStyleEnum.HORIZONTAL }"
    >
      <div class="signature-add-wrap mr8px">
        <i class="iconfont icon-tupian-shili" style="color: #c3c3c3; font-size: 40px"></i>
      </div>
      <div
        v-if="signatureType !== SignatureTypeEnum.SIGNATURE_ONLY"
        class="text-center mt4px text-[12px]"
      >
        {{
          signatureType === SignatureTypeEnum.SIGNATURE_DATE
            ? dayjs(time).format('YYYY-MM-DD')
            : dayjs(time).format('YYYY-MM-DD HH:mm')
        }}
      </div>
    </div>
  </div>
</template>
<script name="gct-printer" setup lang="ts">
  import { toRefs, ref, toRef } from 'vue';
  import { Signature } from '/@page-designer/types/web';
  import { SignatureTypeEnum, SignatureStyleEnum } from '/@/projects/page-designer/src/enum';
  import dayjs from 'dayjs';

  const props = defineProps<{ widget: Signature; rowReadonly?: boolean }>();
  const { signatureType, displayStyle } = toRefs(props.widget.props);
  const disabled = ref(props.widget.props.disabled);
  const readonly = toRef(() => props.widget.props.readonly || props.rowReadonly);
  const time = ref('2019-11-07 00:00:00');
</script>

<style lang="less" scoped>
  .signature-add-wrap {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 68px;
    border: 1px dashed @gct-input-border-color;
    border-radius: 2px;
    background-color: #f7f8fa;
    color: #797a7d;

    &.disabled {
      color: #c3c3c3;
      cursor: not-allowed;
    }
  }

  .color-theme {
    color: var(--ant-primary-color);
  }

  .horizontal {
    display: flex;
    align-items: center;
    width: 300px;
  }
</style>
