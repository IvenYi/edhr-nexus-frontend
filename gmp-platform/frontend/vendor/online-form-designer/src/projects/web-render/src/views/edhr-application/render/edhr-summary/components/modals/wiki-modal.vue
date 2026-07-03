<template>
  <div class="px24px py20px">
    <div class="p12px bg-[#F9FAFB] rounded-4px text-[#1A1D23] text-12px ks-row mb24px">
      <i class="iconfont icon-jinggao1 text-[#FF9442] mr8px"></i>
      <div class="text-[#1A1D23]">
        {{ $t('sys.edhr.addFormToWikiTips', { sth: name || '' }) }}
      </div>
    </div>
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
      autocomplete="off"
    >
      <a-form-item label="添加方式" name="username">
        <a-radio-group v-model:value="formState.value" @click="onRadioChange">
          <a-radio :value="1">{{ $t('sys.edhr.insetCustomName') }}</a-radio>
          <a-radio :value="0"
            >{{
              $t('sys.edhr.instWithSth', { sth: optionLabel || $t('sys.onlineForm.remarkName') })
            }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        :label="$t('sys.edhr.docName')"
        name="wikiName"
        :rules="[{ required: formState.value === 1 }]"
      >
        <a-input v-if="formState.value === 1" v-model:value="formState.wikiName" />
        <div v-else>{{ name }}</div>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { IModal, useModal } from '@gct/runtime';
  import { reactive, ref } from 'vue';

  const props = defineProps<{
    modal: IModal;
    name: string;
    optionLabel?: string;
  }>();

  const formRef = ref();
  const formState = reactive<any>({
    value: 1,
    wikiName: '',
  });

  const onRadioChange = () => {
    formRef.value?.clearValidate(['wikiName']);
  };

  const onSave = async () => {
    await formRef.value?.validate();
    return {
      ok: true,
      params: {
        name: formState.value === 1 ? formState.wikiName : props.name,
      },
    };
  };

  useModal(onSave);
</script>
<style lang="less" scoped></style>
