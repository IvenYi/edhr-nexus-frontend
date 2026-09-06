import { Add, DeleteOutline, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Divider,
  Typography,
} from "@mui/material";

export type WorkflowButtonAction = "SAVE" | "SUBMIT" | "APPROVE" | "RETURN";
export type WorkflowBuiltinEvent = "NONE" | "FILL_SIGN_FIELD";
export type WorkflowButtonConfig = {
  id: string;
  label: string;
  action: WorkflowButtonAction;
  visible?: boolean;
  requireOpinion?: boolean;
  style?: "PRIMARY" | "DEFAULT" | "DANGER";
};
export type WorkflowButtonEvent = {
  id: string;
  event: "BEFORE";
  action: WorkflowButtonAction;
  builtin: WorkflowBuiltinEvent;
  signatureMethod: "ACCOUNT_PASSWORD";
};

const actionLabels: Record<WorkflowButtonAction, string> = {
  SAVE: "保存",
  SUBMIT: "提交",
  APPROVE: "审批",
  RETURN: "退回",
};

const buttonStyleLabels: Record<NonNullable<WorkflowButtonConfig["style"]>, string> = {
  PRIMARY: "主按钮",
  DEFAULT: "普通按钮",
  DANGER: "警示按钮",
};
export const defaultWorkflowButtons = (
  kind: "START" | "APPROVAL",
): WorkflowButtonConfig[] =>
  kind === "START"
    ? [
        { id: "save", label: "保存", action: "SAVE", visible: true, style: "DEFAULT" },
        { id: "submit", label: "提交", action: "SUBMIT", visible: true, style: "PRIMARY" },
      ]
    : [
        { id: "approve", label: "审批", action: "APPROVE", visible: true, style: "PRIMARY" },
        { id: "return", label: "退回", action: "RETURN", visible: true, style: "DANGER" },
      ];

