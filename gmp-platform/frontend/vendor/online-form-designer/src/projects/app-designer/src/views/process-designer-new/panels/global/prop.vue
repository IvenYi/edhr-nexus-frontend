<template>
  <a-form>
    <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
      <form-item :label="t('sys.nameOfSth', { sth: t('sys.process.index') })" isFirst>
        {{ processInfo.name }}
      </form-item>
      <form-item :label="t('sys.keyOfSth', { sth: t('sys.process.index') })" isFirst>
        <copy-module-key :moduleKey="processInfo?.key" />
      </form-item>
      <form-item :label="t('sys.process.refModel')" isFirst>
        {{ processInfo.modelName }}
      </form-item>
      <form-item :label="t('sys.description')" :inline="false" isFirst>
        {{ processInfo.description }}
      </form-item>
    </SimpleCollapse>
    <SimpleCollapse :title="t('sys.process.globalPage')" :tooltip="t('sys.process.globalPageTip')">
      <NodeBindingPage :data="globalData.data" />
    </SimpleCollapse>
    <SimpleCollapse v-if="!!curVersionId" :title="t('sys.tooltipNotify')">
      <form-item
        :label="t('sys.process.triggerBuiltInMsg')"
        :tooltip="t('sys.process.triggerBuiltInMsgTip')"
        is-first
      >
        <div class="text-right">
          <a-switch
            :checked="!!globalData.data.builtinMsgEnabled"
            :disabled="bpmnReadonly"
            size="small"
            @change="handleSwitchChange"
          />
        </div>
      </form-item>
      <form-item
        v-show="!!globalData.data.builtinMsgEnabled"
        :label="t('sys.message.pushType')"
        :inline="false"
      >
        <div v-for="item in pushTypeList" :key="item.type" class="ks-row-middle mb6px">
          <div>
            <a-checkbox
              :checked="!!pushList.find((e) => e.type === item.value)"
              :disabled="item.value === 'system' || bpmnReadonly"
              :value="item.value"
              @change="handleCheckChange"
            >
              {{ item.label }}
            </a-checkbox>
          </div>
          <div
            v-if="pushList.find((e) => e.type === item.value) && item.value !== 'system'"
            class="ks-col"
          >
            <a-select
              ref="select"
              v-model:value="pushList.find((e) => e.type === item.value)!.key"
              :options="pushTypeOptionsList[item.value]"
              :getPopupContainer="(trigger) => trigger.parentNode"
              :disabled="bpmnReadonly"
              size="small"
              optionLabelProp="text"
            />
          </div>
        </div>
      </form-item>
    </SimpleCollapse>
  </a-form>
</template>
<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getMessageSettingFindAllByType } from '/@/apis/gct-apaas/MessageSettingController';
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import FormItem from '../../components/form-item.vue';
  import NodeBindingPage from '../../components/node-binding-page.vue';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { useProcess } from '../../hook/useProcess';
  import { cloneDeep } from 'lodash-es';

  const { processInfo, globalData, curVersionId, bpmnReadonly } = useProcess();
  const { t } = useI18n();
  // 发送对象选项数组
  let pushTypeOptionsList = ref({});

  const pushList = computed({
    get() {
      return globalData.value.data.push;
    },
    set(value) {
      globalData.value.data.push = value;
    },
  });

  onMounted(() => {
    console.log('mounted');
    changePushTypeVal();
  });

  const pushTypeList = [
    {
      label: t('sys.system'),
      value: 'system',
    },
    {
      label: t('sys.email'),
      value: 'email',
    },
    {
      label: t('sys.shortWorkwx'),
      value: 'wecom',
    },
    {
      label: t('sys.feishu'),
      value: 'feishu',
    },
    {
      label: t('sys.dingtalk'),
      value: 'dingtalk',
    },
  ];

  async function changePushTypeVal() {
    let obj = {};
    await Promise.all(
      pushTypeList.map(async (e) => {
        if (e.value !== 'system') {
          if (pushTypeOptionsList.value[e.value]) {
            obj[e.value] = cloneDeep(pushTypeOptionsList.value[e.value]);
          } else {
            const res = (await getMessageSettingFindAllByType({ type: e.value })) || [];
            obj[e.value] = res.map((n) => {
              return {
                value: n.id,
                label: n.name,
                text: `${n.name}[${n.key}]`,
              };
            });
          }
        }
      }),
    );
    pushTypeOptionsList.value = obj;
  }

  const handleSwitchChange = (checked) => {
    globalData.value.data.builtinMsgEnabled = Number(checked);
  };

  const handleCheckChange = (e) => {
    const { checked, value } = e.target;
    if (checked) {
      pushList.value.push({ type: value });
    } else {
      pushList.value = pushList.value.filter((e) => e.type !== value);
    }
  };
</script>
<style lang="less" scoped></style>
