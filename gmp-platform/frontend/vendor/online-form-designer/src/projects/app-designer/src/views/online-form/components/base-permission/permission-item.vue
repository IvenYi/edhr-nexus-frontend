<template>
  <div class="permission-item">
    <a-form ref="formRef" :model="formState">
      <div class="flex justify-between border-b">
        <div class="w-800px">
          <a-row v-if="formState._isEditing" :gutter="24">
            <a-col :span="16">
              <a-form-item
                :label="$t('sys.name')"
                name="name"
                :rules="[{ required: true, validator: validateName }]"
              >
                <a-input
                  v-model:value="formState.name"
                  :placeholder="$t('sys.inputText')"
                  maxlength="32"
                  showCount
                />
              </a-form-item>
            </a-col>
            <!-- <a-col :span="8">
              <a-form-item
                label="权限等级"
                name="permissionLevel"
                :rules="[{ required: true, message: '请输入权限等级' }]"
              >
                <a-input-number
                  v-model:value="formState.permissionLevel"
                  placeholder="请输入权限等级"
                />
              </a-form-item>
            </a-col> -->
            <a-col :span="24">
              <a-form-item :label="$t('sys.description')" name="desc">
                <a-input
                  v-model:value="formState.desc"
                  :placeholder="$t('sys.inputText')"
                  maxlength="120"
                  showCount
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row v-else>
            <a-col :span="16">
              <div class="font-bold ell"> {{ formState.name }} </div>
            </a-col>
            <!-- <a-col :span="8">
              <a-form-item label="权限等级">
                {{ formState.permissionLevel }}
              </a-form-item>
            </a-col> -->
            <a-col :span="24" v-if="formState.desc">
              <div class="ell text-[#8F8F8F] text-[12px] my12px">{{ formState.desc }}</div>
            </a-col>
          </a-row>
        </div>
        <div class="mb12px">
          <a-space v-if="!formState._isEditing">
            <a-button type="default" @click="doEdit">{{ $t('sys.edit') }}</a-button>
            <a-button type="default" @click="emit('copy')">{{ $t('sys.copy') }}</a-button>
            <a-button type="default" danger @click="onDelete">{{ $t('sys.delete') }}</a-button>
          </a-space>
          <a-space v-else>
            <a-button type="primary" @click="onSave()">{{ $t('sys.saveText') }}</a-button>
            <a-button type="default" @click="onCancel">{{ $t('sys.cancel') }}</a-button>
          </a-space>
        </div>
      </div>
      <div class="mt16px">
        <template v-if="formState._isEditing">
          <div>
            <a-form-item :label="$t('sys.edhr.permissionMember')">
              <a-radio-group v-model:value="formState.memberPermissionSelect">
                <a-radio :value="0">{{ $t('sys.edhr.allMembers') }}</a-radio>
                <a-radio :value="1"
                  >{{ $t('sys.customize') }}
                  <a-button
                    v-if="formState.memberPermissionSelect === 1"
                    type="link"
                    @click="selectMemberRange"
                  >
                    {{ $t('sys.edhr.setMember') }}
                  </a-button>
                </a-radio>
              </a-radio-group>
            </a-form-item>
            <MemberRangeSelect
              class="mb-20px"
              ref="memberRangeSelectRef"
              :maxShow="7"
              v-if="formState.memberPermissionSelect === 1"
              v-model="formState.memberPermission"
            />
          </div>
          <div>
            <a-form-item :label="$t('sys.appDesigner.fieldRole')">
              <a-radio-group v-model:value="formState.fieldPermissionSelect">
                <a-radio :value="0">{{ $t('sys.edhr.keepFormDesign') }}</a-radio>
                <a-radio :value="1">
                  {{ $t('sys.customize') }}
                  <a-button
                    v-if="formState.fieldPermissionSelect === 1"
                    type="link"
                    @click="openFieldModal"
                  >
                    {{ $t('sys.edhr.setField') }}
                  </a-button>
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </div>
        </template>
        <template v-else>
          <a-form-item :label="$t('sys.edhr.permissionMember')">
            <template v-if="formState.memberPermissionSelect === 0">{{
              $t('sys.edhr.allMembers')
            }}</template>
            <template v-else>{{ $t('sys.edhr.customMember') }}</template>
          </a-form-item>
          <MemberRangeSelect
            class="mb-20px"
            ref="memberRangeSelectRef"
            v-if="formState.fieldPermissionSelect === 1"
            v-model="formState.memberPermission"
          />
          <a-form-item :label="$t('sys.appDesigner.fieldRole')">
            <template v-if="formState.fieldPermissionSelect === 0">{{
              $t('sys.edhr.keepFormDesign')
            }}</template>
            <template v-else>
              {{ $t('sys.customize') }}
              <a-button type="link" @click="openFieldModal">{{ $t('sys.viewDetails') }}</a-button>
            </template>
          </a-form-item>
        </template>
      </div>
    </a-form>
  </div>
