import { Add, Delete } from "@mui/icons-material";
import { Box, Button, Stack, Typography, Tooltip, IconButton, FormControl, Select, MenuItem } from "@mui/material";
import { SubjectSelector, parseSubjectRefs, serializeSubjectRefs } from "@/components/identity/SubjectSelector";
import type { DirectFillConfig as Config, EntryPermissionGroup as PermissionGroupRule } from "./types";
export function EntryPermissionGroupEditor({
  config,
  editable,
  onChange,
}: {
  config?: Config;
  editable: boolean;
  onChange: (patch: Partial<Config>) => void;
}) {
  const rules: PermissionGroupRule[] = config?.permissionGroupRules?.length
    ? config.permissionGroupRules
    : (config?.permissionGroups ?? []).map((group) => ({
        group,
      }));
  const displayRules: PermissionGroupRule[] = rules.length
    ? rules
    : [];
  const updateRules = (next: PermissionGroupRule[]) =>
    onChange({
      permissionGroupRules: next,
      permissionGroups: next.map((rule) => rule.group.trim()).filter(Boolean),
      conflictPolicy: "READ_ONLY_FIRST",
    });
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography variant="body2" fontWeight={600}>
          填报人员与默认权限
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Button
            size="small"
            variant="text"
            startIcon={<Add />}
            onClick={() =>
              updateRules([
                ...rules,
                {
                  id: `permission-group-${Date.now()}-${rules.length}`,
                  group: "",
                  defaultPermission: "EDIT",
                },
              ])
            }
            disabled={!editable}
          >
            添加
          </Button>
        </Stack>
      </Stack>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block" }}
      >
        多组权限重叠时，只读优先。
      </Typography>
      <Stack spacing={1} sx={{ mt: 1 }}>
        {displayRules.map((rule, index) => (
          <Box
            key={rule.id ?? index}
            sx={{
              p: 1.25,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 0.75, minHeight: 28 }}
            >
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                填报组 {index + 1}
              </Typography>
              {editable && rules.length > 0 ? (
                <Tooltip title="删除权限组" arrow>
                  <IconButton
                    size="small"
                    aria-label={`删除填报权限组 ${index + 1}`}
                    onClick={() =>
                      updateRules(rules.filter((_, i) => i !== index))
                    }
                    sx={{
                      width: 28,
                      height: 28,
                      color: "#909399",
                      '&:hover': { color: "#d4380d", bgcolor: "#fff1f0" },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null}
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) 150px' }, gap: 1.5, alignItems: 'start' }}>
            <SubjectSelector
              value={rule.subjects ?? parseSubjectRefs(rule.group)}
              disabled={!editable}
              label="填报主体"
              onChange={(subjects) =>
                updateRules(
                  displayRules.map((item, i) =>
                    i === index
                      ? { ...item, subjects, group: serializeSubjectRefs(subjects) }
                      : item,
                  ),
                )
              }
            />
            <FormControl size="small" fullWidth>
              <Select
                value={rule.defaultPermission ?? "EDIT"}
                inputProps={{ 'aria-label': `填报组 ${index + 1} 默认权限` }}
                disabled={!editable}
                onChange={(event) =>
                  updateRules(
                    displayRules.map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            defaultPermission: event.target.value as "EDIT" | "READ_ONLY",
                          }
                        : item,
                    ),
                  )
                }
              >
                <MenuItem value="EDIT">全部可编辑</MenuItem>
                <MenuItem value="READ_ONLY">全部只读</MenuItem>
              </Select>
            </FormControl>
            </Box>
          </Box>
        ))}
        {displayRules.length === 0 ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            未限制填报人员
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
