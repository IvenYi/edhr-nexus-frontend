export const fontFamilys = [
  { id: "Microsoft Yahei", value: "微软雅黑" },
  { id: "SimSun", value: "宋体" },
  { id: "SimHei", value: "黑体" },
  { id: "LiSu", value: "隶书" },
  { id: "YouYuan", value: "幼圆" },
  { id: "tahoma", value: "tahoma" },
  { id: "arial", value: "arial" },
  { id: "sans-serif", value: "sans-serif" },
];

export const fontWeights = [
  { id: "lighter", value: "细" },
  { id: "normal", value: "正常" },
  { id: "bolder", value: "粗" },
  { id: "100", value: "100" },
  { id: "200", value: "200" },
  { id: "300", value: "300" },
  { id: "400", value: "400" },
  { id: "500", value: "500" },
  { id: "600", value: "600" },
  { id: "700", value: "700" },
  { id: "800", value: "800" },
  { id: "900", value: "900" },
];

export const fontStyles = [
  { id: "italic", value: "斜体" },
  { id: "normal", value: "正常" },
];

export const hAligns = [
  { id: "left", value: "左对齐" },
  { id: "center", value: "居中对齐" },
  { id: "right", value: "右对齐" },
];

export const vAligns = [
  { id: "top", value: "上对齐" },
  { id: "middle", value: "居中对齐" },
  { id: "bottom", value: "下对齐" },
];

export const writingModes = [
  { id: "horizontal-tb", value: "水平" },
  { id: "vertical-rl", value: "垂直" },
];

export const justifyContents = [
  { id: "flex-start", value: "左对齐" },
  { id: "center", value: "居中对齐" },
  { id: "flex-end", value: "右对齐" },
];

export const aligns = [
  { id: "flex-start", value: "上对齐" },
  { id: "center", value: "居中对齐" },
  { id: "flex-end", value: "下对齐" },
];

export const angles = [
  { id: "horizontal", value: "水平" },
  { id: "bevel", value: "斜角" },
  { id: "vertical", value: "垂直" },
];

export const titleLocations = [
  { id: "start", value: "开头" },
  { id: "center", value: "中间" },
  { id: "end", value: "末尾" },
];

export const lineStyles = [
  { id: "solid", value: "实线" },
  { id: "dashed", value: "虚线" },
];

export const fillTypes = [
  { id: "solid", value: "实体填充" },
  { id: "gradient", value: "渐变填充" },
];

export const repeatTypes = [
  { id: "no-repeat", value: "不重复，拉伸满" },
  { id: "repeat", value: "水平和垂直重复" },
  { id: "repeat-x", value: "水平重复" },
  { id: "repeat-y", value: "垂直重复" },
];

export const echartsLablePositions = [
  { id: "top", value: "顶部" },
  { id: "left", value: "左侧" },
  { id: "right", value: "右侧" },
  { id: "bottom", value: "底部" },
  { id: "inside", value: "内部" },
  { id: "insideLeft", value: "内-左侧" },
  { id: "insideRight", value: "内-右侧" },
  { id: "insideTop", value: "内-顶部" },
  { id: "insideBottom", value: "内-底部" },
  { id: "insideTopLeft", value: "内-顶部居左" },
  { id: "insideBottomLeft", value: "内-底部居左" },
  { id: "insideTopRight", value: "内-顶部居右" },
  { id: "insideBottomRight", value: "内-顶部居右" },
];

export const animationEasings = [
  "linear",
  "quadraticIn",
  "quadraticOut",
  "quadraticInOut",
  "cubicIn",
  "cubicOut",
  "cubicInOut",
  "quarticIn",
  "quarticOut",
  "quarticInOut",
  "quinticIn",
  "quinticOut",
  "quinticInOut",
  "sinusoidalIn",
  "sinusoidalOut",
  "sinusoidalInOut",
  "exponentialIn",
  "exponentialOut",
  "exponentialInOut",
  "circularIn",
  "circularOut",
  "circularInOut",
  "elasticIn",
  "elasticOut",
  "elasticInOut",
  "backIn",
  "backOut",
  "backInOut",
  "bounceIn",
  "bounceOut",
  "bounceInOut",
].map((m) => ({ id: m, value: m }));

export const selectSuggests = [
  { id: "auto", value: "自适应" },
  { id: "dataMin", value: "数据最小值" },
  { id: "dataMax", value: "数据最大值" },
];

export const orients = [
  { id: "horizontal", value: "水平" },
  { id: "vertical", value: "垂直" },
];

export const axisTypes = [
  { id: "category", value: "类目型" },
  { id: "value", value: "数值型" },
  { id: "time", value: "时间型" },
];

