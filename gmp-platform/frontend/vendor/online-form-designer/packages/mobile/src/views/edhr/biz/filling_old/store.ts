import { useLocalStorage } from '@vueuse/core';
import { UserData } from '@mobile/stores/loginHooks';

export interface IEDHRItem {
  id: string;
  materialNo: string;
  materialStatus: string;
}

export interface IFormItem {
  id: string;
  serialNo: string;
}

export type IReleaseItem = IEDHRItem;

const EDHR_KEY = `History.eDHR.${UserData.value.userId}`;
const FORM_KEY = `History.form.${UserData.value.userId}`;
const RELEASE_KEY = `History.release.${UserData.value.userId}`;

const eDHRList = useLocalStorage<IEDHRItem[]>(EDHR_KEY, []);
const formList = useLocalStorage<IFormItem[]>(FORM_KEY, []);
const releaseList = useLocalStorage<IEDHRItem[]>(RELEASE_KEY, []);

const eDHRDel = (index: number) => {
  eDHRList.value.splice(index, 1);
};
const eDHRGo = (data: IEDHRItem) => {
  const dataIndex = eDHRList.value.findIndex((item) => item.id === data.id);
  if (dataIndex === -1) {
    eDHRList.value.unshift(data);
  } else {
    eDHRList.value.splice(dataIndex, 1);
    eDHRList.value.unshift(data);
  }
};

const formDel = (index: number) => {
  formList.value.splice(index, 1);
};
const formGo = (data: IFormItem) => {
  const dataIndex = formList.value.findIndex((item) => item.id === data.id);
  if (dataIndex === -1) {
    formList.value.unshift(data);
  } else {
    formList.value.splice(dataIndex, 1);
    formList.value.unshift(data);
  }
};

const releaseDel = (index: number) => {
  releaseList.value.splice(index, 1);
};
const releaseGo = (data: IReleaseItem) => {
  const dataIndex = releaseList.value.findIndex((item) => item.id === data.id);
  if (dataIndex === -1) {
    releaseList.value.unshift(data);
  } else {
    releaseList.value.splice(dataIndex, 1);
    releaseList.value.unshift(data);
  }
};

export function useStore() {
  return {
    eDHRList,
    eDHRDel,
    eDHRGo,
    formList,
    formDel,
    formGo,
    releaseList,
    releaseDel,
    releaseGo,
  };
}
