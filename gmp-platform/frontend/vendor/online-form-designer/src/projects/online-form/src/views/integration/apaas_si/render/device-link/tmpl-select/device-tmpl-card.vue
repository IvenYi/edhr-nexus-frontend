<template>
  <TmplCard class="device-tmpl-card" @edit="doEdit" @detail="doDetail">
    <template #title>
      <DeviceSelect
        v-model="formState.runtimeDeviceId"
        @selected-change="onSelectedChange"
        styleMode="link"
        :trigger="['click']"
      />
    </template>
    <div class="sub-title">
      <i :class="`type-icon gct-iconfont icon-icon_shebeihulian`"></i>
      {{ $t('sys.edhr.DeviceLinkTmplTypeEnum.DEVICE_INTERCONNECTION') }}
      <span
        v-if="tmpl.runtimeDeviceType === 'MQTT'"
        :class="['status-icon', isRunning && 'is-running']"
        @click="onClickMqtt"
      >
        <i :class="` gct-iconfont icon-MQTT`"></i>
      </span>
    </div>
    <FieldsPreview :fields="fieldKeys" />
  </TmplCard>
</template>

<script lang="ts" setup name="device-tmpl-card">
  import { DeviceLink, DeviceLinkTmplUtil } from '@gct/nocode-base';
  import TmplCard from './tmpl-card.vue';
  import { DeviceSelect } from '/@online-form/components/device';
  import { computed } from 'vue';
  import FieldsPreview from './fields-preview.vue';

  const props = withDefaults(
    defineProps<{
      isRunning?: boolean;
      tmpl: DeviceLink.DeviceInterconnectionTmpl;
    }>(),
    {
      isRunning: false,
      tmpl: undefined,
    },
  );

  /** 对应的表单的key */
  const fieldKeys = computed(() => {
    const fieldKeys: string[] = [];
    props.tmpl.fieldMaps?.forEach((fieldMap) => {
      if (fieldMap.formField) {
        fieldKeys.push(fieldMap.formField);
      } else if (fieldMap.formFields) {
        fieldKeys.push(...(fieldMap.formFields.filter(Boolean) as string[]));
      }
    });
    return fieldKeys;
  });

  const emit = defineEmits<{
    (e: 'edit', tmpl: DeviceLink.DeviceInterconnectionTmpl): void;
    (e: 'detail', tmpl: DeviceLink.DeviceInterconnectionTmpl): void;
    (e: 'disconnect', tmpl: DeviceLink.DeviceInterconnectionTmpl): void;
  }>();

  const doEdit = () => {
    emit('edit', props.tmpl);
  };

  const doDetail = () => {
    emit('detail', props.tmpl);
  };

  const formState = computed({
    get() {
      return props.tmpl;
    },
    set(v) {
      Object.assign(props.tmpl, v);
    },
  });

  const onSelectedChange = (row) => {
    formState.value.runtimeDeviceKey = row.key;
    formState.value.runtimeDeviceType = row.type;
  };

  const onClickMqtt = () => {
    if (props.isRunning) {
      emit('disconnect', props.tmpl);
    }
  };
</script>

<style lang="less" scoped>
  .device-tmpl-card {
    .type-icon {
      font-size: 14px;
      color: #026ac8;
      margin-right: 4px;
    }

    .sub-title {
      margin-bottom: 12px;
      font-weight: 400;
      font-size: 12px;
      line-height: 18px;
      color: #1a1d23;
    }

    .status-icon {
      background: rgba(166, 166, 166, 0.1);
      border-radius: 20px 20px 20px 20px;
      border: 1px solid rgba(166, 166, 166, 0.5);
      color: #a6a6a6;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 18px;
      vertical-align: bottom;
      margin-left: 8px;
      &::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 4px;
        background: #a6a6a6;
        border-radius: 50%;
        margin-right: 4px;
      }
      > .gct-iconfont {
        font-size: 8px;
      }

      &.is-running {
        background: rgba(72, 198, 92, 0.1);
        border: 1px solid rgba(72, 198, 92, 0.5);
        color: #48c65c;
        cursor: pointer;
        &::before {
          background: #48c65c;
        }
      }
    }
  }
</style>
