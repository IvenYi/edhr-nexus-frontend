<template>
  <div class="px83px py24px">
    <a-form>
      <a-form-item :label="$t('sys.pageDesigner.signatureType')">
        <a-select
          v-model:value="formData.signatureType"
          :options="signatureTypeOptions"
          type="text"
        />
      </a-form-item>
      <a-form-item
        v-if="formData.signatureType !== SignatureTypeEnum.SIGNATURE_ONLY"
        :label="$t('sys.pageDesigner.displayStyle')"
      >
        <div class="flex">
          <div
            class="card flex-col"
            :class="formData.displayStyle === SignatureStyleEnum.VERTICAL ? 'selected' : ''"
            @click="changeDisplay(SignatureStyleEnum.VERTICAL)"
          >
            <div class="gradient-line"></div>
            <div
              class="text-[#8B8B8B] mt4px"
              :class="
                formData.signatureType === SignatureTypeEnum.SIGNATURE_DATE
                  ? 'text-[12px]'
                  : 'text-[7px]'
              "
            >
              {{
                formData.signatureType === SignatureTypeEnum.SIGNATURE_DATE
                  ? 'yyyy-mm-dd'
                  : 'yyyy-mm-dd 00:00'
              }}
            </div>
          </div>
          <div
            class="card ml12px"
            :class="formData.displayStyle === SignatureStyleEnum.HORIZONTAL ? 'selected' : ''"
            @click="changeDisplay(SignatureStyleEnum.HORIZONTAL)"
          >
            <div class="gradient1-line"></div>
            <div
              class="text-[#8B8B8B] ml4px"
              :class="
                formData.signatureType === SignatureTypeEnum.SIGNATURE_DATE
                  ? 'text-[12px]'
                  : 'text-[7px]'
              "
            >
              {{
                formData.signatureType === SignatureTypeEnum.SIGNATURE_DATE
                  ? 'yyyy-mm-dd'
                  : 'yyyy-mm-dd 00:00'
              }}
            </div>
          </div>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { EditorType, IModal, useModal } from '@gct/runtime';
  import { SignatureTypeEnum, SignatureStyleEnum } from '/@/projects/page-designer/src/enum';

  const props = defineProps<{
    data: Object;
    modal: IModal;
  }>();

  const formData = ref({
    signatureType: props.data.signatureType,
    displayStyle: props.data.displayStyle,
  });

  const signatureTypeOptions = Object.keys(SignatureTypeEnum).map((key) => {
    return {
      label: $t('sys.pageDesigner.' + SignatureTypeEnum[key]),
      value: SignatureTypeEnum[key],
    };
  });

  useModal(async () => {
    const d = {
      signatureType: formData.value.signatureType,
      displayStyle: formData.value.displayStyle,
    };
    return { ok: true, data: [d] };
  });

  const changeDisplay = (type) => {
    formData.value.displayStyle = type;
  };
</script>
<style lang="less" scoped>
  .card {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 106px;
    height: 56px;
    border: 1px solid #e0e3eb;
    border-radius: 4px;
    cursor: pointer;
  }

  .gradient-line {
    width: calc(35px + 34px); /* 20个1px线条 + 19个1px间隙 */
    height: 12px;
    background-image: repeating-linear-gradient(
      to right,
      #cacfd8,
      #cacfd8 1px,
      transparent 1px,
      transparent 2px
    );
    background-size: 2px 12px; /* 每个重复单元宽2px（1px线条+1px透明） */
  }

  .gradient1-line {
    width: calc(10px + 9px); /* 20个1px线条 + 19个1px间隙 */
    height: 12px;
    background-image: repeating-linear-gradient(
      to right,
      #cacfd8,
      #cacfd8 1px,
      transparent 1px,
      transparent 2px
    );
    background-size: 2px 12px; /* 每个重复单元宽2px（1px线条+1px透明） */
  }

  .selected {
    border: 1px solid var(--ant-primary-color);

    .gradient-line {
      width: calc(35px + 34px); /* 20个1px线条 + 19个1px间隙 */
      height: 12px;
      background-image: repeating-linear-gradient(
        to right,
        var(--ant-primary-color),
        var(--ant-primary-color) 1px,
        transparent 1px,
        transparent 2px
      );
      background-size: 2px 12px; /* 每个重复单元宽2px（1px线条+1px透明） */
    }

    .gradient1-line {
      width: calc(10px + 9px); /* 20个1px线条 + 19个1px间隙 */
      height: 12px;
      background-image: repeating-linear-gradient(
        to right,
        var(--ant-primary-color),
        var(--ant-primary-color) 1px,
        transparent 1px,
        transparent 2px
      );
      background-size: 2px 12px; /* 每个重复单元宽2px（1px线条+1px透明） */
    }
  }
</style>
