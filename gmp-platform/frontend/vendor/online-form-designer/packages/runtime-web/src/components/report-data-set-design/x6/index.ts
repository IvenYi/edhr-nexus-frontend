import { registerLinkEdge } from "./edge/link.edge";
import { registerNodeShape } from "./shape/node.shape";

export function initX6() {
  registerLinkEdge();
  registerNodeShape();
}
