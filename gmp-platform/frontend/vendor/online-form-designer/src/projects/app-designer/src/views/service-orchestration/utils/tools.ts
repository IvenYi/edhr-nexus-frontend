import { Graph, Color } from '@antv/x6';
import { Button } from '@antv/x6/es/registry/tool/button';

// export function init() {
const MyButton = Button.define<Button.Options>({
  markup: [
    {
      tagName: 'rect',
      selector: 'button',
      attrs: {
        width: 20,
        height: 20,
        rx: 4,
        ry: 4,
        fill: 'white',
        stroke: '#fe854f',
        'stroke-width': 2,
        cursor: 'pointer',
      },
    },
  ],
  onClick({ view }: any) {
    const node = view.cell;
    const fill = Color.randomHex();
    node.attr({
      body: {
        fill,
      },
      label: {
        fill: Color.invert(fill, true),
      },
    });
  },
});

Graph.registerNodeTool('my-btn', MyButton, true);
// }
