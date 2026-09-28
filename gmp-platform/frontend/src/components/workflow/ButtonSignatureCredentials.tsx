import { TextField } from '@mui/material';

type Props = {
  account: string;
  password: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
  onAccountChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
};

export default function ButtonSignatureCredentials({ account, password, disabled, size, onAccountChange, onPasswordChange }: Props) {
  return <>
    <TextField label="签署人用户名" value={account} autoComplete="off" size={size} disabled={disabled}
      onChange={event => { onAccountChange(event.target.value); onPasswordChange(''); }} />
    <TextField label={account.trim() === 'admin' ? '登录密码' : '电子签名密码'} value={password}
      autoComplete="off" type="password" size={size} disabled={disabled} onChange={event => onPasswordChange(event.target.value)} />
  </>;
}
