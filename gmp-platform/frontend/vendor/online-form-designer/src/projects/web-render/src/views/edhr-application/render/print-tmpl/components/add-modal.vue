<template>
  <div>
    <a-form
      class="important-pt-24px"
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 14 }"
    >
      <a-form-item :label="$t('sys.pageDesigner.name')" name="name" :rules="[{ required: true }]">
        <a-input
          v-model:value="formState.name"
          show-count
          :maxlength="32"
          :placeholder="$t('sys.inputText')"
        />
      </a-form-item>
      <a-form-item :label="'尺寸类型'" name="paperSize" :rules="[{ required: true }]">
        <a-select v-model:value="formState.paperSize" :disabled="isEdit" @change="pageSizeChange">
          <a-select-option
            v-for="opt in Object.keys(pagerSizeMap).map((key) => {
              return { value: key, label: pagerSizeMap[key] };
            })"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item class="mb0!">
        <template #label>
          <span class="text-[#ff4d4f] mr4px font-[SimSun,sans-serif]">*</span>高
        </template>
        <a-row>
          <a-col :span="10">
            <a-form-item
              name="height"
              :rules="[{ required: true, message: $t('sys.inputTextTip', { name: '高' }) }]"
            >
              <a-input-number
                v-model:value="formState.height"
                :precision="0"
                :placeholder="$t('sys.appDesigner.inputPlaceholder')"
                :disabled="isEdit || formState.paperSize !== 'CUSTOM'"
                :min="0"
              >
                <template #addonAfter> mm </template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :offset="2" :span="12">
            <a-form-item
              :label="$t('sys.appDesigner.printDesign.form.width')"
              name="width"
              :rules="[{ required: true }]"
            >
              <a-input-number
                v-model:value="formState.width"
                :precision="0"
                :placeholder="$t('sys.appDesigner.inputPlaceholder')"
                :disabled="isEdit || formState.paperSize !== 'CUSTOM'"
                :min="0"
              >
                <template #addonAfter> mm </template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item :label="'描述'" name="description">
        <a-textarea
          v-model:value="formState.description"
          :placeholder="$t('sys.inputText')"
          show-count
          :maxlength="120"
        />
      </a-form-item>
    </a-form>
  </div>
  <div class="p16px text-right selected-row-modal__footer">
    <a-button class="mr16px" @click="handleClose">{{ $t('sys.cancel') }}</a-button>
    <a-button class="mr16px" type="primary" @click="handleOk(false)">{{ $t('sys.ok2') }}</a-button>
    <a-button type="primary" v-if="showOk2Open" @click="handleOk(true)">确认并设计</a-button>
  </div>
</template>
<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { pagerSizeMap } from '/@/projects/app-designer/src/views/print-designer-new/constants';
  // import { Orientation } from '@gct/nocode-base';
  import { IModal, useModal } from '@gct/runtime';
  import {
    getDocumentGetVersionById,
    postDocument,
    putDocumentUpdateVersionByIdById,
  } from '/@/apis/gct-apaas/DocumentController';
  import { DocumentRequest } from '/@/apis/gct-apaas/model';

  const props = defineProps<{
    modal: IModal;
    isEdit?: boolean;
    id?: string;
    showOk2Open?: boolean;
  }>();

  const formRef = ref();
  const formState = ref<DocumentRequest>({
    paperSize: pagerSizeMap.A4,
    width: 297,
    height: 210,
  });

  onMounted(() => {
    if (props.id) {
      getDocumentInfo();
    }
  });
  const pageSizeChange = () => {
    let value: string = '';
    switch (formState.value.paperSize) {
      case 'A3':
        value = '297_420';
        break;
      case 'A4':
        value = '210_297';
        break;
      case 'A5':
        value = '148_210';
        break;
      default:
        value = 'CUSTOM';
        break;
    }

    if (value === 'CUSTOM' || !value) {
      formState.value.height = undefined;
      formState.value.width = undefined;
    }
    if (value && value.indexOf('_') !== -1) {
      const [longValue, widthValue] = value.split('_');
      formState.value.height = Number.parseInt(longValue, 10);
      formState.value.width = Number.parseInt(widthValue, 10);
    }
  };

  async function addDocment() {
    const data = {
      ...formState.value,
      categoryId: '2vuxRvamYCuyjUBC',
      modelKey: 'em_print_master',
      modelCategory: 'entity',
      default: 1,
      version: '1',
    };
    if (!props.id) {
      await postDocument(data);
    } else await putDocumentUpdateVersionByIdById({ id: props.id }, data);
  }

  async function getDocumentInfo() {
    const info: any = await getDocumentGetVersionById({ id: props.id });
    Object.assign(formState.value, {
      ...info,
      // version: info?.version,
      // handlerType: info.handlerType,
      // default: info.default,
      designerJson: info.designerJson,
      runtimeJson: info.runtimeJson,
    });
  }

  async function handleOk(showOk2Open: boolean = false) {
    const result: any = await addDocment();
    props.modal.dismiss({
      ok: true,
      data: result,
      showOk2Open,
    });
  }

  function handleClose() {
    props.modal.dismiss();
  }

  useModal(async () => {
    await formRef.value.validate();
    await addDocment();
    return {
      ok: true,
    };
  });
</script>
<style lang="less" scoped></style>
