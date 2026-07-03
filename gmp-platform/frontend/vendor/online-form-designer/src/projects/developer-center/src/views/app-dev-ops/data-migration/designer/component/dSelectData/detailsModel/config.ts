import { SysPageEnum } from '../../../const';
import { getPrintDesignerRdoPageList } from '/@/apis/gct-apaas/PrintDesignerController';
import { ControlStatusEnum } from '/@app-designer/views/online-form/constants';
import { getInterfaceApi } from '@gct/runtime';

export { SysPageEnum };
export const modelTable = {
  [SysPageEnum.LABEL_PRINT]: {
    async http(body, id, config) {
      const data = await getPrintDesignerRdoPageList(
        {
          categoryId: id,
          moduleType: 'label_module',
          ...body,
        },
        config,
      );
      return data;
    },
    tableColumns: [
      {
        name: '标签名称',
        key: 'name',
        customRender({ record }) {
          return record.version || record.name;
        },
      },
      {
        name: '描述',
        key: 'description',
      },
      {
        name: '修改人',
        key: 'modifyUserName',
        ellipsis: true,
      },
      {
        name: '修改时间',
        key: 'modifyTime',
      },
    ],
  },
  [SysPageEnum.FORM_DESIGN]: {
    async http(body, id, config) {
      const data = await getInterfaceApi.getTmplsList(
        {
          categoryId: id,
          moduleType: 'online_form_module',
          ...body,
        },
        config,
      );
      return data;
    },
    tableColumns: [
      {
        name: '在线表单名称',
        key: 'name',
        customRender({ record }) {
          return record.version || record.name;
        },
      },
      {
        name: '编号',
        key: 'code',
      },
      {
        name: '表单模式',
        key: 'edition',
        customRender({ record }) {
          const controlStatus = record.edition;
          if (!controlStatus) return;
          return $t(`sys.onlineForm.formEditionEnum.${controlStatus}`);
        },
      },
      {
        name: '表单类型',
        key: 'formType',
        customRender({ record }) {
          const formType = record.formType;
          if (!formType) return;
          return $t(`sys.onlineForm.formTypeEnum.${formType}`);
        },
      },
      {
        name: '修改人',
        key: 'modifyUserName',
        ellipsis: true,
      },
      {
        name: '修改时间',
        key: 'modifyTime',
        width: 100,
      },
    ],
  },
  [SysPageEnum.EDHR_DESIGN]: {
    async http(body, id, config) {
      const data = await getInterfaceApi.getTmplsList(
        {
          categoryId: id,
          moduleType: 'edhr_module',
          ...body,
        },
        config,
      );
      return data;
    },
    tableColumns: [
      {
        name: 'edhr名称',
        key: 'name',
        customRender({ record }) {
          return record.version || record.name;
        },
      },
      {
        name: '编号',
        key: 'code',
      },
      {
        name: '描述',
        key: 'description',
      },
      {
        name: '修改人',
        key: 'modifyUserName',
        ellipsis: true,
      },
      {
        name: '修改时间',
        key: 'modifyTime',
      },
    ],
  },
  [SysPageEnum.DOC_PRINT]: {
    async http(body, id, config) {
      const data = await getPrintDesignerRdoPageList(
        {
          categoryId: id,
          moduleType: 'document_module',
          ...body,
        },
        config,
      );
      return data;
    },
    tableColumns: [
      {
        name: '单据名称',
        key: 'name',
        customRender({ record }) {
          return record.version || record.name;
        },
      },
      {
        name: '描述',
        key: 'description',
      },
      {
        name: '修改人',
        key: 'modifyUserName',
        ellipsis: true,
      },
      {
        name: '修改时间',
        key: 'modifyTime',
        width: 120,
      },
    ],
  },
};
