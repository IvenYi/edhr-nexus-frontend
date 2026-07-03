import { useI18n } from '/@/hooks/web/useI18n';
import scheduleSvg from '/@/assets/svg/detail-chart.svg'
import crossSvg from '/@/assets/svg/cross-chart.svg'
import detailPreview from '/@/assets/svg/detail-preview.svg'
import crossPreview from '/@/assets/svg/cross-preview.svg'
const { t } = useI18n();

export enum chartType {
  /** 交叉表 */
  CROSS_TABLE = 'crossTable',
  /** 明细表 */
  SCHEDULE_TABLE = 'scheduleTable',
}


export const chartTypeImg = {
  /** 交叉表 */
  crossTable: crossSvg,
  /** 明细表 */
  scheduleTable: scheduleSvg,
}

export const chartTypePreImg = {
  /** 交叉表 */
  crossTable: crossPreview,
  /** 明细表 */
  scheduleTable: detailPreview,
}

export const reportOptions = [{
  id: 1,
  name: t('sys.pageDesigner.processTable'),
  components: [
    {
      id: chartType.SCHEDULE_TABLE,
      name: t('sys.report.detailTable'),
      src: scheduleSvg,
    },
    {
      id: chartType.CROSS_TABLE,
      name: t('sys.report.crosstabs'),
      src: crossSvg,
    }
  ]
}]

export const chartOptions = [
  {
    name: t('sys.report.quota'),
    components: [
      {
        name: t('sys.report.detailTable'),
        src: ""
      },
      {
        name: t('sys.report.crosstabs'),
        src: ""
      }
    ]
  },
  {
    name: t('sys.report.pieChart'),
    components: [
      {
        name: t('sys.report.detailTable'),
        src: ""
      },
      {
        name: t('sys.report.crosstabs'),
        src: ""
      }
    ]
  },
  {
    name: t('sys.report.barChart'),
    components: [
      {
        name: t('sys.report.detailTable'),
        src: ""
      },
      {
        name: t('sys.report.crosstabs'),
        src: ""
      }
    ]
  },
]
