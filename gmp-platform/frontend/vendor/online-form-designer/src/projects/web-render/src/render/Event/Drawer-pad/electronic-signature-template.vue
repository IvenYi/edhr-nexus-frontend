<template>
  <Popup
    :close-on-click-overlay="false"
    v-model:show="visible"
    position="bottom"
    :teleport="teleport"
    :style="{
      height: '80%',
      width: '100%',
      paddingBottom: '5px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }"
  >
    <div class="popupheaher ks-row-middle">
      <div class="ks-col px16px text-[#212528] font-bold">{{ popupTitle }}</div>
      <div class="w30px text-left text-[#C3C3C3]" @click.stop="cancelFunc">
        <van-icon name="cross"
      /></div>
    </div>
    <div class="electronic-signature-container ks-col overflow-hidden ks-column">
      <div class="ks-col overflow-y-auto px12px pb12px">
        <van-form ref="formRef" label-align="left" input-align="right">
          <div
            class="electronic-signGroup"
            v-for="(signGroup, signGroupIndex) in formState.signGroups"
            :key="signGroup.id"
          >
            <!-- 签名的基础信息 -->
            <!-- <van-row justify="space-around">
              <van-col span="10">签名组: {{ signGroup.signGroupName }}</van-col>
              <van-col span="10">签名数量: {{ signGroup.signNumber }}</van-col>
              <van-col span="10" v-if="signGroup.hasCounterSignGroup"
                >会签组: {{ signGroup.counterSignGroupName }}</van-col
              >
              <van-col span="10" v-if="signGroup.hasCounterSignGroup"
                >会签数量: {{ signGroup.counterSignNumber }}</van-col
              >
            </van-row> -->
            <div class="sign-info-top w100% mt12px">
              <div class="sign-info-top-item">
                <div class="sign-info-top-item-title">签名组</div>
                <div>{{ signGroup.signGroupName }}</div>
              </div>
              <div class="sign-info-top-item">
                <div class="sign-info-top-item-title">签名数量</div>
                <div>{{ signGroup.signNumber }}</div>
              </div>
              <div class="sign-info-top-item">
                <div class="sign-info-top-item-title">会签组</div>
                <div>{{ signGroup.counterSignGroupName }}</div>
              </div>
              <div class="sign-info-top-item">
                <div class="sign-info-top-item-title">会签数量</div>
                <div>{{ signGroup.counterSignNumber || '' }}</div>
              </div>
            </div>
            <!-- 如果是密码签名 -->
            <template v-if="formState.type === 'password'">
              <div
                v-for="(sign, signIndex) in signGroup.signs"
                :key="sign.id"
                class="sign-group py14px px10px mt10px"
              >
                <van-cell-group v-if="!sign.isShowCountersigns" :border="false">
                  <van-field
                    :name="['signGroups', signGroupIndex, 'signs', signIndex, 'account'].join('.')"
                    v-model="sign.account"
                    :label="t('sys.userName')"
                    :placeholder="t('sys.pleaseInputSth', { sth: t('sys.userName') })"
                    :disabled="sign.disabled"
                    required
                    :border="false"
                    :rules="[
                      {
                        required: true,
                        message: t('sys.notEmptySth', {
                          sth: t('sys.userName'),
                        }),
                      },
                    ]"
                  />
                  <van-field
                    :name="['signGroups', signGroupIndex, 'signs', signIndex, 'password'].join('.')"
                    v-model="sign.password"
                    :disabled="sign.disabled"
                    type="password"
                    :label="t('sys.password')"
                    required
                    :border="false"
                    :rules="[
                      {
                        required: true,
                        message: t('sys.notEmptySth', {
                          sth: t('sys.password'),
                        }),
                      },
                      {
                        pattern: /^(?![\u4e00-\u9fa5])\S{6,16}$/,
                        message: t('sys.passwordFormatError'),
                      },
                    ]"
                    :placeholder="
                      t('sys.pleaseInputSth', {
                        sth: t('sys.password'),
                      })
                    "
                  />
                  <van-field
                    name="description"
                    v-model="sign.description"
                    :disabled="sign.disabled"
                    :label="t('sys.notes')"
                    :placeholder="t('sys.inputText')"
                    :border="false"
                    type="text"
                  />
                </van-cell-group>
                <!-- 会签 -->
                <template v-if="sign.isShowCountersigns">
                  <van-cell-group
                    v-for="(countersign, countersignIndex) in sign.countersigns"
                    :key="countersign.id"
                    :border="false"
                    class="sign-group mb10px"
                  >
                    <van-field
                      :disabled="countersign.disabled"
                      :model-value="getReasonText(countersign.countersignReason)"
                      is-link
                      readonly
                      required
                      :border="false"
                      :placeholder="
                        t('sys.pleaseSelectSth', {
                          sth: '会签原因',
                        })
                      "
                      :name="
                        [
                          'signGroups',
                          signGroupIndex,
                          'signs',
                          signIndex,
                          'countersigns',
                          countersignIndex,
                          'countersignReason',
                        ].join('.')
                      "
                      label="会签原因"
                      @click="onShowCoSignPicker(countersign)"
                      :rules="[
                        {
                          required: true,
                          message: t('sys.notEmptySth', {
                            sth: '会签原因',
                          }),
                        },
                      ]"
                    />

                    <van-field
                      :name="
                        [
                          'signGroups',
                          signGroupIndex,
                          'signs',
                          signIndex,
                          'countersigns',
                          countersignIndex,
                          'account',
                        ].join('.')
                      "
                      v-model="countersign.account"
                      :label="t('sys.userName')"
                      :placeholder="t('sys.pleaseInputSth', { sth: t('sys.userName') })"
                      :disabled="countersign.disabled"
                      required
                      :border="false"
                      :rules="[
                        {
                          required: true,
                          message: t('sys.notEmptySth', {
                            sth: t('sys.userName'),
                          }),
                        },
                      ]"
                    />
                    <van-field
                      :name="
                        [
                          'signGroups',
                          signGroupIndex,
                          'signs',
                          signIndex,
                          'countersigns',
                          countersignIndex,
                          'password',
                        ].join('.')
                      "
                      v-model="countersign.password"
                      :disabled="countersign.disabled"
                      type="password"
                      :label="t('sys.password')"
                      required
                      :border="false"
                      :rules="[
                        {
                          required: true,
                          message: t('sys.notEmptySth', {
                            sth: t('sys.password'),
                          }),
                        },
                        {
                          pattern: /^(?![\u4e00-\u9fa5])\S{6,16}$/,
                          message: t('sys.passwordFormatError'),
                        },
                      ]"
                      :placeholder="
                        t('sys.pleaseInputSth', {
                          sth: t('sys.password'),
                        })
                      "
                    />
                    <van-field
                      :name="
                        [
                          'signGroups',
                          signGroupIndex,
                          'signs',
                          signIndex,
                          'countersigns',
                          countersignIndex,
                          'description',
                        ].join('.')
                      "
                      v-model="countersign.description"
                      :disabled="countersign.disabled"
                      :border="false"
                      :label="t('sys.notes')"
                      :placeholder="t('sys.inputText')"
                      type="text"
                    />
                    <van-row justify="end" class="mr20px mb10px">
                      <van-col>
                        <van-button
                          :disabled="countersign.validate"
                          type="primary"
                          size="small"
                          @click.stop="
                            () =>
                              onCountersignVerification(signGroupIndex, signIndex, countersignIndex)
                          "
                          >签名认证</van-button
                        >
                      </van-col>
                    </van-row>
                  </van-cell-group>
                </template>
                <van-row :gutter="20" justify="end" class="mr10px">
                  <van-col v-if="!sign.isShowCountersigns"
                    ><van-button
                      :disabled="sign.validate"
                      type="primary"
                      size="small"
                      @click.stop="() => onSignatureVerification(signGroupIndex, signIndex)"
                      >签名验证</van-button
                    ></van-col
                  >
                  <van-col v-if="sign.isShowCountersigns"
                    ><van-button
                      :disabled="sign.validate"
                      size="small"
                      type="primary"
                      @click.stop="() => onChangeCounterSigns(signGroupIndex, signIndex, false)"
                      >切换签名</van-button
                    ></van-col
                  >
                  <van-col
                    v-if="
                      signGroup.hasCounterSignGroup &&
                      signGroup.counterSignNumber &&
                      !sign.validate &&
                      !sign.isShowCountersigns
                    "
                    ><van-button
                      size="small"
                      type="primary"
                      @click.stop="() => onChangeCounterSigns(signGroupIndex, signIndex, true)"
                      >切换会签</van-button
                    ></van-col
                  >
                </van-row>
              </div>
            </template>
            <template v-else-if="formState.type === 'writing'">
              <div class="electronic-signature-list">
                <div
                  v-for="(sign, signIndex) in signGroup.signs"
                  :key="sign.id"
                  class="sign-group py14px px10px mt10px"
                >
                  <van-cell-group v-if="!sign.isShowCountersigns" :border="false">
                    <van-field
                      :name="
                        ['signGroups', signGroupIndex, 'signs', signIndex, 'description'].join('.')
                      "
                      v-model="sign.description"
                      :disabled="sign.disabled"
                      :border="false"
                      :label="t('sys.notes')"
                      :placeholder="t('sys.inputText')"
                      type="text"
                    />
                    <van-field
                      :name="
                        ['signGroups', signGroupIndex, 'signs', signIndex, 'sign_name_'].join('.')
                      "
                      :border="false"
                      :label="t('sys.model.sign')"
                      :placeholder="t('sys.inputText')"
                      :disabled="sign.validate"
                      type="text"
                    >
                      <template #input>
                        <handwrittenSignature
                          v-model:value="sign.sign_name_"
                          :confirmed="
                            (data) =>
                              handleWriteConfirmed('master', data, { signGroupIndex, signIndex })
                          "
                        />
                      </template>
                    </van-field>
                  </van-cell-group>
                  <template v-if="sign.isShowCountersigns">
                    <van-cell-group
                      v-for="(countersign, countersignIndex) in sign.countersigns"
                      :key="countersign.id"
                      :border="false"
                      class="sign-group mb10px"
                    >
                      <van-field
                        :disabled="countersign.disabled"
                        :model-value="getReasonText(countersign.countersignReason)"
                        is-link
                        readonly
                        :name="
                          [
                            'signGroups',
                            signGroupIndex,
                            'signs',
                            signIndex,
                            'countersigns',
                            countersignIndex,
                            'countersignReason',
                          ].join('.')
                        "
                        label="会签原因"
                        @click="onShowCoSignPicker(countersign)"
                        required
                        :border="false"
                        :rules="[
                          {
                            required: true,
                            message: t('sys.notEmptySth', {
                              sth: '会签原因',
                            }),
                          },
                        ]"
                      />
                      <van-field
                        :name="
                          [
                            'signGroups',
                            signGroupIndex,
                            'signs',
                            signIndex,
                            'countersigns',
                            countersignIndex,
                            'description',
                          ].join('.')
                        "
                        v-model="countersign.description"
                        :disabled="countersign.disabled"
                        :border="false"
                        :label="t('sys.notes')"
                        :placeholder="t('sys.inputText')"
                        type="text"
                      />
                      <van-field
                        :name="
                          [
                            'signGroups',
                            signGroupIndex,
                            'signs',
                            signIndex,
                            'countersigns',
                            countersignIndex,
                            'sign_name_',
                          ].join('.')
                        "
                        :border="false"
                        :label="t('sys.model.sign')"
                        :placeholder="t('sys.inputText')"
                        :disabled="countersign.validate"
                        type="text"
                      >
                        <template #input>
                          <handwrittenSignature
                            v-model:value="countersign.sign_name_"
                            :before-add="
                              () => {
                                return handleWriteBeforeAdd({
                                  signGroupIndex,
                                  signIndex,
                                  countersignIndex,
                                });
                              }
                            "
                            :confirmed="
                              (img) =>
                                handleWriteConfirmed('counter', img, {
                                  signGroupIndex,
                                  signIndex,
                                  countersignIndex,
                                })
                            "
                          />
                        </template>
                      </van-field>
                      <!-- <van-row justify="end">
                        <van-col>
                          <van-button
                            :disabled="countersign.validate"
                            type="primary"
                            size="small"
                            @click.stop="
                              () =>
                                onOpenWacomModal('counter', {
                                  signGroupIndex,
                                  signIndex,
                                  countersignIndex,
                                })
                            "
                            >手写签名</van-button
                          >
                        </van-col>
                      </van-row> -->
                    </van-cell-group>
                  </template>
                  <van-row :gutter="20" justify="end" class="mr10px">
                    <van-col v-if="sign.isShowCountersigns">
                      <van-button
                        :disabled="sign.validate"
                        type="primary"
                        size="small"
                        @click.stop="() => onChangeCounterSigns(signGroupIndex, signIndex, false)"
                        >切换签名</van-button
                      >
                    </van-col>
                    <van-col
                      v-if="
                        signGroup.hasCounterSignGroup &&
                        signGroup.counterSignNumber &&
                        !sign.validate &&
                        !sign.isShowCountersigns
                      "
                    >
                      <van-button
                        type="primary"
                        size="small"
                        @click.stop="() => onChangeCounterSigns(signGroupIndex, signIndex, true)"
                        >切换会签</van-button
                      >
                    </van-col>
                  </van-row>
                </div>
              </div>
            </template>
          </div>
        </van-form>
      </div>
      <!-- 底部安全区 -->
      <div class="py8px px14px bg-[#ffffff]">
        <van-button type="primary" :loading="confirmLoading" block @click="ok">{{
          t('sys.okText')
        }}</van-button>
      </div>
    </div>
  </Popup>
  <Popup
    v-model:show="wacomVisible.isVisible"
    position="bottom"
    :teleport="teleport"
    :style="{
      height: '70%',
      width: '100%',
    }"
    @close="wacomRef.clear()"
  >
    <div class="popupheaher ks-row-middle">
      <div class="w30px"></div>
      <div class="ks-col"> {{ t('sys.pageDesigner.wacom') }}</div>
      <div class="w30px text-left" @click.stop="wacomCancel"> <van-icon name="cross" /></div>
    </div>
    <WacomRender :widget="{ style: {} }" ref="wacomRef" />
    <van-button type="primary" size="small" @click="wacomOk">{{ t('sys.ok') }}</van-button>
  </Popup>
  <van-popup v-model:show="showCoSignPicker" position="bottom" :teleport="teleport">
    <van-picker
      v-model="pickerVal"
      :columns="options"
      @confirm="({ selectedOptions }) => onCoReasonConfirm(selectedOptions)"
      @cancel="closeShowCoSignPicker"
    />
  </van-popup>
