<template>
  <div :class="[ns.b()]">
    <div :class="[ns.b('picker')]">
      <a-select
        v-if="isInfo === false"
        v-model:value="value"
        show-search
        :placeholder="t('sys.appDesigner.pleaseSelect')"
        :default-active-first-option="false"
        :show-arrow="false"
        :filter-option="false"
        :not-found-content="null"
        :options="options"
        allow-clear
      />
      <span v-if="isInfo === true">{{ textValue }}</span>
    </div>
    <div :class="[ns.b('action')]">
      <a-button v-if="isInfo === false" type="link" @click="handleCreate">
        <template #icon><PlusOutlined /></template>
        <span>{{ t('sys.appDesigner.timedTask.newBuilt') }}</span>
      </a-button>
    </div>
    <so-modal
      v-if="isInfo === false"
      @register="soRegister"
      :category="options"
      @create-success="handleCreateSuccess"
    />
    <script-modal
      v-if="isInfo === false"
      @register="scriptRegister"
      :scriptCategory="options"
      @create-success="handleCreateSuccess"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import { SelectProps } from 'ant-design-vue';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { randomUUID } from '/@/hooks/web/useUUid';
  import { useModal } from '/@/components/Modal';
  import ScriptModal from '/@app-designer/views/logic-develop/modal/script-modal.vue';
  import SoModal from '/@app-designer/views/logic-develop/modal/service-orchestration-modal.vue';
  import './service-script-picker.scss';
  import { scriptTypeEnum } from '@gct/runtime';
  const { t } = useI18n();

  const props = defineProps({
    isInfo: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
    },
    mode: {
      type: String,
      required: true,
    },
  });

  const emit = defineEmits(['update:value', 'update:sourceKey']);

  // 值
  const value = ref(props.value);

  // 显示的文本值
  const textValue = ref('');

  const ns = useNamespace('service-script-picker');

  // 服务脚本或服务编排选项清单
  const options = ref<SelectProps['options']>([]);

  const [soRegister, { openModal: openSoModal }] = useModal();
  const [scriptRegister, { openModal: openScriptModal }] = useModal();

  // 获取脚本信息
  const getScriptData = async () => {
    const data = (await getCategoryListComplete({ module: ScriptTypeEnum.DEFAULT })) || [];
    options.value = formatData(data);
    calcTextValue();
  };

  // 编排列表
  const getSoData = async () => {
    const data = (await getCategoryListComplete({ module: ScriptTypeEnum.ORCHESTRATION })) || [];
    options.value = formatData(data);
    calcTextValue();
  };

  const loadService = async () => {
    if (props.mode === 'SCRIPT_SERVICE') {
      await getScriptData();
    } else if (props.mode === 'SO_SERVICE') {
      await getSoData();
    }
  };

  const handleCreate = () => {
    if (props.mode === 'SO_SERVICE') {
      openSoModal(true, {
        data: {
          uuid: randomUUID(),
        },
      });
    } else if (props.mode === 'SCRIPT_SERVICE') {
      openScriptModal(true, {
        uuid: randomUUID(),
        contentKey: scriptTypeEnum.TIMER,
      });
    }
  };

  const handleCreateSuccess = async (id) => {
    await loadService();
    value.value = id;
  };

  const formatData = (data: CategoryCompleteResponse[]) => {
    const options: any = [];
    if (data) {
      for (let folder of data) {
        const item: any = {
          id: folder.id,
          name: folder.name,
          label: folder.name,
          options: [],
        };
        if (folder.children!.length > 0) {
          for (let i of folder.children!) {
            const obj = {
              id: i.id,
              label: i.name,
              value: i.key,
            };
            item.options.push(obj);
          }
        }
        options.push(item);
      }
    }
    return options;
  };

  const calcTextValue = () => {
    if (options.value) {
      options.value.forEach((folder) => {
        if (folder.options && folder.options.length === 0) {
          return;
        }
        for (let i of folder.options!) {
          if (i.value === value.value) {
            textValue.value = i.label;
            return;
          }
        }
      });
    }
  };

  watch(
    () => props.mode,
    () => {
      if (props.mode) {
        loadService();
      }
    },
    { immediate: true },
  );

  watch(
    () => props.value,
    () => {
      if (value.value !== props.value) {
        value.value = props.value;
        calcTextValue();
      }
    },
  );

  watch(
    () => value.value,
    () => {
      if (props.value !== value.value) {
        emit('update:value', value.value);
      }
    },
  );
</script>
