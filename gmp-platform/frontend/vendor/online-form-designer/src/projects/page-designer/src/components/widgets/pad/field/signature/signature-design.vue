<template>
  <div
    :style="{
      height: widget.style.height ? `${widget.style.height}px` : 'auto',
      overflowY: 'auto',
    }"
  >
    <div v-if="!rowReadonly && !readonly" class="add-btn" :class="[disabled && 'disabled']">
      <i class="gct-iconfont icon-btn_add"></i>
      {{ $t('sys.pageDesigner.addSignature') }}
    </div>

    <div
      v-else
      class="mt12px"
      :class="{ horizontal: displayStyle === SignatureStyleEnum.HORIZONTAL }"
    >
      <div class="signature-add-wrap">
        <i class="gct-iconfont icon-ziduan-qianming2" style="color: #b3b8be; font-size: 24px"></i>
      </div>
      <div
        v-if="signatureType !== SignatureTypeEnum.SIGNATURE_ONLY"
        class="mt4px ml8px text-[13px]"
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
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 200px;
    height: 120px;
    border: 1px dashed #e0e3eb;
    border-radius: 4px;
    background-color: #eff2f5;
    color: #797a7d;

    &.disabled {
      color: #c3c3c3;
      cursor: not-allowed;
    }
  }

  .add-btn {
    position: absolute;
    z-index: 1;
    top: -20px;
    right: 0;
    color: var(--van-primary-color);
  }

  .horizontal {
    display: flex;
    align-items: center;
  }
</style>