export const LegendLocations = [
  { id: "top-left", value: "顶部居左" },
  { id: "top-center", value: "顶部居中" },
  { id: "top-right", value: "顶部居右" },
  { id: "middle-left", value: "左侧居中" },
  { id: "middle-right", value: "右侧居中" },
  { id: "bottom-left", value: "底部居左" },
  { id: "bottom-center", value: "底部居中" },
  { id: "bottom-right", value: "底部居右" },
] as const;

export const echartIcons = [
  { id: "auto", value: "自适应", icon: "shape-auto" },
  { id: "circle", value: "圆形", icon: "shape-circle" },
  { id: "rect", value: "矩形", icon: "shape-rect" },
  { id: "roundRect", value: "圆角矩形", icon: "shape-round-rect" },
  { id: "triangle", value: "三矩形", icon: "shape-triangle" },
  { id: "diamond", value: "菱形", icon: "shape-diamond" },
  { id: "arrow", value: "箭头", icon: "shape-arrow" },
  { id: "emptyCircle", value: "空心圆形", icon: "shape-circle" },
  { id: "emptyRect", value: "空心矩形", icon: "shape-rect" },
  { id: "emptyRoundRect", value: "空心圆角矩形", icon: "shape-round-rect" },
  { id: "emptyTriangle", value: "空心三角形", icon: "shape-triangle" },
  { id: "emptyDiamond", value: "空心菱形", icon: "shape-diamond" },
  { id: "emptyArrow", value: "空心箭头", icon: "shape-arrow" },
];

export const valueFormats = [
  { id: "auto", value: "默认" },
  { id: "d", value: "11(整数)" },
  { id: ".1f", value: "11.1(浮点数)" },
  { id: ".2f", value: "11.11(浮点数)" },
  { id: ".0%", value: "11%" },
  { id: ".1%", value: "11.1%" },
  { id: ".2%", value: "11.11%" },
  { id: "th", value: "1,111(千分位)" },
  { id: ".1t", value: "1,111.1(千分位)" },
  { id: ".2t", value: "1,111.11(千分位)" },
];

export const timeFormats = [
  { id: "YYYY-MM-DD HH:mm:ss", value: "2012-01-01 02:03:00(年-月-日 时:分:秒)" },
  { id: "YYYY-MM-DD", value: "2012-01-01(年-月-日)" },
  { id: "YYYY-MM", value: "2012-01(年-月)" },
  { id: "MM-DD", value: "01-01(月-日)" },
  { id: "YYYY", value: "2012(年)" },
  { id: "MM", value: "01(月)" },
  { id: "YYYY/MM/DD HH:mm:ss", value: "2012/01/01 02:03:00(年/月/日 时:分:秒)" },
  { id: "YYYY/MM/DD", value: "2012/01/01(年/月/日)" },
  { id: "YYYY/MM", value: "2012/01(年/月)" },
  { id: "MM/DD", value: "01/01(月/日)" },
];

export const imageTypes = [
  { id: "bitmap", value: "位图" },
  { id: "vector", value: "矢量图" },
];

export const TextAligns = [
  { id: "left", value: "L" },
  { id: "center", value: "C" },
  { id: "right", value: "R" },
  // { id: 'justify', value: 'J' },
] as const;

export const TextDecorations = [
  { id: "bold", value: "bold" },
  { id: "italic", value: "italic" },
  { id: "underline", value: "underline" },
  // { id: 'line-through', value: 'line-through' },
] as const;

export const BackgroundTypes = [
  { id: "color", value: "颜色" },
  { id: "image", value: "图片" },
] as const;

export const IntervalTypes = [
  { id: "auto", value: "默认" },
  { id: "all", value: "全部显示" },
  { id: "interval", value: "间隔显示" },
] as const;

export const SeriesBarLabelPositions = [
  { id: "top", value: "注定外侧" },
  { id: "insideTop", value: "内部贴顶" },
  { id: "insideBottom", value: "内部贴底" },
  { id: "inside", value: "内部中心" },
] as const;

export const BarRoundedTypes = [
  { id: "top", value: "仅外角" },
  { id: "all", value: "两端" },
] as const;

export const LineTypes = [
  { id: "solid", value: "实线" },
  { id: "dashed", value: "虚线" },
  { id: "dotted", value: "点线" },
] as const;

export const NullTexts = [
  {
    id: "--",
    value: "--",
  },
] as const;

export const AggregationTypes = [
  { id: "sum", value: "求和" },
  { id: "average", value: "平均数" },
  { id: "max", value: "最大值" },
  { id: "min", value: "最小值" },
] as const;

export const SizeTypes = [
  {
    id: "1920*1080",
    value: "1920px * 1080px",
  },
  {
    id: "custom",
    value: "自定义",
  },
] as const;

export const ResponsiveTypes = [
  {
    id: "--",
    value: "--",
  }
] as const;

export const TransitionTypes=[
  {
    id: "--",
    value: "--",
  }
] as const;