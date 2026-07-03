<template>
  <div>
    <a-modal
      v-model:visible="visible"
      :title="t(t('sys.webRender.reprint'))"
      wrapClassName="ant-modal-new"
      width="640px"
      :after-close="afterClose"
      @ok="handleOk"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 15 }"
        autocomplete="off"
      >
        <a-form-item
          :label="t('sys.model.printer')"
          name="printKey"
          :rules="[
            { required: true, message: t('sys.chooseTextTip', { name: t('sys.model.printer') }) },
          ]"
        >
          <a-tree-select
            v-model:value="formState.printKey"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            dropdown-class-name="gct-custom-select-dropdown"
            :placeholder="t('sys.chooseText')"
            allow-clear
            tree-default-expand-all
            :tree-data="printOptions"
            tree-node-filter-prop="label"
          >
            <template #title="item">
              <div
                v-if="!Object.prototype.hasOwnProperty.call(item, 'selected')"
                class="gct-text-overflow"
              >
                {{ item.dftPrintInfo?.name || item.name }}
              </div>
              <a-row v-else :gutter="4">
                <a-col
                  :span="item.defaultPrint === '是' ? 18 : 24"
                  class="gct-text-overflow"
                  :title="item.name"
                  >{{ item.name }}</a-col
                >
                <a-col :span="item.defaultPrint === '是' ? 6 : 0">
                  <a-tag color="processing">{{ t('sys.default') }}</a-tag>
                </a-col>
              </a-row>
            </template>
          </a-tree-select>
        </a-form-item>
        <a-form-item
          :label="t('sys.webRender.printQty')"
          :rules="[{ required: true }]"
          name="printNumber"
        >
          <a-input-number
            v-model:value="formState.printNumber"
            :min="1"
            :precision="0"
            :placeholder="t('sys.inputText')"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script setup lang="ts" name="reprint">
  import { ref, onMounted, toRaw } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { getPrintPrintDropdownList } from '/@/apis/gct-apaas/PrintController';
  import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';

  interface Form {
    printNumber: number;
    printKey: string;
  }

  const { t } = useI18n();
  const formRef = ref();
  const visible = ref(false);
  const formState = ref<Partial<Form>>({ printNumber: 1 });
  const printOptions = ref<any[]>([]);

  onMounted(() => {
    getPrinterData();
  });
  const resolveCallback = ref();
  const open = () => {
    visible.value = true;
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  };

  const handleOk = async () => {
    await formRef.value?.validate();
    visible.value = false;
    resolveCallback.value(toRaw(formState.value));
  };

  const afterClose = () => {
    formRef.value?.resetFields();
  };

  const getPrinterData = async () => {
    // 后端返回的字段中没有可以作为唯一标识的字段，所以，将name和id用‘&’拼在一起作为唯一标识
    const data: any[] = (await getPrintPrintDropdownList()) || [];
    printOptions.value = data.map((i) => {
      const dftInfo =
        (i.printChildNode && i.printChildNode.filter((e) => e.defaultPrint === '是')[0]) ||
        undefined;
      return {
        ...i,
        value: i.printKey,
        name: i.name,
        disabled: i.type === PrintResourceEnum.INTERNET_PRINT,
        dftPrintInfo: i.type === PrintResourceEnum.CLIENT_PRINT && dftInfo ? dftInfo : undefined,
        children: i.printChildNode
          ? i.printChildNode.map((e) => {
              return {
                ...e,
                value: e.printKey,
                label: e.name,
              };
            })
          : [],
      };
    });
  };

  defineExpose({
    open,
  });
</script>
<style lang="less" scoped></style>
