import { Component } from "vue";
import { DesignNodeMode, DesignNodeType, IDesignNode } from "@gct/base";
import { IDesignRenderItemController, IRenderEditorNodeProvider } from "../../interface";
import { FIELD_TYPE } from "@gct/runtime";

export abstract class RenderDesignEditor implements IRenderEditorNodeProvider {
  mode: DesignNodeMode.ITEM = DesignNodeMode.ITEM;

  type: string = DesignNodeType.DESIGN_EDITOR;

  fieldKey?: string;

  fieldType?: FIELD_TYPE;

  abstract component: string | Component;

  createController?(model: IDesignNode): IDesignRenderItemController {
    throw new Error("Method not implemented.");
  }
}
