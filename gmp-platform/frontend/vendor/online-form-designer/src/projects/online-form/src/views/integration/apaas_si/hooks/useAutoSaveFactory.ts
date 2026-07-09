import { onBeforeMount, onBeforeUnmount, ref, h } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { useNocodeEmitter } from '@gct/nocode-base';
import { useAsyncLooper } from '/@/hooks/web/useAsyncLooper';
import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';

export function useAutoSaveFactory(startAutoSave, autoSaveCallback) {
  // 自动保存队列
  const autoSaveQueue = ref<string[]>([]);
  const initDataJson = ref<string>();
  const formPageData = ref<any>();

  const { emitter, EmitterEnum } = useNocodeEmitter();
  const { businessSetting } = useBusinessSetting();

  // 轮询接口
  const { delayedStartLoop, stopLoop } = useAsyncLooper(handleAutoSave, {
    // 自动保存频率单位更改为分钟，默认10分钟自动保存一次
    time: (businessSetting.formAutosaveFrequency || 1) * 60 * 1000,
    immediate: false,
  });

  onBeforeMount(() => {
    if (startAutoSave && businessSetting.enableAutosaveForm) {
      emitter.on(EmitterEnum.__on_looper_auto_save, async (callback) => {
        autoSaveQueue.value.push('_');
        if (autoSaveQueue.value.length > 5) {
          autoSaveQueue.value.shift(); // 删除队列最早的元素
        }
        delayedStartLoop();
      });
    } else {
      // 浏览器关闭时，需要判断是否有数据改变
      emitter.on(EmitterEnum.__on_looper_auto_save, async (callback) => {
        autoSaveQueue.value.push('*');
        if (autoSaveQueue.value.length > 5) {
          autoSaveQueue.value.shift(); // 删除队列最早的元素
        }
      });
    }
  });

  onBeforeUnmount(() => {
    clearLooperData();
    emitter.off(EmitterEnum.__on_looper_auto_save);
  });

  /**
   * 存储初始化后的数据，用来对比数据变化情况
   */
  function setInitData(data) {
    if (!data) return;
    initDataJson.value = JSON.stringify(data);
    formPageData.value = data;
    console.log(
      'set---now------init',
      data,
      initDataJson.value ? JSON.parse(initDataJson.value) : '',
    );
  }

  /**
   * 将一些翻译用的字段（以_lb_结尾）过滤掉，不需要对比
   */
  function filterNotNeedKeys(form = {}) {
    if (!form) return;
    // 如果是数组，则递归处理每个元素
    if (Array.isArray(form)) {
      return form.map((item) => filterNotNeedKeys(item));
    }
    // 如果是对象，则过滤掉以_lb_结尾的键，并递归处理值
    if (typeof form === 'object') {
      return Object.entries(form).reduce((obj, [k, v]) => {
        if (!k.endsWith('_lb_')) {
          obj[k] = filterNotNeedKeys(v); // 递归处理值
        }
        return obj;
      }, {});
    }

    // 如果是基本类型，直接返回
    return form;
  }

  /**
   * @param flag 是否清除队列信息
   */
  function clearLooperData(flag = true) {
    stopLoop();
    if (flag) {
      autoSaveQueue.value = [];
      // initDataJson.value = formPageData.value ? JSON.stringify(formPageData.value) : '';
    }
  }

  async function handleAutoSave(key: string) {
    console.log('0506 自动保存成功!', key);
    autoSaveQueue.value.push(key);
    const res = await judgeFormDataHasChange(() => {}, false, false);
    if (res) {
      await autoSaveCallback(true);
      clearLooperData(false);
    }
  }

  /** 判断数据是否改变过 */
  async function judgeFormDataHasChange(callback, clearLoop = true, needConfirm = true) {
    console.log('0506 判断数据是否改变过 autoSaveQueue', formPageData.value, initDataJson.value);
    const lastQueueKey = autoSaveQueue.value.at(-1);
    console.log('0506 lastQueueKey', lastQueueKey);
    // 先暂停定时器
    clearLooperData(clearLoop);
    const formDataJson = formPageData.value
      ? JSON.stringify(filterNotNeedKeys(formPageData.value))
      : '';
    const initJson = initDataJson.value
      ? JSON.stringify(filterNotNeedKeys(JSON.parse(initDataJson.value)))
      : '';
    if (lastQueueKey && formDataJson !== initJson) {
      if (!needConfirm || lastQueueKey === '*') return true;
      const cfg = Modal.confirm({
        title: $t('sys.hasNoSavedDataTitle'),
        content: h('div', { class: 'unsaved-modal' }, [
          h('span', $t('sys.hasNoSavedDataTips')),
          h(
            'div',
            {
              class: 'continue-edit',
              style: {
                position: 'absolute',
                bottom: '16px',
              },
            },
            [
              h(
                'button',
                {
                  type: 'button',
                  style: {
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    border: '0',
                    color: 'var(--ant-primary-color)',
                    fontSize: '14px',
                  },
                  onClick: () => {
                    cfg.destroy();
                    // 重启定时器
                    emitter.emit(EmitterEnum.__on_looper_auto_save, { changed: true });
                  },
                },
                $t('sys.app.continueEdit'),
              ),
            ],
          ),
        ]),
        okText: $t('sys.designView.saveConfirm.confirm'),
        cancelText: $t('sys.designView.saveConfirm.cancel'),
        onOk: async () => {
          // 调用保存
          await autoSaveCallback(false);
          callback();
        },
        onCancel: async () => {
          cfg.destroy();
          callback();
        },
      });
      return true;
    }
    // // 说明还没触发自动保存就切换了
    // if (lastQueueKey && lastQueueKey === '_') {
    //   if (!needConfirm) return true;
    //   const cfg = Modal.confirm({
    //     title: $t('sys.hasNoSavedDataTitle'),
    //     content: h('div', { class: 'unsaved-modal' }, [
    //       h('span', $t('sys.hasNoSavedDataTips')),
    //       h(
    //         'div',
    //         {
    //           class: 'continue-edit',
    //           style: {
    //             position: 'absolute',
    //             bottom: '16px',
    //           },
    //         },
    //         [
    //           h(
    //             'button',
    //             {
    //               type: 'button',
    //               style: {
    //                 cursor: 'pointer',
    //                 backgroundColor: 'transparent',
    //                 border: '0',
    //                 color: 'var(--ant-primary-color)',
    //                 fontSize: '14px',
    //               },
    //               onClick: () => {
    //                 cfg.destroy();
    //                 // 重启定时器
    //                 emitter.emit(EmitterEnum.__on_looper_auto_save, { changed: true });
    //               },
    //             },
    //             $t('sys.app.continueEdit'),
    //           ),
    //         ],
    //       ),
    //     ]),
    //     okText: $t('sys.designView.saveConfirm.confirm'),
    //     cancelText: $t('sys.designView.saveConfirm.cancel'),
    //     onOk: async () => {
    //       // 调用保存
    //       await autoSaveCallback(false);
    //       callback();
    //     },
    //     onCancel: async () => {
    //       cfg.destroy();
    //       callback();
    //     },
    //   });

    //   return;
    // }
    // if (lastQueueKey && lastQueueKey === '*') {
    //   return true;
    // }

    callback();
  }

  return {
    /** 判断数据是否改变过 */
    judgeFormDataHasChange,
    clearLooperData,
    setInitData,
  };
}

