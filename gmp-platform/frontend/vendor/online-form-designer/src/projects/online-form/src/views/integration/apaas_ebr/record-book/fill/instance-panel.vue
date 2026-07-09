<template>
  <a-collapse-panel
    :name="item.id"
    :key="item.id"
    :class="{ 'ebr-instance-item--selected': selected }"
  >
    <template #header>
      <div class="header-title-content pr-4px" @click.stop="onSelect">
        <span
          v-if="item.highlightName"
          class="title gct-text-overflow ks-col"
          :title="item.title"
          :innerHTML="item.highlightName"
        ></span>
        <span v-else class="title ml-4px" :title="item.title">{{ item.title }}</span>

        <instance-status-label
          :form-type="item.formType"
          :data-status="item.dataStatus"
          :instance-status="item.instanceStatus"
          use-dynamic-color
        />
        <i
          v-if="supportEdit"
          class="icon iconfont icon-sheji-2 leading-none ml-2px primary-gct-hover"
          @click.stop="onEdit"
        ></i>
      </div>
    </template>

    <div class="content">
      <a-descriptions
        :column="1"
        :colon="false"
        :labelStyle="{ color: '#666', fontSize: '12px' }"
        :contentStyle="{ color: '#252525', fontSize: '12px' }"
        layout="vertical"
      >
        <a-descriptions-item :label="$t('sys.onlineForm.formIdent')">
          <copy-module-key :moduleKey="item.serialNo" :fontSize="12" />
        </a-descriptions-item>

        <a-descriptions-item :label="t('sys.createTime')">
          {{ item.createTime }}
        </a-descriptions-item>

        <a-descriptions-item :label="t('sys.updateTime')">
          {{ item.modifyTime }}
        </a-descriptions-item>

        <a-descriptions-item :label="t('sys.updatePerson')">
          {{ item.modifyUserName }}
        </a-descriptions-item>
      </a-descriptions>
    </div>
  </a-collapse-panel>
</template>

<script setup lang="ts">
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { useI18n } from '/@/hooks/web/useI18n';

  import InstanceStatusLabel from '../../utils/instance-status/instance-status-label.vue';

  const { t } = useI18n();

  const props = defineProps<{
    item: any;
    selected?: boolean;
    supportEdit: boolean;
  }>();

  const emit = defineEmits(['edit', 'select']);

  function onEdit() {
    emit('edit', props.item);
  }

  function onSelect() {
    emit('select', props.item);
  }
</script>
