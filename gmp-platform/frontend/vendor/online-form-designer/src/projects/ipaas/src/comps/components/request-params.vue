<template>
  <a-form-item class="relative">
    <template #label>
      <span>{{ name }}</span>
      <ParamsTip class="ml-6px" />
    </template>
    <a-button
      type="link"
      class="important-absolute right-0px -top-22px"
      size="small"
      v-if="!disabled"
      @click="addParam(list)"
    >
      {{ t('sys.add') }}
    </a-button>
    <div>
      <div v-for="(item, idx) in list" :key="idx" class="w100% p4px params-wrap bg-[#eee] mb-4px">
        <div class="ks-row">
          <div class="ks-col">
            <a-input
              v-model:value="item.key"
              size="small"
              :placeholder="t('sys.keyOfSth', { sth: t('sys.field') })"
              :disabled="disabled"
            />
          </div>
          <i
            class="iconfont icon-shanchu2 error-gct-hover text-[#333333] cursor-pointer ml5px"
            style="line-height: 24px"
            @click="deleteParam(list, idx)"
            v-if="!disabled"
          ></i>
        </div>

        <div class="flex mt-4px">
          <a-select
            class="mr-4px"
            v-model:value="item.keyType"
            size="small"
            :placeholder="t('sys.typeOfSth', { sth: t('sys.field') })"
            :disabled="disabled"
          >
            <a-select-option
              v-for="ele in Object.values(ParameterTypeEnum).filter(
                (e) => e !== ParameterTypeEnum.Object && e !== ParameterTypeEnum.Array,
              )"
              :key="ele"
              :value="ele"
            >
              {{ t(`sys.ipaas.${ele}`) }}
            </a-select-option>
          </a-select>

          <a-input
            v-model:value="item.value"
            size="small"
            :placeholder="$t('sys.pageDesigner.fieldValue')"
            :disabled="disabled"
          />
        </div>
      </div>
    </div>
  </a-form-item>
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ParameterTypeEnum } from '../components/ParameterStruct';
  import ParamsTip from '/@ipaas/comps/step-modules/__comps__/params-tip.vue';

  defineProps<{
    name: string;
    list: any[];
    disabled?: boolean;
  }>();

  const { t } = useI18n();

  //请求头和query参数，添加
  const addParam = (list) => {
    list.unshift({ value: '', keyType: ParameterTypeEnum.String, key: '' });
  };

  //请求头和query参数，删除
  const deleteParam = (list, idx) => {
    list.splice(idx, 1);
  };
</script>

<style></style>