</template>

<script lang="ts" setup name="permission-item">
  import { computed, h, inject, ref } from 'vue';
  import { FormTmpPermissionConfig } from './type';
  import { now } from './util';
  import MemberRangeSelect from './member-range/member-range-select.vue';
  import { FieldPermissionController } from './field-permission/use-field-permission';
  import { cloneDeep } from 'lodash-es';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { Modal, message } from 'ant-design-vue';

  const c = inject<FieldPermissionController>('FieldPermissionController')!;

  const props = withDefaults(
    defineProps<{
      value: FormTmpPermissionConfig;
      validateItem?: () => boolean;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'delete'): void;
    (e: 'copy'): void;
    (e: 'change'): void;
    (e: 'update:value', value: FormTmpPermissionConfig): void;
  }>();

  const formRef = ref<any>();
  const formState = computed(() => props.value);
  const memberRangeSelectRef = ref<any>();
  const initFormData = ref();

  const doEdit = () => {
    initFormData.value = cloneDeep(formState.value);
    formState.value._isEditing = true;
  };

  const onDelete = () => {
    Modal.confirm({
      content: $t('sys.sureToDo'),
      icon: h(ExclamationCircleOutlined),
      okText: $t('sys.okText'),
      cancelText: $t('sys.cancel'),
      async onOk() {
        emit('delete');
      },
      onCancel() {},
    });
  };

  const onSave = async () => {
    await formRef.value.validate();
    formState.value._isEditing = false;
    formState.value._isNew = false;
    formState.value.modifyTime = now();
    emit('change');
  };

  const validateName = (rule, value) => {
    if (!value || !value.trim()) return Promise.reject($t('sys.onlineForm.pleaseEnterName'));
    else if (props.validateItem && !props.validateItem()) {
      return Promise.reject($t('sys.onlineForm.duplicateName'));
    }
    return Promise.resolve();
  };

  const onCancel = () => {
    if (formState.value._isNew) {
      emit('delete');
      return;
    }
    Object.assign(formState.value, { ...cloneDeep(initFormData.value), _isEditing: false });
    initFormData.value = null;
  };

  const selectMemberRange = () => {
    memberRangeSelectRef.value.openView();
  };

  const openFieldModal = async () => {
    const res = await c.openModal({
      fieldConfigs: formState.value.fieldPermission ?? [],
      readonly: !formState.value._isEditing,
    });
    console.log('openFieldModal', res);
    if (res.ok && formState.value._isEditing && res.data) {
      formState.value.fieldPermission = res.data;
    }
  };
</script>

<style lang="scss" scoped>
  .permission-item {
    border: 1px solid #dcdfe6;
    padding: 16px 16px 0;
    border-radius: 4px;
    background-color: #fff;
  }
  .border-b {
    border-bottom: 1px solid #dcdfe6;
  }
  :deep(.ant-form .ant-form-item) {
    margin-bottom: 16px;

    .ant-form-item-label {
      font-weight: 600;
    }
  }
</style>
