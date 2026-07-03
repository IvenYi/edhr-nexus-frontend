<template>
  <div class="permission-item2">
    <a-form ref="formRef" :model="formState">
      <div class="permission-item2__header px-8px">
        <template v-if="formState._isEditing">
          <a-form-item
            :label="$t('sys.appDesigner.triggerAbbrName')"
            name="name"
            :rules="[{ required: true, validator: validateName }]"
          >
            <a-input
              size="small"
              v-model:value="formState.name"
              :placeholder="$t('sys.inputText')"
              maxlength="32"
              showCount
            />
          </a-form-item>
          <a-form-item :label="$t('sys.appDesigner.timedTask.entity.desc')" name="desc">
            <a-input
              size="small"
              v-model:value="formState.desc"
              :placeholder="$t('sys.inputText')"
              maxlength="120"
              showCount
            />
          </a-form-item>
        </template>
        <template v-else>
          <div class="flex justify-between">
            <span class="font-bold ell" :title="formState.name"> {{ formState.name }} </span>
            <a-space v-if="!formState._isEditing && !isReadonly">
              <i
                class="iconfont icon-bianji cursor-pointer"
                @click="doEdit"
                :title="$t('sys.edit')"
              ></i>
              <a-popconfirm
                :title="$t('sys.sureToDo')"
                :getPopupContainer="(trigger) => trigger.parentNode"
                placement="topRight"
                @confirm="emit('delete')"
              >
                <i class="iconfont icon-shanchu2 cursor-pointer" :title="$t('sys.delete')"></i>
              </a-popconfirm>
            </a-space>
          </div>
          <div class="ell text-[#8F8F8F]" :title="formState.desc">{{ formState.desc }}</div>
        </template>
      </div>
      <div class="p-8px">
        <template v-if="formState._isEditing">
          <div>
            <a-form-item :label="$t('sys.edhr.permissionMember')">
              <a-radio-group size="small" v-model:value="formState.memberPermissionSelect">
                <a-radio :value="0">{{ $t('sys.edhr.allMembers') }}</a-radio>
                <a-radio :value="1"
                  >{{ $t('sys.customize') }}
                  <i
                    class="iconfont icon-yijicaidan_xitongguanli cursor-pointer"
                    v-if="formState.memberPermissionSelect === 1"
                    @click="selectMemberRange"
                    :title="$t('sys.edhr.setMember')"
                  ></i>
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </div>
          <div>
            <a-form-item :label="$t('sys.appDesigner.fieldRole')">
              <a-radio-group v-model:value="formState.fieldPermissionSelect">
                <a-radio :value="0">{{ $t('sys.edhr.keepFormDesign') }}</a-radio>
                <a-radio :value="1">
                  {{ $t('sys.customize') }}
                  <i
                    class="iconfont icon-yijicaidan_xitongguanli cursor-pointer"
                    v-if="formState.fieldPermissionSelect === 1"
                    @click="openFieldModal"
                    :title="$t('sys.edhr.setField')"
                  ></i>
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </div>
        </template>
        <template v-else>
          <a-form-item :label="$t('sys.edhr.permissionMember')" class="text-[12px]">
            <template v-if="formState.memberPermissionSelect === 0">{{
              $t('sys.edhr.allMembers')
            }}</template>
            <template v-else
              >{{ $t('sys.edhr.customMember') }}
              <!-- <a-button type="link" >查看详情</a-button> -->
              <i
                class="text-14px! primary-gct cursor-pointer align-middle iconfont icon-jichuxinxi"
                :title="$t('sys.viewDetails')"
                @click="viewMemberRange"
              ></i>
            </template>
          </a-form-item>
          <a-form-item :label="$t('sys.appDesigner.fieldRole')" class="text-[12px]">
            <template v-if="formState.fieldPermissionSelect === 0">{{
              $t('sys.edhr.keepFormDesign')
            }}</template>
            <template v-else>
              {{ $t('sys.customize') }}
              <!-- <a-button type="link" class="text-[12px]" @click="openFieldModal">查看详情</a-button> -->
              <i
                class="text-14px! primary-gct cursor-pointer align-middle iconfont icon-jichuxinxi"
                :title="$t('sys.viewDetails')"
                @click="openFieldModal"
              ></i>
            </template>
          </a-form-item>
        </template>
      </div>
      <MemberRangeSelect
        v-show="false"
        ref="memberRangeSelectRef"
        v-model="formState.memberPermission"
      />
      <div class="text-right" v-if="formState._isEditing">
        <i
          class="iconfont icon-xiayibu mr-8px cursor-pointer"
          @click="onCancel"
          :title="$t('sys.cancel')"
        ></i>
        <i
          class="iconfont icon-pad_icon_duigou mr-8px cursor-pointer"
          @click="onSave"
          :title="$t('sys.saveText')"
        ></i>
      </div>
    </a-form>
  </div>
</template>

<script lang="ts" setup name="permission-item2">
  import { computed, h, inject, ref } from 'vue';
  import { FormTmpPermissionConfig } from './type';
  import { now } from './util';
  import MemberRangeSelect from './member-range/member-range-select.vue';
  import { FieldPermissionController } from './field-permission/use-field-permission';
  import { message } from 'ant-design-vue';
  import { cloneDeep } from 'lodash-es';

  const c = inject<FieldPermissionController>('FieldPermissionController')!;

  const props = withDefaults(
    defineProps<{
      value: FormTmpPermissionConfig;
      validateItem?: () => boolean;
      isReadonly?: boolean;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'delete'): void;
    (e: 'copy'): void;
    (e: 'change'): void;
  }>();

  const formRef = ref<any>();
  const formState = computed(() => props.value);
  const memberRangeSelectRef = ref<any>();
  const initFormData = ref();

  const doEdit = () => {
    initFormData.value = cloneDeep(formState.value);
    formState.value._isEditing = true;
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
  const viewMemberRange = () => {
    memberRangeSelectRef.value.preview(true);
  };

  const openFieldModal = async () => {
    const res = await c.openModal({
      fieldConfigs: formState.value.fieldPermission ?? [],
      readonly: !formState.value._isEditing,
    });
    console.log('openFieldModal', res);
    if (res.ok && formState.value._isEditing && res.data) {
      formState.value.fieldPermission = res.data ?? [];
    }
  };
</script>

<style lang="scss" scoped>
  .permission-item2 {
    border: 1px solid #dcdfe6;
    padding: 8px 0;
    border-radius: 4px;
    background-color: #fff;

    &__header {
      border-bottom: 1px solid #dcdfe6;
    }
    :deep(.ant-input) {
      font-size: 12px;
    }
    :deep(.ant-input-show-count-suffix) {
      font-size: 12px;
    }
    :deep(.ant-form-item-explain) {
      font-size: 12px;
      min-height: auto;
    }
    :deep(.ant-form-item-label) {
      font-weight: 600;
    }
  }
</style>
