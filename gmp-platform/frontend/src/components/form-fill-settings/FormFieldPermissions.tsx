import { useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, Typography, DialogTitle, DialogContent, DialogActions, Menu, MenuItem, Autocomplete, TextField } from "@mui/material";
import { EditOutlined, VisibilityOffOutlined, DrawOutlined } from "@mui/icons-material";
import AppDialog from "@/components/AppDialog";
import { FormCanvasPreview, type PreviewFieldAction, type PreviewFieldInteraction, type PreviewFieldPermission } from "@/pages/master-data/DhrTemplateWorkspaceDialog";
import { parseSubjectRefs, type SubjectRef } from "@/components/identity/SubjectSelector";
import { subjectDisplayName } from "@/components/identity/subjectDisplay";
import type { TemplateVersionRecord } from "@/api/template-modeling";
import type { FormFillSettingsValue } from "./types";
export type FormFieldOption = {
  id: string;
  code: string;
  name: string;
  type?: string;
};
export type ProcessPermissionSubject = {
  id: string;
  label: string;
  members: string;
  defaultPermission: "EDIT" | "READ_ONLY";
  stage: "填报" | "审批";
  openAccess?: boolean;
};
export type ProcessBuiltinEvent = {
  key: string;
  nodeId: string;
  nodeLabel: string;
  event: "BEFORE" | "AFTER";
  action: "SAVE" | "SUBMIT" | "APPROVE" | "RETURN";
  builtin: "FILL_SIGN_FIELD";
};

export function pruneFieldPermissions(
  permissions: FormFillSettingsValue["fieldPermissions"],
  subjects: ProcessPermissionSubject[],
  fields: FormFieldOption[],
) {
  if (!permissions) return {};
  const subjectIds = new Set(subjects.map((subject) => subject.id));
  const fieldIds = new Set(fields.map((field) => field.id));
  return Object.fromEntries(
    Object.entries(permissions)
      .filter(([subjectId]) => subjectIds.has(subjectId))
      .map(([subjectId, rule]) => [
        subjectId,
        {
          ...rule,
          editableFieldIds: (rule.editableFieldIds ?? []).filter((id) =>
            fieldIds.has(id),
          ),
          readOnlyFieldIds: (rule.readOnlyFieldIds ?? []).filter((id) =>
            fieldIds.has(id),
          ),
        },
      ]),
  );
}

export function pruneEventBindings(
  bindings: FormFillSettingsValue["eventBindings"],
  events: ProcessBuiltinEvent[],
  fields: FormFieldOption[],
) {
  if (!bindings) return {};
  const eventKeys = new Set(events.map((event) => event.key));
  const fieldIds = new Set(fields.map((field) => field.id));
  return Object.fromEntries(
    Object.entries(bindings)
      .filter(
        ([eventKey, binding]) =>
          eventKeys.has(eventKey) &&
          (!binding?.fieldId || fieldIds.has(binding.fieldId)),
      )
      .map(([eventKey, binding]) => [
        eventKey,
        binding?.fieldId ? { fieldId: binding.fieldId } : {},
      ]),
  );
}

