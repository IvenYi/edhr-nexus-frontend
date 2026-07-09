<template>
  <div
    :style="{
      height: widget.style.height ? `${widget.style.height}px` : 'auto',
      overflowY: 'auto',
    }"
  >
    <div
      v-if="!rowReadonly && !readonly"
      class="signature-add-wrap color-theme"
      :class="[disabled && 'disabled']"
    >
      <i class="iconfont icon-dianziqianmingdd" style="font-size: 20px; height: 22px"></i>
      <div class="mt2px color-theme">{{ $t('sys.pageDesigner.addSignature') }}</div>
    </div>
    <div v-else :class="{ horizontal: displayStyle === SignatureStyleEnum.HORIZONTAL }">
      <div class="signature-add-wrap">
        <i class="iconfont icon-tupian-shili" style="font-size: 40px; color: #c3c3c3"></i>
      </div>
      <div
        v-if="signatureType !== SignatureTypeEnum.SIGNATURE_ONLY"
        class="text-center mt4px ml8px text-[12px]"
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
<script name="gct-signature" setup lang="ts">
  import { toRefs, ref } from 'vue';
  import { Signature } from '/@page-designer/types/mobile';
  import { SignatureTypeEnum, SignatureStyleEnum } from '/@/projects/page-designer/src/enum';
  import dayjs from 'dayjs';

  const props = defineProps<{ widget: Signature; rowReadonly?: boolean }>();
  const { readonly, signatureType, displayStyle } = toRefs(props.widget.props);
  const disabled = ref(props.widget.props.disabled);
  const time = ref('2019-11-07 00:00:00');
</script>

<style lang="less" scoped>
  .signature-add-wrap {
    color: #797a7d;
    width: 100px;
    height: 56px;
    background-color: #f7f8fa;
    border: 1px dashed @gct-input-border-color;
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
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
  }
</style>