</template>

<script setup lang="ts">
  import { debounce } from 'lodash-es';
  import { reactive, ref, computed } from 'vue';
  import { FormInstance, Popup, showNotify } from 'vant';
  import { useI18n } from '@mobile/utils/useI18n';
  import WacomRender from '/@page-designer/components/widgets/mobile/other/wacom/wacom-render.vue';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
  import CryptoJS from 'crypto-js';
  import handwrittenSignature from './component/handwritten-signature.vue';
  import { usePadTeleport } from '@mobile/utils/usePadTeleport';

  const { teleport } = usePadTeleport();

  function sha256(password, key) {
    const hash = CryptoJS.SHA256(password);
    return hash.toString(CryptoJS.enc.Hex);
  }
  interface ISignBasic {
    id: number;
    /** 账号 */
    account?: string;
    /** 密码 */
    password?: string;
    /** 备注 */
    description?: string;
    signGroupId: string;
    cosignGroupId: string;
    disabled: boolean;
    /** 是否验证过 */
    validate: boolean;
    sign_name_?: string;
  }

  interface ICountersigns extends ISignBasic {
    /** 会签原因 */
    countersignReason?: string;
  }

  interface ISign extends ISignBasic {
    /** 是否显示会签 */
    isShowCountersigns: boolean;
    /** 会签组 */
    countersigns?: ICountersigns[];
  }

  interface ISignGroups {
    id: string;
    /** 签名组名称 */
    signGroupName: string;
    /** 签名数量 */
    signNumber: number;
    /**是否有会签组 */
    hasCounterSignGroup: boolean;
    /** 会签组名称 */
    counterSignGroupName: string;
    /** 会签数量 */
    counterSignNumber: number;
    signs: ISign[];
  }
  interface IFormState {
    relationId: string;
    signRequirementId: string;
    otherParams: { [k: string]: any };
    type: string;
    /** 是否复合签名 */
    review: boolean;
    signGroups: ISignGroups[];
  }
  const { t } = useI18n();
  const showCoSignPicker = ref(false);
  const defProps = defineProps<{
    destroyVm: Function;
    successCallback?: Function;
    cancel?: Function;
  }>();
  const confirmLoading = ref(false);
  const formRef = ref<FormInstance>();
  const wacomRef = ref();
  const visible = ref(false);
  const countersign = ref();
  const wacomVisible = reactive<{
    isVisible: boolean;
    type: string;
    indexs: number[];
  }>({
    isVisible: false,
    type: '',
    indexs: [],
  });
  const formState = reactive<IFormState>({
    relationId: '',
    signRequirementId: '',
    type: '',
    review: false,
    otherParams: {},
    signGroups: [],
  });
  const popupTitle = computed(() => {
    return formState.review ? '复核签名' : '电子签名';
  });
  //会签原因
  const options = ref([]);
  const onCoReasonConfirm = (selectedOptions) => {
    countersign.value.countersignReason = selectedOptions[0]?.value;
    showCoSignPicker.value = false;
    console.log('countersign', countersign);
  };

  const getTableData = async () => {
    const res = await postBizServiceByModelKeyByBsKey(
      { bsKey: 'listAll', modelKey: 'em_cosign_reason' },
      {},
    );
    if (res && res.data.length !== 0) {
      options.value = res.data.map((item) => {
        return {
          text: item.name_,
          value: item.id_,
        };
      });
    }
    console.log('会签原因', options.value);
  };

  const requestSignatureVerification = async (info) => {
    const relationKey: string = formState.otherParams?.relationKey || 'relation_id_';
    await postBizServiceByModelKeyByBsKey(
      { bsKey: 'save', modelKey: 'em_sign_history' },
      {
        [relationKey]: formState.relationId,
        review_: formState.review,
        type_: 'producing',
        ...info,
      },
    );
    showNotify({
      type: 'success',
      message: formState.type === 'password' ? '签名验证成功' : '签名保存成功',
    });
    return true;
  };
  async function open(params) {
    formState.signGroups = [];
    console.log('电子签名params', params);
    const { relationId, signRequirementId, type, review, configs, ...otherParams } = params || {};
    const { data, dict } = configs || {};
    if (!(relationId && signRequirementId && data.length !== 0)) {
      return showNotify({
        type: 'warning',
        message: '没有获取到电子签名配置',
      });
    }
    visible.value = true;
    formState.relationId = relationId;

    formState.signRequirementId = signRequirementId;

    formState.type = type;

    formState.review = review;

    formState.otherParams = { ...otherParams };

    data.forEach((config, index) => {
      formState.signGroups.push({
        id: config.id_,
        signGroupName: dict.sign_group_id_[config.sign_group_id_],
        signNumber: Number(config.sign_qty_ || 0),
        hasCounterSignGroup: config.cosign_group_id_ ? true : false,
        counterSignGroupName:
          config.cosign_group_id_ && dict.cosign_group_id_[config.cosign_group_id_],
        counterSignNumber: Number(config.cosign_qty_ || 0),
        signs: [],
      });

      for (let i = 0; i < formState.signGroups[index].signNumber; i++) {
        formState.signGroups[index].signs.push({
          id: Date.now(),
          account: undefined,
          password: undefined,
          description: undefined,
          disabled: false,
          validate: false,
          isShowCountersigns: false,
          signGroupId: config.sign_group_id_,
          cosignGroupId: config.cosign_group_id_,
          countersigns: [],
        });

        for (let j = 0; j < formState.signGroups[index].counterSignNumber; j++) {
          formState.signGroups[index].signs[i].countersigns!.push({
            id: Date.now(),
            account: undefined,
            password: undefined,
            description: undefined,
            disabled: false,
            validate: false,
            countersignReason: undefined,
            signGroupId: config.sign_group_id_,
            cosignGroupId: config.cosign_group_id_,
          });
        }
      }
    });
    getTableData();
    console.log('formState', formState);
  }

  /** 显示会签组列表 */
  const onChangeCounterSigns = (signGroupIndex: number, signIndex: number, bool: boolean) => {
    // 显示隐藏会签组列表
    formState.signGroups[signGroupIndex].signs[signIndex].isShowCountersigns = bool;
    // 把签名行设置是否置灰
    formState.signGroups[signGroupIndex].signs[signIndex].disabled = bool;

    if (bool) {
      formState.signGroups[signGroupIndex].signs[signIndex].account = undefined;
      formState.signGroups[signGroupIndex].signs[signIndex].password = undefined;
      formState.signGroups[signGroupIndex].signs[signIndex].description = undefined;
      formRef.value?.resetValidation([
        ['signGroups', signGroupIndex, 'signs', signIndex, 'account'].join('.'),
        ['signGroups', signGroupIndex, 'signs', signIndex, 'password'].join('.'),
      ]);
    } else {
      formState.signGroups[signGroupIndex].signs[signIndex].countersigns?.forEach(
        (countersign, index) => {
          countersign.countersignReason = undefined;
          countersign.account = undefined;
          countersign.password = undefined;
          countersign.description = undefined;
          formRef.value?.resetValidation([
            [
              'signGroups',
              signGroupIndex,
              'signs',
              signIndex,
              'countersigns',
              index,
              'countersignReason',
            ].join('.'),
            [
              'signGroups',
              signGroupIndex,
              'signs',
              signIndex,
              'countersigns',
              index,
              'account',
            ].join('.'),
            [
              'signGroups',
              signGroupIndex,
              'signs',
              signIndex,
              'countersigns',
              index,
              'password',
            ].join('.'),
          ]);
        },
      );
    }
  };
  /** 签名行签名验证 */
  const onSignatureVerification = async (signGroupIndex, signIndex) => {
    const info = formState.signGroups[signGroupIndex].signs[signIndex] || {};
    formRef.value
      ?.validate([
        ['signGroups', signGroupIndex, 'signs', signIndex, 'account'].join('.'),
        ['signGroups', signGroupIndex, 'signs', signIndex, 'password'].join('.'),
      ])
      .then(async () => {
        const params: any = {
          sign_requirement_config_id_: formState.signGroups[signGroupIndex].id,
          sign_group_id_: info.signGroupId,
          sign_account_: info.account,
          description_: info.description,
        };
        if (info.password) {
          const key = Math.random().toString(16).substring(2, 8);
          Object.assign(params, {
            password_: sha256(info.password, key),
          });
        }

        const res = await requestSignatureVerification(params);
        if (res) {
          formState.signGroups[signGroupIndex].signs[signIndex].disabled = true;
          formState.signGroups[signGroupIndex].signs[signIndex].validate = true;
        }
      });
  };
  /** 会签行签名验证 */
  const onCountersignVerification = async (signGroupIndex, signIndex, countersignIndex) => {
    const info =
      formState.signGroups[signGroupIndex].signs[signIndex].countersigns![countersignIndex] || {};
    formRef.value
      ?.validate([
        [
          'signGroups',
          signGroupIndex,
          'signs',
          signIndex,
          'countersigns',
          countersignIndex,
          'countersignReason',
        ].join('.'),
        [
          'signGroups',
          signGroupIndex,
          'signs',
          signIndex,
          'countersigns',
          countersignIndex,
          'account',
        ].join('.'),
        [
          'signGroups',
          signGroupIndex,
          'signs',
          signIndex,
          'countersigns',
          countersignIndex,
          'password',
        ].join('.'),
      ])
      .then(async () => {
        const params = {
          sign_requirement_config_id_: formState.signGroups[signGroupIndex].id,
          cosign_group_id_: info.cosignGroupId,
          cosign_account_: info.account,
          description_: info.description,
          cosign_reason_id_: info.countersignReason,
        };

        if (info.password) {
          const key = Math.random().toString(16).substring(2, 8);
          Object.assign(params, {
            password_: sha256(info.password, key),
          });
        }

        await requestSignatureVerification(params);

        formState.signGroups[signGroupIndex].signs[signIndex].validate = true;
        formState.signGroups[signGroupIndex].signs[signIndex].countersigns![
          countersignIndex
        ].disabled = true;
        formState.signGroups[signGroupIndex].signs[signIndex].countersigns![
          countersignIndex
        ].validate = true;
      });
  };

  const handleWriteBeforeAdd = async ({ signGroupIndex, signIndex, countersignIndex }) => {
    await formRef.value?.validate([
      [
        'signGroups',
        signGroupIndex,
        'signs',
        signIndex,
        'countersigns',
        countersignIndex,
        'countersignReason',
      ].join('.'),
    ]);
  };

  const handleWriteConfirmed = async (
    type,
    data,
    {
      signGroupIndex,
      signIndex,
      countersignIndex,
    }: { signGroupIndex: number; signIndex: number; countersignIndex?: number },
  ) => {
    if (type === 'master') {
      const info = formState.signGroups[signGroupIndex].signs[signIndex] || {};
      const params: any = {
        sign_requirement_config_id_: formState.signGroups[signGroupIndex].id,
        sign_group_id_: info.signGroupId,
        description_: info.description,
        sign_name_: data,
      };

      const res = await requestSignatureVerification(params);
      if (res) {
        formState.signGroups[signGroupIndex].signs[signIndex].disabled = true;
        formState.signGroups[signGroupIndex].signs[signIndex].validate = true;
        return true;
      } else return false;
    } else if (type === 'counter') {
      const info =
        formState.signGroups[signGroupIndex].signs[signIndex].countersigns![countersignIndex!] ||
        {};
      const params = {
        sign_requirement_config_id_: formState.signGroups[signGroupIndex].id,
        cosign_group_id_: info.cosignGroupId,
        description_: info.description,
        cosign_reason_id_: info.countersignReason,
        cosign_name_: data,
      };

      const res = await requestSignatureVerification(params);
      if (res) {
        formState.signGroups[signGroupIndex].signs[signIndex].validate = true;
        formState.signGroups[signGroupIndex].signs[signIndex].countersigns![
          countersignIndex!
        ].disabled = true;
        formState.signGroups[signGroupIndex].signs[signIndex].countersigns![
          countersignIndex!
        ].validate = true;
        return true;
      } else return false;
    }
  };
  /** 打开手写版 */
  const onOpenWacomModal = async (type, { signGroupIndex, signIndex, countersignIndex }) => {
    if (type === 'master') {
      wacomVisible.isVisible = true;
      wacomVisible.type = type;
      wacomVisible.indexs = [signGroupIndex, signIndex];
    } else if (type === 'counter') {
      formRef.value
        ?.validate([
          [
            'signGroups',
            signGroupIndex,
            'signs',
            signIndex,
            'countersigns',
            countersignIndex,
            'countersignReason',
          ].join('.'),
        ])
        .then(async () => {
          wacomVisible.isVisible = true;
          wacomVisible.type = type;
          wacomVisible.indexs = [signGroupIndex, signIndex, countersignIndex];
        });
    }
  };
  function wacomCancel() {
    wacomRef.value.clear();
    wacomVisible.isVisible = false;
    wacomVisible.type = '';
    wacomVisible.indexs = [];
  }

  async function wacomOk() {
    if (wacomVisible.type === 'master') {
      const [_signGroupIndex, _signIndex] = wacomVisible.indexs;

      const info = formState.signGroups[_signGroupIndex].signs[_signIndex] || {};

      const params: any = {
        sign_requirement_config_id_: formState.signGroups[_signGroupIndex].id,
        sign_group_id_: info.signGroupId,
        description_: info.description,
        sign_name_: wacomRef.value.getValue(),
      };

      const res = await requestSignatureVerification(params);
      if (res) {
        formState.signGroups[_signGroupIndex].signs[_signIndex].disabled = true;
        formState.signGroups[_signGroupIndex].signs[_signIndex].validate = true;
      }
    } else if (wacomVisible.type === 'counter') {
      const [_signGroupIndex, _signIndex, _countersignIndex] = wacomVisible.indexs;

      const info =
        formState.signGroups[_signGroupIndex].signs[_signIndex].countersigns![_countersignIndex] ||
        {};

      const params = {
        sign_requirement_config_id_: formState.signGroups[_signGroupIndex].id,
        cosign_group_id_: info.cosignGroupId,
        description_: info.description,
        cosign_reason_id_: info.countersignReason,
        cosign_name_: wacomRef.value.getValue(),
      };

      const res = await requestSignatureVerification(params);

      if (res) {
        formState.signGroups[_signGroupIndex].signs[_signIndex].validate = true;
        formState.signGroups[_signGroupIndex].signs[_signIndex].countersigns![
          _countersignIndex
        ].disabled = true;
        formState.signGroups[_signGroupIndex].signs[_signIndex].countersigns![
          _countersignIndex
        ].validate = true;
      }
    }

    wacomCancel();
  }

  const onShowCoSignPicker = (cosign) => {
    showCoSignPicker.value = true;
    countersign.value = cosign;
  };
  const closeShowCoSignPicker = () => {
    showCoSignPicker.value = false;
    countersign.value = undefined;
  };
  const pickerVal = computed(() => {
    return countersign.value && [countersign.value.countersignReason];
  });
  const getReasonText = (val) => {
    return options.value.find((d: any) => {
      return d.value === val;
    })?.text;
  };
  async function cancelFunc() {
    defProps.cancel && defProps.cancel();
    await close();
  }
  async function close() {
    visible.value = false;
    defProps.destroyVm && (await defProps.destroyVm());
  }

  async function ok() {
    try {
      confirmLoading.value = true;
      defProps.successCallback &&
        (await defProps.successCallback({
          relationId: formState.relationId,
          signRequirementId: formState.signRequirementId,
          review: formState.review,
          ...formState.otherParams,
        }));
    } catch (err) {
      console.log(err, 'error at sign confirm');
    }
    confirmLoading.value = false;
  }

  async function validateForm() {
    try {
      const promiseList: any[] = [];
      formState.signGroups.forEach((signGroup, signGroupIndex) => {
        (signGroup?.signs ?? []).forEach((sign, signIndex) => {
          if (!sign.isShowCountersigns && !sign.validate) {
            promiseList.push(
              formRef.value?.validate([
                ['signGroups', signGroupIndex, 'signs', signIndex, 'account'],
                ['signGroups', signGroupIndex, 'signs', signIndex, 'password'],
              ]),
            );
          }
          (sign?.countersigns ?? [])?.forEach((countersign, countersignIndex) => {
            if (sign.isShowCountersigns) {
              promiseList.push(
                formRef.value?.validate([
                  [
                    'signGroups',
                    signGroupIndex,
                    'signs',
                    signIndex,
                    'countersigns',
                    countersignIndex,
                    'countersignReason',
                  ],
                  [
                    'signGroups',
                    signGroupIndex,
                    'signs',
                    signIndex,
                    'countersigns',
                    countersignIndex,
                    'account',
                  ],
                  [
                    'signGroups',
                    signGroupIndex,
                    'signs',
                    signIndex,
                    'countersigns',
                    countersignIndex,
                    'password',
                  ],
                ]),
              );
            }
          });
        });
      });
      await Promise.all(promiseList);
    } catch (error) {
      console.log(error, 'validate:promiseList');
      if (!error?.errorFields?.length) return;

      return Promise.reject(error);
    }
  }
  defineExpose({ open, close, validateForm });
</script>
<style scoped lang="less">
  .electronic-signature-container {
    // .electronic-signGroup {
    //   margin-bottom: 40px;
    // }
  }

  :deep(.van-cell) {
    padding: 10px;
    background-color: transparent;
  }

  .popupheaher {
    width: 100%;
    border-bottom: 1px solid var(--van-cell-border-color);
    font-size: 16px;
    font-weight: bold;
    line-height: 50px;
  }

  .sign-group {
    border: 1px solid #eee;
    border-radius: 6px;
  }

  .sign-info-top {
    display: flex;
    padding: 8px;
    column-gap: 8px;
    border-radius: 6px;
    background-color: var(--van-primary-color-1);

    &-item {
      flex: 1;
      font-size: 12px;
      text-align: center;

      &-title {
        margin-bottom: 4px;
        color: var(--van-primary-color);
      }
    }
  }

  :deep(.van-cell__right-icon) {
    line-height: 24px;
  }
</style>