export function processPermissionSubjects(
  version: { nodesJson?: string | null } | null | undefined,
): ProcessPermissionSubject[] {
  if (!version?.nodesJson) return [];
  try {
    const nodes = JSON.parse(version.nodesJson) as Array<{
      id?: string;
      data?: {
        kind?: string;
        label?: string;
        config?: {
          permissionGroups?: string[];
          permissionGroupRules?: Array<{
            id?: string;
            group?: string;
            subjects?: SubjectRef[];
            defaultPermission?: "EDIT" | "READ_ONLY";
          }>;
          approvers?: string;
          approverSubjects?: SubjectRef[];
          defaultPermission?: "EDIT" | "READ_ONLY";
        };
      };
    }>;
    const subjects: ProcessPermissionSubject[] = [];
    nodes.forEach((node) => {
      const config = node.data?.config;
      if (node.data?.kind === "START") {
        const rules: Array<{
          id?: string;
          group?: string;
          subjects?: SubjectRef[];
          defaultPermission?: "EDIT" | "READ_ONLY";
        }> = config?.permissionGroupRules?.length
          ? config.permissionGroupRules
          : (config?.permissionGroups ?? []).map((group) => ({
              group,
              defaultPermission: "EDIT" as const,
            }));
        rules.forEach((rule, index) => {
          const refs = rule.subjects ?? parseSubjectRefs(rule.group);
          const validRefs = refs.filter((ref) => ref.type !== "LEGACY");
          if (validRefs.length)
            subjects.push({
              id: `start:${rule.id ?? `legacy-${index}`}`,
              label: `填报权限组 ${index + 1}`,
              members: validRefs
                .map(
                  (ref) =>
                    `${subjectDisplayName(ref)}${ref.type === "DEPARTMENT" ? (ref.departmentScope === "SELF_ONLY" ? "（本部门）" : "（含下级）") : ""}`,
                )
                .join("、"),
              defaultPermission: rule.defaultPermission ?? "EDIT",
              stage: "填报",
            });
        });
        if (!rules.length)
          subjects.push({
            id: "start:open",
            label: "填报权限组",
            members: "未配置主体，所有人可填报",
            defaultPermission: config?.defaultPermission ?? "EDIT",
            stage: "填报",
            openAccess: true,
          });
      }
      if (node.data?.kind === "APPROVAL") {
        const refs =
          config?.approverSubjects ?? parseSubjectRefs(config?.approvers);
        subjects.push({
          id: `approval:${node.id ?? subjects.length}`,
          label: String(node.data?.label ?? "审批节点"),
          members: refs.length
            ? refs
                .map(
                  (ref) =>
                    `${subjectDisplayName(ref)}${ref.type === "DEPARTMENT" ? (ref.departmentScope === "SELF_ONLY" ? "（本部门）" : "（含下级）") : ""}`,
                )
                .join("、")
            : "未配置审批主体，所有人可审批",
          defaultPermission: config?.defaultPermission ?? "EDIT",
          stage: "审批",
          openAccess: refs.length === 0,
        });
      }
    });
    return subjects;
  } catch {
    return [];
  }
}

export function processBuiltinEvents(
  version: { nodesJson?: string | null } | null | undefined,
): ProcessBuiltinEvent[] {
  if (!version?.nodesJson) return [];
  try {
    const nodes = JSON.parse(version.nodesJson) as Array<{
      id?: string;
      data?: {
        label?: string;
        config?: {
          buttonEvents?: Array<{
            id?: string;
            event?: "BEFORE" | "AFTER";
            action?: ProcessBuiltinEvent["action"];
            builtin?: "FILL_SIGN_FIELD";
            signatureMethod?: "ACCOUNT_PASSWORD";
            enabled?: boolean;
          }>;
        };
      };
    }>;
    const events: ProcessBuiltinEvent[] = [];
    nodes.forEach((node) => {
      (node.data?.config?.buttonEvents ?? []).forEach((event, index) => {
        if (event.enabled === false) return;
        const id = String(event.id ?? `event-${index + 1}`).trim();
        const action = event.action;
        if (!id || !event.event || !action) return;
        const isSignature =
          (!event.builtin || event.builtin === "FILL_SIGN_FIELD") &&
          (!event.signatureMethod ||
            event.signatureMethod === "ACCOUNT_PASSWORD") &&
          ["SAVE", "SUBMIT", "APPROVE", "RETURN"].includes(action);
        if (
          !isSignature ||
          (event.builtin && event.builtin !== "FILL_SIGN_FIELD")
        )
          return;
        if (event.event !== "BEFORE") return;
        events.push({
          key: `${node.id ?? "node"}:${id}`,
          nodeId: String(node.id ?? "node"),
          nodeLabel: String(node.data?.label ?? "流程节点"),
          event: event.event,
          action,
          builtin: "FILL_SIGN_FIELD",
        });
      });
    });
    return events.filter((event) => event.builtin === "FILL_SIGN_FIELD");
  } catch {
    return [];
  }
}

