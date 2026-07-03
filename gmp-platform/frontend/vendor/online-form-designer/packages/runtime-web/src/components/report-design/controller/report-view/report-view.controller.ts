import { computed, nextTick, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { isEmpty, cloneDeep } from 'lodash-es';
import { getReportInfo, postReport, postReportDeploy } from '/@/apis/gct-apaas/ReportController';
import { ReportViewState } from '../../state';
import {
  IReportConfig,
  IReportDesignProvider,
  IReportField,
  IReportSchema,
  IRuntimeReportSchema,
} from '../../interface';
import { getAllProviders } from '../../providers';
import { REPORT_TYPE } from '../../constants';
import { AsyncSeriesHook, createUUID, SyncSeriesHook } from 'qx-util';
import saveModal from '/@web-render/views/report-center/modals/save-modal.vue';
import { IModal, EntityModelCategoryEnum } from '@gct/runtime';
import saveAndPublishModal from '/@web-render/views/report-center/modals/save-publish-modal.vue';
import { ReportEnum } from '../../schema';
import { snapdom } from '@zumer/snapdom';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { ReportResponse } from '/@/apis/gct-apaas/model';

// 移除 报表中 模型已删除的字段
const removeDeletedField = async (response: ReportResponse) => {
  const designerJsonData = JSON.parse(response.designerJson || '{}');
  const { dataColumn, columnDimension, indicatorDimension, rowDimension } = designerJsonData;
  // 明细表
  if (dataColumn?.length) {
    await removeFields(response, 'dataColumn');
  }
  // 交叉表列
  if (columnDimension?.length) {
    await removeFields(response, 'columnDimension');
  }
  // 交叉表指标
  if (indicatorDimension?.length) {
    await removeFields(response, 'indicatorDimension');
  }
  // 交叉表行
  if (rowDimension?.length) {
    await removeFields(response, 'rowDimension');
  }
};

/**
 * 行、列、指标 模型或数据集中字段删除字段排除方法
 */
const removeFields = async (response: ReportResponse, type) => {
  const designerJsonData = JSON.parse(response.designerJson || '{}');
  const { fieldMap } = designerJsonData;
  const keysMapCache: Record<string, string[]> = {};
  for (const col of designerJsonData[type]) {
    const modelKey = fieldMap[col].modelKey;
    const fieldKey = col.split(/(:|\.)/).at(-1);
    let keys = keysMapCache[modelKey];

    if (!keys && response.modelType !== EntityModelCategoryEnum.DATA_SET) {
      const { fieldMetaList } = (await getModelMetaDetail({ modelKey })) || {};
      keys = (fieldMetaList || []).map((row) => row.key || '').filter(Boolean);
      keysMapCache[modelKey] = keys;
    }

    if (response.modelType !== EntityModelCategoryEnum.DATA_SET && !keys.includes(fieldKey)) {
      designerJsonData[type] = designerJsonData[type].filter((c) => c !== col);
      delete designerJsonData.fieldMap[col];
    }
    // 数据集自建公式字段删除
    if (response.modelType === EntityModelCategoryEnum.DATA_SET) {
      const { fieldMetaList } = (await getModelMetaDetail({ modelKey: response.modelKey })) || {};
      keys = (fieldMetaList || []).map((row) => row.key || '').filter(Boolean);
      keysMapCache[response.modelKey] = keys;
    }
    if (!keys.includes(fieldKey)) {
      designerJsonData[type] = designerJsonData[type].filter((c) => c !== col);
      delete designerJsonData.fieldMap[col];
    }
  }
  response.designerJson = JSON.stringify(designerJsonData);
};

/**
 * 报表视图控制器
 *
 * @export
 * @class ReportViewController
 */
export class ReportViewController {
  /**
   * 报表界面状态
   *
   */
  readonly state = reactive(new ReportViewState());

  readonly hooks = {
    save: {
      before: new AsyncSeriesHook<void, { isSave: boolean }>(),
    },
    field: {
      delete: new SyncSeriesHook<IReportField>(),
      sort: new SyncSeriesHook<void>(),
      add: new SyncSeriesHook<IReportField>(),
      replace: new SyncSeriesHook<IReportField, IReportField>(),
    },
  };

  /**
   * 报表设计预览组件
   *
   * @type {IReportDesignProvider[]}
   */
  readonly providers: IReportDesignProvider[] = getAllProviders(this);

  /**
   * 当前报表设计适配器
   */
  provider = computed(() => {
    const type =
      this.state.schema && this.state.schema.reportType
        ? this.state.schema.reportType
        : REPORT_TYPE.SCHEDULE_TABLE;
    const _provider = this.providers.find((item) => {
      return item.type === type;
    });
    if (!_provider) {
      throw new Error(`未找到报表设计适配器：${type}`);
    }
    return _provider;
  });

  /** 截图 */
  async getScreenshot() {
    const elDom = document.getElementById('reportTable');
    console.log('elDom', elDom, this.state.saving);
    const result = await snapdom(elDom, { scale: 0.6 });
    const image = await result.toWebp();
    return image.src;
  }

  showTable(schema) {
    const { dataColumn, rowDimension, columnDimension, reportType } = schema;
    return (
      (reportType === ReportEnum.SCHEDULE_TABLE && !!dataColumn?.length) ||
      (reportType === ReportEnum.CROSS_TABLE && (columnDimension?.length || !!rowDimension?.length))
    );
  }

  /**
   * 保存报表
   *
   */
  async save(modal: IModal): Promise<void> {
    this.state.saving = true;
    const ctx = { isSave: true };
    await this.hooks.save.before.call(ctx);
    if (ctx.isSave === false) {
      this.state.saving = false;
      return;
    }
    this.state.data.designerJson = JSON.stringify(this.state.schema);
    this.state.runtimeSchema = this.transformRuntime(this.state.schema);
    this.state.data.runtimeJson = JSON.stringify(this.state.runtimeSchema);
    if (this.showTable(this.state.schema)) {
      this.state.data.screenShoot = (await this.getScreenshot()) as string;
    }
    this.state.saving = false;
    const res = await gct.openUtil.modal<any>(
      saveModal,
      {
        data: this.state.data,
      },
      {
        title: '保存',
        width: '640px',
        height: '400px',
        showFooter: false,
      },
    );
    if (res && res.ok && res.data) {
      try {
        await postReport(res.data);
        this.state.modified = false;
        modal.dismiss({ ok: true });
        message.success('保存成功');
      } catch (error) {
        console.error(error);
      } finally {
        this.state.saving = false;
      }
    } else {
      this.state.saving = false;
    }
  }

  async onSave(): Promise<void> {
    try {
      const ctx = { isSave: true };
      await this.hooks.save.before.call(ctx);
      if (ctx.isSave === false) {
        this.state.saving = false;
        return;
      }
      this.state.data.designerJson = JSON.stringify(this.state.schema);
      this.state.runtimeSchema = this.transformRuntime(this.state.schema);
      this.state.data.runtimeJson = JSON.stringify(this.state.runtimeSchema);
      // this.state.saving = true;
      if (this.showTable(this.state.schema)) {
        this.state.data.screenShoot = (await this.getScreenshot()) as string;
      }
      await postReport(this.state.data);
      this.state.modified = false;
      message.success('保存成功');
    } catch (error) {
      console.error(error);
    } finally {
      // this.state.saving = false;
    }
  }

  /**
   * 保存并发布报表
   *
   */
  async saveAndPublish(modal: IModal): Promise<void> {
    this.state.saving = true;
    const ctx = { isSave: true };
    await this.hooks.save.before.call(ctx);
    if (ctx.isSave === false) {
      this.state.saving = false;
      return;
    }
    this.state.data.designerJson = JSON.stringify(this.state.schema);
    this.state.runtimeSchema = this.transformRuntime(this.state.schema);
    this.state.data.runtimeJson = JSON.stringify(this.state.runtimeSchema);
    if (this.showTable(this.state.schema)) {
      this.state.data.screenShoot = (await this.getScreenshot()) as string;
    }
    this.state.saving = false;
    const res = await gct.openUtil.modal<any>(
      saveAndPublishModal,
      {
        data: this.state.data,
      },
      {
        title: '保存并发布',
        width: '640px',
        height: '600px',
        showFooter: false,
      },
    );
    if (res && res.ok && res.data) {
      try {
        const id = await postReport({ ...res.data, visibleRange: null });
        this.state.modified = false;
        await postReportDeploy({
          id,
          visibleRange: res.data.visibleRange,
        });
        modal.dismiss({ ok: true });
        message.success('保存并发布成功');
      } catch (error) {
        console.error(error);
      } finally {
        this.state.saving = false;
      }
    } else {
      this.state.saving = false;
    }
  }

  /**
   * 修改报表名称
   *
   */
  async updateName(): Promise<void> {
    try {
      this.state.saving = true;
      await postReport({
        id: this.state.data.id,
        name: this.state.data.name,
        categoryId: this.state.data.categoryId ?? '',
      });
      message.success('保存成功');
    } catch (error) {
      console.error(error);
    } finally {
      this.state.saving = false;
    }
  }

  /**
   * 加载报表数据
   *
   */
  async load(reportType?: string, id?: string, categoryId?: string): Promise<void> {
    if (id) {
      try {
        this.state.loading = true;
        const res = await getReportInfo({ id });
        if (res) {
          await removeDeletedField(res);

          this.state.data = res as IReportConfig;
          // 初始化设计时模型
          {
            if (res.designerJson) {
              this.state.schema = JSON.parse(res.designerJson);
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.state.loading = false;
      }
    } else {
      this.state.data.name = '未命名报表名称';
      this.state.data.categoryId = categoryId!;
    }
    // 初始化设计时模型
    if (!this.state.schema || isEmpty(this.state.schema)) {
      this.state.schema = cloneDeep(this.provider.value.schema);
    }
    // 初始化运行时模型
    if (!this.state.runtimeSchema || isEmpty(this.state.runtimeSchema)) {
      this.state.runtimeSchema = this.transformRuntime(this.state.schema);
    }
    if (!this.state.data.reportType) {
      this.state.data.reportType = reportType ?? REPORT_TYPE.SCHEDULE_TABLE;
    }
    if (!this.state.schema.reportType) {
      this.state.schema.reportType = this.state.data.reportType;
    }
    if (!this.state.data.modelKey) {
      this.state.data.modelKey = this.state.schema.modelKey;
      this.state.data.modelType = this.state.schema.modelCategory;
    }
    if (!this.state.schema._key) {
      this.state.schema._key = createUUID();
    }
    this.state.loaded = true;
  }

  /**
   * 配置变更更新配置 json
   *
   * @param {IObject} [data={}]
   * @returns {*}  {IReportSchema}
   */
  updateSchema(data: IObject = {}): IReportSchema {
    Object.assign(this.state.schema, data);
    this.state.runtimeSchema = this.transformRuntime(this.state.schema);
    this.state.modified = true;
    console.log('updateSchema:runtimeSchema', this.state.runtimeSchema);
    this.state.schema = this.state.schema;
    this.state.count += 1;
    return this.state.schema;
  }

  /**
   * 转换为运行态数据
   *
   * @protected
   * @param {IReportSchema} schema
   * @returns {*}  {IRuntimeReportSchema}
   */
  protected transformRuntime(schema: IReportSchema): IRuntimeReportSchema {
    let data: IRuntimeReportSchema = cloneDeep(schema) as IRuntimeReportSchema;
    data._uuid = createUUID();
    if (this.provider && this.provider.value.transformRuntime) {
      data = this.provider.value.transformRuntime(data);
    }
    return data;
  }

  /**
   * 强制更新绘制
   *
   */
  force(): void {
    this.state.count += 1;
  }
}