export function WorkflowActionConfig({
  kind,
  buttons,
  events,
  guardMode,
  editable,
  onChange,
}: {
  kind: "START" | "APPROVAL";
  buttons?: WorkflowButtonConfig[];
  events?: WorkflowButtonEvent[];
  guardMode?: "NONE" | "BLOCK_ON_INVALID" | "WARN_ON_INVALID";
  editable: boolean;
  onChange: (patch: {
    buttons: WorkflowButtonConfig[];
    buttonEvents: WorkflowButtonEvent[];
    guardMode: "NONE" | "BLOCK_ON_INVALID" | "WARN_ON_INVALID";
  }) => void;
}) {
  const availableActions: WorkflowButtonAction[] =
    kind === "START" ? ["SAVE", "SUBMIT"] : ["APPROVE", "RETURN"];
  const currentButtons = buttons?.length ? buttons : defaultWorkflowButtons(kind);
  const currentEvents = events ?? [];
  const update = (
    nextButtons: WorkflowButtonConfig[],
    nextEvents = currentEvents,
    nextGuard = guardMode ?? "BLOCK_ON_INVALID",
  ) => onChange({ buttons: nextButtons, buttonEvents: nextEvents, guardMode: nextGuard });
  const visibleButtons = currentButtons.filter((button) => button.visible !== false);
  const updateButton = (index: number, patch: Partial<WorkflowButtonConfig>) =>
    update(currentButtons.map((item, i) => i === index ? { ...item, ...patch } : item));
  return (
    <Box sx={{ bgcolor: "#fff" }}>
      <Stack spacing={0.5} sx={{ px: 0.25, pb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700}>节点按钮</Typography>
        <Typography variant="caption" color="text.secondary">设置用户在此节点可以看到和执行的操作。</Typography>
      </Stack>

      <Box sx={{ px: 1.25, py: 1.25, bgcolor: "#f7f9fc", borderRadius: 1.25 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.9 }}>
          <Typography variant="caption" color="text.secondary">用户操作预览</Typography>
          <Typography variant="caption" color="text.secondary">节点上实际显示</Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
          {visibleButtons.length ? visibleButtons.map((button) => {
            const style = button.style ?? (button.action === "RETURN" ? "DANGER" : "DEFAULT");
            return <Button key={button.id} size="small" variant={style === "DEFAULT" ? "outlined" : "contained"} color={style === "DANGER" ? "error" : "primary"} sx={{ pointerEvents: "none", textTransform: "none", maxWidth: "100%", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{button.label || actionLabels[button.action]}</Button>;
          }) : <Typography variant="caption" color="text.secondary">暂无可用按钮</Typography>}
        </Stack>
      </Box>

      <Box sx={{ pt: 2 }}>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>按钮列表</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap", display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>只控制按钮是否显示，隐藏后仍可恢复。</Typography>
        <Stack sx={{ mt: 0.75, gap: 0.75 }}>
          {currentButtons.map((button, index) => {
            const visible = button.visible !== false;
            return <Box key={button.id || index} sx={{ p: 1, bgcolor: "#fff", border: "1px solid #e4e7ed", borderRadius: 1 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "34px minmax(0, 1fr) minmax(0, 1fr)", gap: 0.75, alignItems: "center" }}>
                <Stack direction="row" spacing={0.25} alignItems="center" sx={{ minWidth: 0, whiteSpace: "nowrap" }}>
                  <IconButton size="small" aria-label={visible ? "隐藏按钮" : "显示按钮"} disabled={!editable} onClick={() => updateButton(index, { visible: !visible })} sx={{ color: visible ? "#1677c8" : "#9aa4b2" }}>
                    {visible ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                  </IconButton>
                </Stack>
                <TextField size="small" variant="outlined" label="按钮名称" value={button.label} placeholder="例如：提交" disabled={!editable} onChange={(event) => updateButton(index, { label: event.target.value })} sx={{ minWidth: 0 }} />
                <FormControl size="small" variant="outlined" fullWidth>
                  <InputLabel id={`button-action-${button.id}`}>动作</InputLabel>
                  <Select labelId={`button-action-${button.id}`} label="动作" value={button.action} disabled={!editable} onChange={(event) => updateButton(index, { action: event.target.value as WorkflowButtonAction })}>
                    {availableActions.map((action) => <MenuItem key={action} value={action}>{actionLabels[action]}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: kind === "APPROVAL" ? "minmax(0, 1fr) minmax(140px, 0.8fr)" : "1fr" }, gap: 0.75, alignItems: "center", mt: 0.75 }}>
                <FormControl size="small" variant="outlined" fullWidth>
                  <InputLabel id={`button-style-${button.id}`}>按钮样式</InputLabel>
                  <Select labelId={`button-style-${button.id}`} label="按钮样式" value={button.style ?? (button.action === "RETURN" ? "DANGER" : "DEFAULT")} disabled={!editable} onChange={(event) => updateButton(index, { style: event.target.value as WorkflowButtonConfig["style"] })}>
                    {Object.entries(buttonStyleLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                  </Select>
                </FormControl>
                {kind === "APPROVAL" && button.action !== "SAVE" ? <FormControlLabel control={<Checkbox size="small" checked={button.requireOpinion === true} disabled={!editable} onChange={(event) => updateButton(index, { requireOpinion: event.target.checked })} />} label="意见必填" sx={{ ml: 0, mr: 0, '& .MuiFormControlLabel-label': { fontSize: 12, whiteSpace: "nowrap" } }} /> : null}
              </Box>
            </Box>;
          })}
        </Stack>
      </Box>

      <Divider sx={{ mt: 1.25 }} />
      <Box sx={{ pt: 1.75 }}>
        <Typography variant="body2" fontWeight={700}>表单校验</Typography>
        <Typography variant="caption" color="text.secondary">点击提交或审批前，如何处理未通过校验的表单。</Typography>
        <FormControl size="small" fullWidth variant="standard" sx={{ mt: 1 }}>
          <Select aria-label="表单校验方式" value={guardMode ?? "BLOCK_ON_INVALID"} disabled={!editable} onChange={(event) => update(currentButtons, currentEvents, event.target.value as "NONE" | "BLOCK_ON_INVALID" | "WARN_ON_INVALID")}>
            <MenuItem value="BLOCK_ON_INVALID">不通过时阻止操作</MenuItem>
            <MenuItem value="WARN_ON_INVALID">不通过时提示，但允许继续</MenuItem>
            <MenuItem value="NONE">不进行表单校验</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ mt: 1.75 }} />
      <Box sx={{ pt: 1.75, pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" fontWeight={700}>电子签名</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>为按钮添加账户密码签署，可选填充签名字段。</Typography>
          </Box>
          <Button size="small" variant="text" startIcon={<Add />} disabled={!editable} onClick={() => update(currentButtons, [...currentEvents, { id: `event-${Date.now()}`, event: "BEFORE", action: availableActions[0], builtin: "NONE", signatureMethod: "ACCOUNT_PASSWORD" }])}>添加签署</Button>
        </Stack>
        {currentEvents.length === 0 ? <Box sx={{ mt: 1, px: 1.25, py: 1, bgcolor: "#f7f9fc", borderRadius: 1 }}><Typography variant="caption" color="text.secondary">暂未配置事件</Typography></Box> : null}
        <Stack sx={{ mt: 0.75, gap: 0.75 }}>
          {currentEvents.map((item, index) => {
            const updateEvent = (patch: Partial<WorkflowButtonEvent>) =>
              update(currentButtons, currentEvents.map((entry, i) => i === index ? { ...entry, ...patch } : entry));
            return <Box key={item.id || index} sx={{ p: 1, bgcolor: "#fff", border: "1px solid #e4e7ed", borderRadius: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">账户密码签署</Typography>
                <Tooltip title="删除事件"><span><IconButton size="small" aria-label="删除事件" color="error" disabled={!editable} onClick={() => update(currentButtons, currentEvents.filter((_, i) => i !== index))}><DeleteOutline fontSize="small" /></IconButton></span></Tooltip>
              </Stack>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 0.75 }}>
                <FormControl size="small" variant="outlined" fullWidth><InputLabel id={`event-action-${item.id}`}>关联按钮</InputLabel><Select labelId={`event-action-${item.id}`} label="关联按钮" value={item.action} disabled={!editable} onChange={(event) => updateEvent({ action: event.target.value as WorkflowButtonAction })}>{availableActions.map((action) => <MenuItem key={action} value={action}>{actionLabels[action]}</MenuItem>)}</Select></FormControl>
                <FormControl size="small" variant="outlined" fullWidth><InputLabel id={`event-signature-${item.id}`}>签名方式</InputLabel><Select labelId={`event-signature-${item.id}`} label="签名方式" value={item.signatureMethod ?? "ACCOUNT_PASSWORD"} disabled={!editable} onChange={(event) => updateEvent({ signatureMethod: event.target.value as "ACCOUNT_PASSWORD" })}><MenuItem value="ACCOUNT_PASSWORD">账户密码</MenuItem></Select></FormControl>
              </Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 0.5, minWidth: 0 }}>
                <FormControlLabel
                  control={<Checkbox size="small" checked={item.builtin === "FILL_SIGN_FIELD"} disabled={!editable} onChange={(event) => updateEvent({ builtin: event.target.checked ? "FILL_SIGN_FIELD" : "NONE" })} />}
                  label="填充签名字段"
                  sx={{ ml: 0, mr: 0, minWidth: 0, '& .MuiFormControlLabel-label': { fontSize: 13, whiteSpace: "nowrap" } }}
                />
                {item.builtin === "FILL_SIGN_FIELD" ? <Typography variant="caption" color="text.secondary" noWrap sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", textAlign: "right" }}>字段在作业流程的表单节点绑定</Typography> : null}
              </Stack>
            </Box>;
          })}
        </Stack>
      </Box>
    </Box>
  );
}