export function templateFields(
  version: TemplateVersionRecord | null | undefined,
): FormFieldOption[] {
  if (!version?.modelDesignJson) return [];
  try {
    const parsed = JSON.parse(version.modelDesignJson) as {
      payload?: { fields?: unknown[] };
      fields?: unknown[];
    };
    const fields = Array.isArray(parsed.payload?.fields)
      ? parsed.payload.fields
      : Array.isArray(parsed.fields)
        ? parsed.fields
        : [];
    return fields
      .map((field, index) => {
        const source = (
          field && typeof field === "object" ? field : {}
        ) as Record<string, unknown>;
        const id = String(source.id ?? source.code ?? `field-${index + 1}`);
        const code = String(source.code ?? id);
        const name = String(source.name ?? code);
        return {
          id,
          code,
          name,
          type: source.type ? String(source.type) : undefined,
        };
      })
      .filter((field) => field.id && field.name);
  } catch {
    return [];
  }
}

function isSignatureFieldType(type?: string) {
  const normalized = String(type ?? "")
    .toLowerCase()
    .replace(/[ _-]/g, "");
  return ["signature", "electronicsignature", "sign"].includes(normalized);
}

export function FormPermissionConfigDialog({
  open,
  subjects,
  fields,
  document,
  permissions,
  events,
  eventBindings,
  editable,
  loading,
  onClose,
  onSave,
}: {
  open: boolean;
  subjects: ProcessPermissionSubject[];
  fields: FormFieldOption[];
  document: Parameters<typeof FormCanvasPreview>[0]["document"] | null;
  permissions: FormFillSettingsValue["fieldPermissions"];
  events: ProcessBuiltinEvent[];
  eventBindings: Record<string, { fieldId?: string }>;
  editable: boolean;
  loading: boolean;
  onClose: () => void;
  onSave: (
    permissions: FormFillSettingsValue["fieldPermissions"],
    eventBindings: Record<string, { fieldId?: string }>,
  ) => void;
}) {
  const [draft, setDraft] = useState(permissions ?? {});
  const [eventDraft, setEventDraft] = useState(eventBindings ?? {});
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    subjects[0]?.id ?? null,
  );
  const [highlightFieldId, setHighlightFieldId] = useState<string | null>(null);
  const [signatureMenu, setSignatureMenu] = useState<{
    anchor: HTMLElement;
    fieldId: string;
  } | null>(null);
  useEffect(() => {
    if (!open) return;
    setDraft(permissions ?? {});
    setEventDraft(eventBindings ?? {});
    setSelectedSubjectId((current) =>
      subjects.some((subject) => subject.id === current)
        ? current
        : (subjects[0]?.id ?? null),
    );
  }, [open, permissions, subjects]);
  const selectedSubject =
    subjects.find((subject) => subject.id === selectedSubjectId) ?? null;
  const selectedRule = selectedSubject
    ? (draft[selectedSubject.id] ?? {
        defaultPermission: selectedSubject.defaultPermission,
        editableFieldIds: [],
        readOnlyFieldIds: [],
      })
    : null;
  const defaultPermission =
    selectedRule?.defaultPermission ??
    selectedSubject?.defaultPermission ??
    "EDIT";
  const exceptions =
    defaultPermission === "EDIT"
      ? (selectedRule?.readOnlyFieldIds ?? [])
      : (selectedRule?.editableFieldIds ?? []);
  const fieldOptions = fields.map((field) => ({
    id: field.id,
    label: `${field.name} · ${field.code}`,
  }));
  const previewPermissions = useMemo<PreviewFieldPermission | undefined>(() => {
    if (!selectedSubject) return undefined;
    const map: PreviewFieldPermission = {};
    fields.forEach((field) => {
      const isException = exceptions.includes(field.id);
      map[field.id] =
        defaultPermission === "EDIT"
          ? isException
            ? "READ_ONLY"
            : "EDIT"
          : isException
            ? "EDIT"
            : "READ_ONLY";
    });
    return map;
  }, [defaultPermission, exceptions, fields, selectedSubject]);
  const updateRule = (patch: Partial<NonNullable<typeof selectedRule>>) => {
    if (!selectedSubject) return;
    setDraft((current) => ({
      ...current,
      [selectedSubject.id]: { ...selectedRule, ...patch },
    }));
  };
  const toggleExceptionField = (fieldId: string) => {
    if (!selectedSubject) return;
    const nextExceptions = exceptions.includes(fieldId)
      ? exceptions.filter((id) => id !== fieldId)
      : [...exceptions, fieldId];
    updateRule({
      editableFieldIds: defaultPermission === "READ_ONLY" ? nextExceptions : [],
      readOnlyFieldIds: defaultPermission === "EDIT" ? nextExceptions : [],
    });
  };
  const bindSignatureField = (fieldId: string, event: ProcessBuiltinEvent) => {
    setEventDraft((current) => ({
      ...current,
      [event.key]: { fieldId },
    }));
  };
  const fieldInteraction = useMemo<PreviewFieldInteraction>(
    () => ({
      highlightFieldId,
      onFieldHover: setHighlightFieldId,
      actionsForField: (field) => {
        const actions: PreviewFieldAction[] = [];
        if (editable && selectedSubject) {
          const isException = exceptions.includes(field.id);
          actions.push({
            key: "toggle-permission",
            title:
              defaultPermission === "EDIT"
                ? isException
                  ? "恢复可编辑"
                  : "设为只读"
                : isException
                  ? "恢复只读"
                  : "设为编辑",
            icon: isException ? (
              defaultPermission === "EDIT" ? (
                <EditOutlined fontSize="small" />
              ) : (
                <VisibilityOffOutlined fontSize="small" />
              )
            ) : defaultPermission === "EDIT" ? (
              <VisibilityOffOutlined fontSize="small" />
            ) : (
              <EditOutlined fontSize="small" />
            ),
            onClick: () => toggleExceptionField(field.id),
          });
        }
        if (editable && events.length && isSignatureFieldType(field.type)) {
          actions.push({
            key: "bind-signature",
            title: events.length === 1 ? "填充该字段" : "选择按钮填充该字段",
            icon: <DrawOutlined fontSize="small" />,
            onClick: (_fieldId, anchor) => {
              if (events.length === 1) bindSignatureField(field.id, events[0]);
              else setSignatureMenu({ anchor, fieldId: field.id });
            },
          });
        }
        return actions;
      },
    }),
    [
      defaultPermission,
      editable,
      events,
      exceptions,
      highlightFieldId,
      selectedSubject,
    ],
  );
  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{ sx: { height: "100dvh", borderRadius: 0 } }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid #e4e7ed" }}>
        字段权限与签名绑定
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 0,
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) 380px" },
          minHeight: 0,
          bgcolor: "#f4f7fa",
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid #e4e7ed",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 2,
              py: 1.25,
              bgcolor: "#fff",
              borderBottom: "1px solid #e4e7ed",
            }}
          >
            <Typography variant="subtitle2">表单预览</Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ maxWidth: "48%" }}
            >
              {selectedSubject
                ? `当前预览：${selectedSubject.stage} · ${selectedSubject.label}`
                : "未配置主体，默认可编辑"}
            </Typography>
          </Stack>
          {loading ? (
            <Box
              sx={{
                flex: 1,
                display: "grid",
                placeItems: "center",
                color: "#909399",
              }}
            >
              正在加载表单...
            </Box>
          ) : document ? (
            <FormCanvasPreview
              document={document}
              fieldPermissions={previewPermissions}
              interaction={fieldInteraction}
            />
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "grid",
                placeItems: "center",
                color: "#909399",
              }}
            >
              暂时无法预览表单
            </Box>
          )}
        </Box>
        <Box
          sx={{ minWidth: 0, minHeight: 0, overflow: "auto", bgcolor: "#fff" }}
        >
          <Stack spacing={2} sx={{ p: 2 }}>
            <Box>
              <Typography variant="subtitle2">节点与权限组</Typography>
              <Typography variant="caption" color="text.secondary">
                填报权限组与审批节点
              </Typography>
            </Box>
            {subjects.length ? (
              <Stack spacing={1}>
                {(["填报", "审批"] as const).map((stage) => {
                  const stageSubjects = subjects.filter(
                    (subject) => subject.stage === stage,
                  );
                  return stageSubjects.length ? (
                    <Box key={stage}>
                      <Typography
                        variant="caption"
                        sx={{ color: "#697586", fontWeight: 600 }}
                      >
                        {stage}阶段
                      </Typography>
                      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                        {stageSubjects.map((subject) => (
                          <Button
                            key={subject.id}
                            size="small"
                            onClick={() => setSelectedSubjectId(subject.id)}
                            sx={{
                              justifyContent: "flex-start",
                              textAlign: "left",
                              px: 1.25,
                              py: 0.75,
                              color:
                                selectedSubjectId === subject.id
                                  ? "#1677c8"
                                  : "#303133",
                              bgcolor:
                                selectedSubjectId === subject.id
                                  ? "#edf6ff"
                                  : "transparent",
                              borderRadius: 1,
                              textTransform: "none",
                              whiteSpace: "normal",
                              overflow: "hidden",
                            }}
                          >
                            <Stack
                              sx={{ minWidth: 0, alignItems: "flex-start" }}
                            >
                              <Typography variant="body2" noWrap>
                                {subject.label}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                                sx={{ maxWidth: "100%" }}
                              >
                                {subject.members}
                              </Typography>
                            </Stack>
                          </Button>
                        ))}
                      </Stack>
                    </Box>
                  ) : null;
                })}
              </Stack>
            ) : (
              <Box
                sx={{
                  p: 1.25,
                  bgcolor: "#f7f9fb",
                  color: "#606266",
                  fontSize: 13,
                }}
              >
                未配置主体，所有已认证用户均可按流程状态操作。
              </Box>
            )}
            {selectedSubject ? (
              <>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    默认权限
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.75,
                      color:
                        defaultPermission === "EDIT" ? "#1677c8" : "#697586",
                    }}
                  >
                    {defaultPermission === "EDIT" ? "全部可编辑" : "全部只读"}{" "}
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                    >
                      （继承节点默认权限）
                    </Typography>
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    例外字段
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    未选择的字段保持默认权限，已选择的字段使用相反权限。
                  </Typography>
                  <Autocomplete
                    multiple
                    size="small"
                    sx={{ mt: 1 }}
                    options={fieldOptions}
                    value={fieldOptions.filter((field) =>
                      exceptions.includes(field.id),
                    )}
                    getOptionLabel={(option) => option.label}
                    disabled={!editable || !fields.length}
                    onClose={() => setHighlightFieldId(null)}
                    onChange={(_, next) =>
                      updateRule({
                        editableFieldIds:
                          defaultPermission === "READ_ONLY"
                            ? next.map((field) => field.id)
                            : [],
                        readOnlyFieldIds:
                          defaultPermission === "EDIT"
                            ? next.map((field) => field.id)
                            : [],
                      })
                    }
                    renderOption={(props, option) => (
                      <li
                        {...props}
                        onMouseEnter={() => setHighlightFieldId(option.id)}
                        onMouseLeave={() => setHighlightFieldId(null)}
                      >
                        {option.label}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          defaultPermission === "EDIT"
                            ? "例外只读字段"
                            : "例外可编辑字段"
                        }
                        placeholder="选择字段"
                      />
                    )}
                  />
                </Box>
              </>
            ) : null}
            {events.length ? (
              <Box sx={{ pt: 1.5, borderTop: "1px solid #e4e7ed" }}>
                <Typography variant="body2" fontWeight={600}>
                  节点按钮
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  需要签名的按钮可选择将签名写入哪个表单字段。
                </Typography>
                <Box sx={{ mt: 0.75 }}>
                  <FormProcessEventBindingEditor
                    compact
                    events={events}
                    fields={fields}
                    bindings={eventDraft}
                    editable={editable}
                    loading={false}
                    onFieldHover={setHighlightFieldId}
                    onChange={setEventDraft}
                  />
                </Box>
              </Box>
            ) : null}
          </Stack>
        </Box>
      </DialogContent>
      <Menu
        anchorEl={signatureMenu?.anchor}
        open={Boolean(signatureMenu)}
        onClose={() => setSignatureMenu(null)}
      >
        {events.map((event) => (
          <MenuItem
            key={event.key}
            onClick={() => {
              if (signatureMenu)
                bindSignatureField(signatureMenu.fieldId, event);
              setSignatureMenu(null);
            }}
          >
            {event.nodeLabel} ·{" "}
            {event.action === "SAVE"
              ? "保存"
              : event.action === "SUBMIT"
                ? "提交"
                : event.action === "APPROVE"
                  ? "审批"
                  : "退回"}
          </MenuItem>
        ))}
      </Menu>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button
          variant="contained"
          onClick={() => onSave(draft, eventDraft)}
          disabled={!editable}
        >
          保存配置
        </Button>
      </DialogActions>
    </AppDialog>
  );
}

