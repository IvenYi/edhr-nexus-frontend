import { operateSysEnums } from '/@page-designer/enum';
import { provide } from 'vue';
import { message as Message, Modal } from 'ant-design-vue';
import { cloneDeep, merge, orderBy, isEmpty } from 'lodash-es';
import { EntityModelTypeEnum, openWindowEnums, ExamineAndApproveStateEnum } from '@gct/runtime';
import { useProcessPage } from '/@/hooks/web/useProcessPage';
import { getModal } from './modals/index';
import { useAppInfoStore } from '/@/store/modules/app-info';
import {
  getMedProModelMetaHasDataAssociation,
  getMedProModelMetaGetSysConfig,
} from '/@/apis/gct-apaas/MedProCommonController';

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
      const appInfoStore = useAppInfoStore();
      if (!doNotSubmit && appInfoStore.appInfo.suiteKey === 'MEDPRO') {
        const NOT_DELETE_ENABLED_KEY = 'not.delete.enabled';
        const REMOVE_TWICE_ALERT_ENABLED_KEY = 'remove.twice.alert.enabled';

        const notDelete = await getMedProModelMetaGetSysConfig({ key: NOT_DELETE_ENABLED_KEY });
        const confirmDelete = await getMedProModelMetaGetSysConfig({
          key: REMOVE_TWICE_ALERT_ENABLED_KEY,
        });

        // 如果任一配置启用，则检查数据关联
        if (notDelete || confirmDelete) {
          const dataAssociationRes = await getMedProModelMetaHasDataAssociation({
            modelKey: model,
            id: id_,
          });

          // 只有数据被引用时才需要特殊处理
          if (dataAssociationRes) {
            if (notDelete) {
              Message.error('该数据已被引用，无法删除');
            } else if (confirmDelete) {
              Modal.confirm({
                content: $t('该数据已被引用，是否确认删除？'),
                async onOk() {
                  await deleteById(id_, index);
                },
                onCancel() {},
              });
            }
            return;
          }
        }
      }
      await deleteById(id_, index);
    },
    async linkPage(row, widget) {
      const { linkPage } = widget.props;
      Event.context.$push!(linkPage, { id: row.id_ });
    },
    async edit(row, widget, rowIndex) {
      if (parentData) {
        const modalInfo = subTableWidget.children[4];
        const { open } = getModal({ modalInfo, Event });
        const data = await open({ ...row }, 'edit');
        if (!data) return;
        const dataList = [...datasource.value];
        dataList.splice(rowIndex, 1, { ...data });
        await updateChildren(dataList);
        getDataSource();
      } else {
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
      }
    },
    async copy(row, widget) {
      if (parentData) {
        const data = cloneDeep(row);
        data._X_ROW_KEY = undefined;
        data.id_ = undefined;
        await updateChildren([...datasource.value, data]);
        getDataSource();
      } else {
        const { refModal, refForm, excludeField } = widget.props;
        const rowData = row.__DEFAULT__ || row;
        const title = widget.props?.syncBtnNameToModal ? widget.props?.title : '';
        return new Promise((res, rej) => {
          Event.context.$getModal(refModal).open({
            data: operateSysEnums.COPY,
            title,
            async onOpen(ctx) {
              const info = await getAllDataById(row, {
                model: model,
                modelType: modeldata?.modelType,
                modelCategory: modeldata?.modelCategory,
                excludeField: excludeField,
              });
              const form = await ctx.$asyncRef(refForm);
              form.copyData({ ...rowData, ...info });
            },
            onClose(arg) {
              res(arg);
            },
          });
        });
      }
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
    /**流程审批 */
    async approve(row, widget, data) {
      const { taskId, procInstId, node, webPageKey, webViewPageKey, btnList } = data;
      const { refModal, refForm, openType } = widget.props;
      if (openType === openWindowEnums.OPEN) {
        Event.context.$getModal(refModal).open({
          data: operateSysEnums.EXAMINE_AND_APPROVE,
          async onReady(E) {
            await E.runProcessBySaskId({
              taskId,
              processInstanceId: procInstId,
              examineAndApproveState: ExamineAndApproveStateEnum.MY_CUSTOM_Modal,
              refFormId: refForm,
            });
          },
        });
      } else {
        const { goPage } = useProcessPage({ processInstanceId: procInstId, taskId });
        const btnkeys = btnList || [];
        if (!node || !btnkeys.length || (node.key === '__initiator__' && !taskId)) {
          // node 不存在表示无关人员 btnList空表示审批完成   node.key 识别开始节点就是申请人开始节点
          goPage(node?.webViewPageKey || webViewPageKey, ExamineAndApproveStateEnum.MY_CUSTOM);
        } else {
          goPage(node.webPageKey || webPageKey, ExamineAndApproveStateEnum.MY_CUSTOM);
        }
      }
    },
    async modelingTraceability(row, widget) {
      /**建模追溯*/
      Event.context.$modelingTraceability({ id: row.id_, modelKey: model }).open();
    },
    async useInfo(row, widget) {
      /**使用信息*/
      Event.context.$usageInformation!({ id: row.id_, modelKey: model, row });
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
    if (doNotSubmit) {
      datasource.value.splice(rowIndex, 1);
      return;
    }
    await deleteDataByids([id]);
    Message.success($t('sys.delSuccess'));
    getDataSource();
    const index = checkboxRow.value.findIndex((i) => i.id_ == id);
    if (index > -1) {
      checkboxRow.value.splice(index, 1);
    }
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
  if (parentData) {
    /**嵌套子表的新增 */
    provide('sub-table-add-method', async () => {
      const modalInfo = subTableWidget.children[4];
      const { open } = getModal({ modalInfo, Event });
      const data = await open({}, 'create');
      datasource.value.push(data);
      await updateChildren();
      getDataSource();
    });
  }
};
