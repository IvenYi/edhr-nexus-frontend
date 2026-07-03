import { operateSysEnums } from '/@page-designer/enum';
import { provide } from 'vue';
import { showToast } from 'vant';
import { cloneDeep, merge, orderBy, isEmpty } from 'lodash-es';
import { EntityModelTypeEnum, openWindowEnums, ExamineAndApproveStateEnum } from '@gct/runtime';
// import { useProcessPage } from '/@/hooks/web/useProcessPage';
// import { useAppInfoStore } from '/@/store/modules/app-info';
// import {
//   getMedProModelMetaHasDataAssociation,
//   getMedProModelMetaGetSysConfig,
// } from '/@/apis/gct-apaas/MedProCommonController';

export const useTableEvents = ({
  getDataSource,
  datasource,
  Event,
  deleteByChecked,
  doNotSubmit,
  deleteDataByids,
  updateChildren,
  getParameters,
  checkboxRow,
  searchField,
  parentField,
  parentData,
  model,
  modeldata,
  subTableWidget,
}) => {
  /**注入的方法给按钮组件使用使用 */
  provide('tableEvent', {
    async delete(row) {
      const { _X_ROW_KEY, id_ } = row;
      const index = datasource.value.findIndex((i) => i._X_ROW_KEY === _X_ROW_KEY);

      // 临时方案，待优化。删除时，如果存在关联数据，则提示用户
      // const appInfoStore = useAppInfoStore();
      // if (appInfoStore.appInfo.suiteKey === 'MEDPRO') {
      // const NOT_DELETE_ENABLED_KEY = 'not.delete.enabled';
      // const REMOVE_TWICE_ALERT_ENABLED_KEY = 'remove.twice.alert.enabled';
      // const notDelete = await getMedProModelMetaGetSysConfig({ key: NOT_DELETE_ENABLED_KEY });
      // const confirmDelete = await getMedProModelMetaGetSysConfig({
      //   key: REMOVE_TWICE_ALERT_ENABLED_KEY,
      // });
      // // 如果任一配置启用，则检查数据关联
      // if (notDelete || confirmDelete) {
      //   const dataAssociationRes = await getMedProModelMetaHasDataAssociation({
      //     modelKey: model,
      //     id: id_,
      //   });
      //   // 只有数据被引用时才需要特殊处理
      //   if (dataAssociationRes) {
      //     if (notDelete) {
      //       Message.error('该数据已被引用，无法删除');
      //     } else if (confirmDelete) {
      //       Modal.confirm({
      //         content: $t('该数据已被引用，是否确认删除？'),
      //         async onOk() {
      //           await deleteById(id_, index);
      //         },
      //         onCancel() {},
      //       });
      //     }
      //     return;
      //   }
      // }
      // }
      await deleteById(id_, index);
    },
    async linkPage(row, widget) {
      const { linkPage } = widget.props;
      Event.context.$push!(linkPage, { id: row.id_ });
    },
    async edit(row, widget, rowIndex) {
      const { refModal, refForm } = widget.props;
      const title = widget.props?.syncBtnNameToModal ? widget.props?.title : '';
      return new Promise((res, rej) => {
        Event.context.$getModal(refModal).open({
          data: operateSysEnums.EDIT,
          title,
          async onOpen(ctx) {
            const form = await ctx.$asyncRef(refForm);
            form.setValue(row);
          },
          onClose(arg) {
            res(arg);
          },
        });
      });
    },
    async copy(row, widget) {
      const data = cloneDeep(row);
      data._X_ROW_KEY = undefined;
      data.id_ = undefined;
      await updateChildren([...datasource.value, data]);
      getDataSource();
    },
    async openDetails(row, widget) {
      const { refModal, refForm } = widget.props;
      const title = widget.props?.syncBtnNameToModal ? widget.props?.title : '';
      return new Promise((res, rej) => {
        Event.context.$getModal(refModal).open({
          data: operateSysEnums.DETAILS,
          title,
          async onOpen(ctx) {
            const form = await ctx.$asyncRef(refForm);
            ctx.$setPropsByKey(refForm, { readonly: true });
            form.setValue(row);
          },
          onClose(arg) {
            res(arg);
          },
        });
      });
    },
    async modelingTraceability(row, widget) {
      /**建模追溯*/
      // Event.context.$modelingTraceability({ id: row.id_, modelKey: model }).open();
    },
    async useInfo(row, widget) {
      /**使用信息*/
      // Event.context.$usageInformation!({ id: row.id_, modelKey: model, row });
    },
    deleteByChecked,
    getImportParames: () => {
      if (parentData && searchField === 'ref_master_id_') {
        return { ref_field_key_: parentField, ref_master_id_: parentData.id_ };
      } else {
        return {};
      }
    },
    afterImport: async (getChildData) => {
      if (parentData && searchField === 'ref_master_id_') {
        datasource.value = getChildData(datasource.value);
        if (doNotSubmit) return;
        await updateChildren();
      }
      getDataSource();
    },
    getParameters,
  });

  /**更具id 获取完整的数据信息方便复制 */
  async function getAllDataById(row, { model, modelCategory, modelType, excludeField = [] }) {
    const formData = cloneDeep(row);
    const id = formData.id_;
    if (modelType === EntityModelTypeEnum.RDO || modelType === EntityModelTypeEnum.WORKFLOW) {
      const data = await Event.context.$httpBizService(
        {
          action: 'rdoGetVersionById',
          key: model,
          modelCategory: modelCategory,
        },
        {
          id,
          includeSubModel: 1,
        },
      );
      Object.assign(formData, data?.data || {});
    } else {
      const data = await Event.context.$httpBizService(
        {
          action: 'getOne',
          key: model,
          modelCategory: modelCategory,
        },
        {
          query: { 'id_.eq': id },
        },
        {
          includeSubModel: 1,
        },
      );
      Object.assign(formData, data?.data || {});
    }
    excludeField.forEach((i: any) => {
      formData[i.key] = undefined;
    });

    return formData;
  }
  /**
   * 删除选中行根据Id
   */
  async function deleteById(id, rowIndex) {
    datasource.value.splice(rowIndex, 1);
    const index = checkboxRow.value.findIndex((i) => i.id_ == id);
    if (index > -1) {
      checkboxRow.value.splice(index, 1);
    }
    showToast($t('sys.delSuccess'));
  }
  // async function opeEdit(data, row) {
  //   /**嵌套子表的编辑走特殊逻辑 */
  //   if (searchField === 'ref_master_id_') {
  //     const { _X_ROW_KEY } = row;
  //     const index = datasource.value.findIndex((i) => i._X_ROW_KEY === _X_ROW_KEY);
  //     datasource.value.splice(index, 1, { ...data });
  //     if (doNotSubmit) return;
  //     await updateChildren();
  //     getDataSource();
  //   }
  // }
};
