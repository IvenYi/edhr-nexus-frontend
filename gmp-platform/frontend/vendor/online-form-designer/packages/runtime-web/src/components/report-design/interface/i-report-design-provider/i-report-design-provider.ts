import { IEditForm } from "@gct-paas/core";
import { Component } from "vue";
import { IReportSchema } from "../i-report-schema/i-report-schema";
import { IRuntimeReportSchema } from "../i-runtime-report-schema/i-runtime-report-schema";
import { IReportField } from "../i-report-field/i-report-field";
import { IFieldContextItem } from "../i-field-context-item/i-field-context-item";

/**
 * 报表设计适配器
 *
 * @export
 * @interface IReportDesignProvider
 */
export interface IReportDesignProvider {
  /**
   * 适配的报表类型
   *
   * @type {string}
   */
  type: string;
  /**
   * 报表设计预览组件
   *
   * @type {Component}
   */
  previewComponent: Component;
  /**
   * 右侧配置表单配置
   *
   * @type {IEditForm}
   */
  formModel: IEditForm;
  /**
   * 报表设计 schema 新建默认配置
   *
   * @type {IReportSchema}
   */
  schema: IReportSchema;
  /**
   * 主要用于覆盖模型切换以后的数据修改覆盖
   *
   * @param {IObject} data
   * @returns {*}  {IObject}
   */
  resetSchema(data: IObject): IObject;
  /**
   * 报表设计字段 schema 新建默认配置
   *
   * @type {IReportField}
   */
  createField(data: IObject): IReportField;
  /**
   * 报表字段菜单配置
   *
   * @param {IReportField} data
   * @returns {*}  {IFieldContextItem[]}
   */
  getFieldMenus(data: IReportField): IFieldContextItem[];
  /**
   * 转换为运行态数据
   *
   * @param {IReportSchema} schema
   * @returns {*}  {IRuntimeReportSchema}
   */
  transformRuntime?(schema: IReportSchema): IRuntimeReportSchema;
}
