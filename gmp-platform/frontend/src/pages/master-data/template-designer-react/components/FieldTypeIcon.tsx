import AttachFileOutlined from '@mui/icons-material/AttachFileOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import CheckBoxOutlined from '@mui/icons-material/CheckBoxOutlined';
import DrawOutlined from '@mui/icons-material/DrawOutlined';
import HubOutlined from '@mui/icons-material/HubOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import LinkOutlined from '@mui/icons-material/LinkOutlined';
import NumbersOutlined from '@mui/icons-material/NumbersOutlined';
import RadioButtonCheckedOutlined from '@mui/icons-material/RadioButtonCheckedOutlined';
import TableChartOutlined from '@mui/icons-material/TableChartOutlined';
import TextFieldsOutlined from '@mui/icons-material/TextFieldsOutlined';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { FieldTypeIconKey } from '../types';

const fieldTypeIconMap = {
  text: TextFieldsOutlined,
  number: NumbersOutlined,
  datetime: CalendarMonthOutlined,
  signature: DrawOutlined,
  link: LinkOutlined,
  attachment: AttachFileOutlined,
  image: ImageOutlined,
  singleSelect: RadioButtonCheckedOutlined,
  multiSelect: CheckBoxOutlined,
  reference: HubOutlined,
  subTable: TableChartOutlined,
};

interface FieldTypeIconProps extends SvgIconProps {
  iconKey: FieldTypeIconKey;
}

export default function FieldTypeIcon({ iconKey, sx, ...props }: FieldTypeIconProps) {
  const Icon = fieldTypeIconMap[iconKey];

  return (
    <Icon
      data-field-type-icon="true"
      fontSize="small"
      sx={{ color: '#64748b', ...sx }}
      {...props}
    />
  );
}
