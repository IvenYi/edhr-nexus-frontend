/*
 * @Author: wangming
 * @Date: 2022-06-10 11:35:10
 * @LastEditors: wangming
 * @LastEditTime: 2022-06-20 17:13:30
 * @FilePath: /vant-app/src/stores/session.ts
 * @Description:
 */
import { useStorage } from '@vueuse/core';

export const serverAddress = useStorage('APP_SERVER', '');
export const getAid = useStorage('APP_AID', '');
export const getASuiteKey = useStorage('APP_SUITEKEY', '');
export const getAppName = useStorage('APP_NAME', '');
export const getWorkBenchActive = useStorage('APP_WB_ACTIVE', '');
