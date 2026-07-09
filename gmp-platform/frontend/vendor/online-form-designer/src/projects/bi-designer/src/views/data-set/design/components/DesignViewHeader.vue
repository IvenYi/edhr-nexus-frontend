<template>
  <div :class="ns.b()">
    <div :class="ns.e('left')">
      <div :class="ns.e('back')" @click="() => emit('onClose')">
        <i class="iconfont icon-a-Leftarrow"></i>
      </div>
      <div :class="ns.e('title')">
        {{ $t('sys.nameOfSth', { sth: $t('sys.menu.dataSet') }) }}：
      </div>
      <div :class="ns.e('view-title-edit')">
        <a-input
          ref="nameRef"
          v-show="isEdit"
          v-model:value="_titleName"
          :bordered="false"
          @click.stop
        />
        <span :class="ns.e('edit-title')" v-show="!isEdit" @click="onEdit">
          <span :title="titleName">{{ titleName }}</span>
          <i class="iconfont icon-a-Single-linetext"></i>
        </span>
      </div>
    </div>

    <div :class="ns.e('center')" v-if="isDsConfig || databaseType === DataSourceType.API">
      <div :class="ns.e('step')">
        <template v-if="databaseType === DataSourceType.API">
          <div
            :class="[ns.e('step-item'), ns.is('active', apiStep === APIDataSetStep.FIELD_CONFIG)]"
            @click="() => onChangeApiStep(APIDataSetStep.FIELD_CONFIG)"
          >
            1.字段配置
          </div>
          <div
            :class="[ns.e('step-item'), ns.is('active', apiStep === APIDataSetStep.DATASET_CONFIG)]"
            @click="() => onChangeApiStep(APIDataSetStep.DATASET_CONFIG)"
          >
            2.数据集配置
          </div>
        </template>
        <template v-else-if="isDsConfig">
          <div
            :class="[ns.e('step-item'), ns.is('active', step === ReportDataSetStepBI.MODEL_CONFIG)]"
            @click="() => onChangeStep(ReportDataSetStepBI.MODEL_CONFIG)"
          >
            1.模型配置
          </div>
          <div
            :class="[ns.e('step-item'), ns.is('active', step === ReportDataSetStepBI.FIELD_CONFIG)]"
            @click="() => onChangeStep(ReportDataSetStepBI.FIELD_CONFIG)"
          >
            2.字段配置
          </div>
          <div
            :class="[
              ns.e('step-item'),
              ns.is('active', step === ReportDataSetStepBI.DATASET_CONFIG),
            ]"
            @click="() => onChangeStep(ReportDataSetStepBI.DATASET_CONFIG)"
          >
            3.数据集配置
          </div>
        </template>
      </div>
    </div>
    <div :class="ns.e('right')">
      <div :class="ns.e('view-actions')">
        <a-button
          type="primary"
          v-if="
            (isDsConfig &&
              (step === ReportDataSetStepBI.MODEL_CONFIG ||
                step === ReportDataSetStepBI.FIELD_CONFIG)) ||
            (databaseType == DataSourceType.API && apiStep === APIDataSetStep.FIELD_CONFIG)
          "
          :disabled="isDsConfig ? isDisabled : databaseType !== DataSourceType.API"
          @click="() => emit('onNext', isDsConfig)"
        >
          下一步
        </a-button>
        <a-button v-else @click="() => emit('onSave')">
          <template #default>{{ $t('sys.designView.save') }}</template>
          <template #icon><i class="iconfont icon-baocun1"></i></template>
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, nextTick } from 'vue';
  import { ReportDataSetStepBI } from '@gct/runtime-web';
  import { useNamespace } from '@gct/runtime';
  import { onClickOutside } from '@vueuse/core';
  import { DataSourceType } from '/@bi-designer/enum/database';
  import { APIDataSetStep } from '../../interface/type';

  const props = defineProps<{
    titleName: string;
    oldTitleName: string;
    isEdit: boolean;
    isDsConfig?: boolean;
    step?: string;
    apiStep?: APIDataSetStep;
    isDisabled: boolean;
    databaseType?: DataSourceType;
    isApiEdit?: boolean;
  }>();

  const ns = useNamespace('design-view-header');

  const emit = defineEmits([
    'changeStep',
    'changeApiStep',
    'updateName',
    'onNext',
    'onSave',
    'onClose',
    'updateEdit',
    'update:titleName',
    'update:oldTitleName',
  ]);

  const nameRef = ref();

  const onChangeStep = (step: ReportDataSetStepBI) => {
    emit('changeStep', step);
  };

  const onChangeApiStep = (step: APIDataSetStep) => {
    emit('changeApiStep', step);
  };

  const _titleName = computed({
    get() {
      return props.titleName || '';
    },
    set(val) {
      emit('update:titleName', val);
    },
  });

  const _oldTitleName = computed({
    get() {
      return props.oldTitleName || '';
    },
    set(val) {
      emit('update:oldTitleName', val);
    },
  });

  const onEdit = () => {
    emit('updateEdit', true);
    _oldTitleName.value = _titleName.value;
    nextTick(() => {
      nameRef.value?.focus();
      nameRef.value?.select();
    });
  };

  onClickOutside(nameRef, (e) => {
    if (props.isEdit) {
      emit('updateEdit', false);
      const newVal = _titleName.value?.trim();
      if (_titleName.value?.length > 100) {
        return;
      }
      if (_oldTitleName.value !== newVal) {
        if (newVal == '') {
          _titleName.value = _oldTitleName.value;
        } else {
          e.stopPropagation();
        }
      }
    }
  });
</script>

<style lang="scss">
  @import '../design-view.scss';
</style>