export function FormProcessEventBindingEditor({
  events,
  fields,
  bindings,
  compact = false,
  editable,
  loading,
  onFieldHover,
  onChange,
}: {
  events: ProcessBuiltinEvent[];
  fields: FormFieldOption[];
  bindings: Record<string, { fieldId?: string }>;
  compact?: boolean;
  editable: boolean;
  loading: boolean;
  onFieldHover?: (fieldId: string | null) => void;
  onChange: (bindings: Record<string, { fieldId?: string }>) => void;
}) {
  if (loading) {
    return (
      <Typography variant="caption" color="text.secondary">
        正在加载表单事件和字段...
      </Typography>
    );
  }
  if (events.length === 0) return null;
  const signatureFields = fields.filter((field) =>
    isSignatureFieldType(field.type),
  );
  const fieldOptions = signatureFields.map((field) => ({
    label: `${field.name} · ${field.code}`,
    id: field.id,
  }));
  const eventGroups = Array.from(
    events.reduce((groups, event) => {
      const current = groups.get(event.nodeId) ?? [];
      current.push(event);
      groups.set(event.nodeId, current);
      return groups;
    }, new Map<string, ProcessBuiltinEvent[]>()),
  );
  return (
    <Box
      sx={
        compact
          ? undefined
          : { border: "1px solid #e4e7ed", borderRadius: 1, p: 1.25 }
      }
    >
      {!compact ? (
        <>
          <Typography variant="body2" fontWeight={650}>
            内置事件字段
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.35,
              mb: 1,
              color: "#909399",
              lineHeight: 1.45,
            }}
          >
            需要签名的按钮会在执行前要求账户密码，并将签名写入这里绑定的表单字段。
          </Typography>
        </>
      ) : null}
      <Stack spacing={1.25}>
        {eventGroups.map(([nodeId, nodeEvents]) => (
          <Box
            key={nodeId}
            sx={{
              borderBottom: compact ? "1px solid #eef1f4" : undefined,
              pb: compact ? 1 : 0,
            }}
          >
            {compact ? (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mb: 0.5,
                  color: "#697586",
                  fontWeight: 600,
                }}
              >
                {nodeEvents[0]?.nodeLabel}
              </Typography>
            ) : null}
            <Stack spacing={0.75}>
              {nodeEvents.map((event) => {
                const selected =
                  fieldOptions.find(
                    (field) => field.id === bindings[event.key]?.fieldId,
                  ) ?? null;
                return (
                  <Box
                    key={event.key}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) minmax(220px, 1fr)",
                      gap: 1.25,
                      alignItems: "center",
                      py: compact ? 0.75 : 0,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      {!compact ? (
                        <Typography
                          variant="body2"
                          noWrap
                          title={event.nodeLabel}
                        >
                          {event.nodeLabel}
                        </Typography>
                      ) : null}
                      <Typography variant="caption" sx={{ color: "#909399" }}>
                        {event.action === "SAVE"
                          ? "保存"
                          : event.action === "SUBMIT"
                            ? "提交"
                            : event.action === "APPROVE"
                              ? "审批"
                              : "退回"}{" "}
                        · 账户密码签名
                      </Typography>
                    </Box>
                    <Autocomplete
                      size="small"
                      options={fieldOptions}
                      value={selected}
                      getOptionLabel={(option) => option.label}
                      disabled={!editable || fieldOptions.length === 0}
                      onClose={() => onFieldHover?.(null)}
                      onChange={(_, next) => {
                        const nextBindings = { ...bindings };
                        if (next)
                          nextBindings[event.key] = { fieldId: next.id };
                        else delete nextBindings[event.key];
                        onChange(nextBindings);
                      }}
                      renderOption={(props, option) => (
                        <li
                          {...props}
                          onMouseEnter={() => onFieldHover?.(option.id)}
                          onMouseLeave={() => onFieldHover?.(null)}
                        >
                          {option.label}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="目标签名字段"
                          placeholder="请选择字段"
                        />
                      )}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Box>
        ))}
      </Stack>
      {fieldOptions.length === 0 ? (
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 1, color: "#c62828" }}
        >
          当前表单没有签名类型字段，无法配置签名填充。
        </Typography>
      ) : null}
    </Box>
  );
}
