<template>
  <div class="pt-20px">
    <div class="mx34px mb24px py8px pl8px pr20px bg-[#F8F8F8] ks-row">
      <i class="iconfont icon-a-zhuyi_attention2 text-[#F54547] mr10px"></i>
      <div class="text-[#797A7D]">
        {{ t('sys.edhr.documentItemTip') }}
      </div>
    </div>
    <a-form
      ref="formRef"
      :model="formData"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 14 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.webRender.edhrApplication.itemName')"
        name="name_"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formData.name_"
          :placeholder="
            t('sys.pleaseInputSth', { sth: t('sys.webRender.edhrApplication.itemName') })
          "
          show-count
          :maxlength="32"
        />
      </a-form-item>

      <a-form-item
        :label="t('sys.webRender.edhrApplication.itemValueType')"
        name="type_"
        :rules="[{ required: true }]"
      >
        <a-select
          v-model:value="formData.type_"
          allowClear
          :placeholder="
            t('sys.pleaseSelectSth', { sth: t('sys.webRender.edhrApplication.itemValueType') })
          "
          :options="typeOptions"
          @change="
            () => {
              formData.show_type_ = showTypeOptions?.[0]?.value || undefined;
            }
          "
        />
      </a-form-item>

      <a-form-item
        :label="t('sys.webRender.edhrApplication.itemShowType')"
        name="show_type_"
        v-show="showTypeOptions.length"
      >
        <a-select
          v-model:value="formData.show_type_"
          :placeholder="
            t('sys.pleaseSelectSth', { sth: t('sys.webRender.edhrApplication.itemShowType') })
          "
          :options="showTypeOptions"
        />
      </a-form-item>
      <template v-for="attrKey of attrList" :key="attrKey">
        <a-form-item
          :label="t(`sys.webRender.edhrApplication.itemAttrKey.${attrKey}`)"
          :name="attrKey"
        >
          <a-switch
            v-if="useComp2Attrs.switch.includes(attrKey)"
            v-model:checked="formData[attrKey]"
          />
          <a-input-number
            v-else-if="useComp2Attrs.inputNumber.includes(attrKey)"
            v-model:value="formData[attrKey]"
            v-bind="getInputNumberAttr(attrKey)"
            :placeholder="t('sys.inputText')"
          />
          <a-input
            v-else-if="useComp2Attrs.input.includes(attrKey)"
            v-model:value="formData[attrKey]"
            :placeholder="t('sys.inputText')"
          />

          <OptionsRender
            v-else-if="useComp2Attrs.option.includes(attrKey)"
            :type="formData.type_"
            v-model:modelValue="formData[attrKey]"
            :placeholder="t('sys.inputText')"
          />
        </a-form-item>
      </template>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="item-modal">
  import { reactive, ref } from 'vue';
  import { pickBy, merge } from 'lodash-es';
  import { useModal } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import OptionsRender from './component/options-render.vue';
  import { useDynamicItem } from './hook/useDynamicItem';

  import type { FormInstance } from 'ant-design-vue';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      data?: IData;
      params: IData;
      shouldClose?: (data) => Promise<boolean>;
    }>(),
    {
      data: () => ({}),
    },
  );

  const basicAttrs = ['category_id_', 'name_', 'type_', 'show_type_'];

  const formData = reactive({ ...props.data });

  const { typeOptions, showTypeOptions, attrList, useComp2Attrs, getInputNumberAttr } =
    useDynamicItem(formData);

  const formRef = ref<FormInstance>();

  useModal(async () => {
    await formRef.value!.validate();

    let editedData;

    if (formData.id_) {
      editedData = pickBy(formData, (v) => v !== undefined);
    } else {
      const defaultData = {};
      attrList.value.forEach((attr) => {
        if (useComp2Attrs.switch.includes(attr)) {
          defaultData[attr] = false;
        }
      });

      const realAttrs = basicAttrs.concat(attrList.value);
      editedData = merge(
        defaultData,
        pickBy(formData, (v, key) => v !== undefined && realAttrs.includes(key)),
      );
    }

    let isClose = true;
    if (props.shouldClose) {
      isClose = await props.shouldClose(editedData);
    }
    return {
      ok: isClose,
      data: [editedData],
    };
  });
</script>

<style scoped></style>
