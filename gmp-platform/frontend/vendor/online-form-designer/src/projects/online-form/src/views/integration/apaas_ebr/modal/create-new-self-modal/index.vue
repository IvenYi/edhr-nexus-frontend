<template>
  <div class="px34px py28px">
    <div v-if="showTip" class="text-[#000000] mb20px text-[16px]">
      {{
        $t('sys.webRender.edhrApplication.createNewInstanceTitle', {
          sth: `【${selectDocData?.name}】`,
        })
      }}
    </div>
    <div v-if="showTip" class="bg-[#F8F8F8] p8px text-[#797A7D] mb20px">
      <i class="iconfont icon-a-zhuyi_attention2 text-[#F54547]"></i>
      {{ $t('sys.webRender.edhrApplication.createNewInstanceContentNew') }}
    </div>

    <a-form ref="formRef" :model="formState">
      <!-- 增加表单实例选择 -->
      <a-form-item
        v-if="shouldQuerySuccessorTmpl"
        :label="t('sys.webRender.onlineFormTmpl')"
        name="tmplId"
        :rules="[
          {
            required: !!shouldQuerySuccessorTmpl,
            message: t('sys.chooseText'),
          },
        ]"
      >
        <self-tmpl-select
          :type="FormDesignEnum.ONLINE_FORM"
          :value="formState.tmplId"
          :enable-control="true"
          :placeholder="t('sys.chooseText')"
          :self-tmpl-id="onlySelfTmplId"
          @select="onFormVersionSelect"
        />
      </a-form-item>
      <a-form-item
        :label="$t('sys.onlineForm.remarkName')"
        :rules="[{ required: true }]"
        name="description"
      >
        <a-input
          v-model:value="formState.description"
          allowClear
          :placeholder="$t('sys.inputText')"
          maxlength="64"
          showCount
        />
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { useModal } from '@gct/runtime';
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
  import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';

  import selfTmplSelect from './self-tmpl-select/self-tmpl-select.vue';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      selectDocData: any;
      showTip?: boolean;
    }>(),
    {
      showTip: true,
    },
  );

  /** 表单模板是否是父模板，需要子版本数据 */
  const shouldQuerySuccessorTmpl = computed(() => {
    const refTmplId = props.selectDocData?.refId ?? '';
    const [baseId, id] = refTmplId.split(':');
    return baseId && id ? false : true;
  });

  /** 父模板id => baseId */
  const onlySelfTmplId = computed(() => {
    return props.selectDocData?.refId;
  });

  const formRef = ref();
  const formState = ref<{
    description: string | undefined;
    tmplId: string | undefined;
  }>({
    description: undefined,
    tmplId: undefined,
  });

  const onSave = async () => {
    await formRef.value?.validate();
    return {
      ok: true,
      params: formState.value,
    };
  };

  const onFormVersionSelect = (v) => {
    const refId = v.baseId ? `${v.baseId}:${v.id}` : v.id;
    formState.value.tmplId = refId;
  };

  useModal(onSave);

  onMounted(async () => {
    if (props.selectDocData && shouldQuerySuccessorTmpl.value) {
      // 通过父获取默认版本
      const refData = await getOnlineFormTmplGetVersionById({ id: onlySelfTmplId.value });
      formState.value.tmplId = refData?.baseId ? `${refData.baseId}:${refData.id}` : refData!.id;
    }
  });
</script>
<style lang="less" scoped></style>