// import { postOnlineFormBaseAutoSave } from '/@/apis/gct-apaas/OnlineFormBaseController';
// import { postOnlineFormProcessAutoSave } from '/@/apis/gct-apaas/OnlineFormProcessController';
// import { postOnlineFormAutoSaveInterrupt } from '/@/apis/gct-apaas/OnlineFormAutoSaveController';

// /** 自动保存提交的数据 */
// async function getAutoFormData() {
//   const uniqueId = basicIns.value?.uniqueId ?? '';
//   const formData = await getFormState(uniqueId);
//   if (formIns.value?.formType === FormTypeEnum.PROCESS) {
//     const processInfo = formIns.value?.ofProcessOperations ?? {};
//     return {
//       formType: FormTypeEnum.PROCESS,
//       data: formData,
//       ofInstId: props.selfId,
//       taskId: processInfo.taskId,
//       buttonConfig: JSON.stringify({
//         title: '保存',
//       }),
//     };
//   } else if (formIns.value?.formType === FormTypeEnum.BASE) {
//     const newFormData = Object.entries(formData).reduce((acc, [key, value]) => {
//       if (Array.isArray(value)) {
//         acc[key] = { data: value };
//       } else {
//         acc[key] = value;
//       }
//       return acc;
//     }, {});

//     return {
//       formType: FormTypeEnum.BASE,
//       onlineFormInstanceId: props.selfId,
//       content: JSON.stringify(newFormData),
//     };
//   }
// }

// async function getCurrentFormData() {
//   if (
//     operatorRef.value?.getCurrentFormData &&
//     typeof operatorRef.value.getCurrentFormData === 'function'
//   ) {
//     return await operatorRef.value.getCurrentFormData();
//   }
// }

// async function requestAutoSave(result) {
//   if (result) {
//     const { formType, ...otherParams } = result;
//     if (formType === FormTypeEnum.PROCESS) {
//       await postOnlineFormProcessAutoSave(otherParams);
//     } else if (formType === FormTypeEnum.BASE) {
//       await postOnlineFormBaseAutoSave(otherParams);
//     }
//   }
// }

// async function getAutoFormDataInfo() {
//   if (
//     operatorRef.value?.getAutoFormData &&
//     typeof operatorRef.value.getAutoFormData === 'function'
//   ) {
//     return await operatorRef.value.getAutoFormData();
//   }
// }

// /**
//  * 是否中断自动保存
//  * execute 是否执行保存 0/1
//  */
// async function requestInterrupt(execute) {
//   if (selectSelfInfo.value && selectSelfInfo.value.id) {
//     postOnlineFormAutoSaveInterrupt(
//       {
//         ofInstId: selectSelfInfo.value?.id,
//         execute,
//       },
//       { joinParamsToUrl: true },
//     );
//   }
// }

// async function handleAutoSave(key: string) {
//   console.log('0506 ', key);
//   console.log('0506 自动保存成功!');
//   const result = await getAutoFormDataInfo();
//   if (result) {
//     autoSaveQueue.value.push([key, result]);
//     if (autoSaveQueue.value.length > 5) {
//       autoSaveQueue.value.shift(); // 删除队列最早的元素
//     }
//     console.log('0506 autoSaveQueue', autoSaveQueue.value);
//     await requestAutoSave(result);
//     message.success('数据防丢已触发');
//   }
// }

// async function clearLooperData() {
//   stopLoop();
//   autoSaveQueue.value = [];
// }

// /** 判断数据是否改变过 */
// async function judgeFormDataHasChange(callback) {
//   console.log('0506 判断数据是否改变过 autoSaveQueue', autoSaveQueue.value);
//   const lastQueueData = autoSaveQueue.value.at(-1);
//   console.log('0506 lastQueueData', lastQueueData);

//   if (lastQueueData && Array.isArray(lastQueueData) && lastQueueData.length !== 0) {
//     const [key, data] = lastQueueData;
//     if (key === '_') {
//       // 说明还没触发自动保存就切换了
//       const cfg = Modal.confirm({
//         title: t('sys.hasNoSavedDataTitle'),
//         content: h('div', { class: 'unsaved-modal' }, [
//           h('span', t('sys.hasNoSavedDataTips')),
//           h('div', { class: 'continue-edit' }, [
//             h(
//               'button',
//               {
//                 type: 'button',
//                 onClick: () => cfg.destroy(),
//               },
//               $t('sys.app.continueEdit'),
//             ),
//           ]),
//         ]),
//         okText: $t('sys.designView.saveConfirm.confirm'),
//         cancelText: $t('sys.designView.saveConfirm.cancel'),
//         onOk: async () => {
//           // 调用自动保存然后在走立即执行
//           await requestAutoSave(data);
//           await requestInterrupt(1);
//           clearLooperData();
//           callback();
//         },
//         onCancel: async () => {
//           cfg.destroy();
//           // 不保存的话需要获取最近一次自动保存的值然后调用自动保存然后在走立即执行
//           // const lastAutoSaveData = autoSaveQueue.value.findLast(item => item !== '_');
//           // if (lastAutoSaveData && Array.isArray(lastAutoSaveData) && lastAutoSaveData.length !== 0) {
//           //   await requestAutoSave(lastAutoSaveData[1]);
//           //   await requestInterrupt(1);
//           // }
//           await requestInterrupt(0);
//           clearLooperData();
//           callback();
//         },
//       });

//       return;
//     }

//     // 已经触发了自动保存但直接切换了 需要先调用自动保存然后在走立即执行
//     await requestAutoSave(data);
//     await requestInterrupt(1);
//   }

//   clearLooperData();
//   callback();
// }
