import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import type { PersonnelTarget, PersonnelTargetPage } from "@/types/personnel";

/** A transient, domain-scoped selector; only the server decides who is eligible. */
export default function PersonnelTargetSelect({
  scope,
  loadPage,
  value,
  onChange,
  disabled = false,
  enabled = true,
  label = "新处理人",
  helperText = "可按姓名或账号搜索",
  size = "small",
}: {
  scope: readonly unknown[];
  loadPage: (
    page: number,
    keyword: string,
    signal: AbortSignal,
  ) => Promise<PersonnelTargetPage>;
  value: PersonnelTarget | null;
  onChange: (target: PersonnelTarget | null) => void;
  disabled?: boolean;
  enabled?: boolean;
  label?: string;
  helperText?: string;
  size?: "small" | "medium";
}) {
  const [input, setInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const composing = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!composing.current) setKeyword(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);
  const query = useInfiniteQuery({
    queryKey: ["workflow-personnel-targets", ...scope, keyword],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => loadPage(pageParam, keyword, signal),
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    enabled,
    retry: false,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
  const options = useMemo(
    () => [
      ...new Map(
        (query.data?.pages ?? [])
          .flatMap((page) => page.content)
          .map((person) => [person.id, person]),
      ).values(),
    ],
    [query.data],
  );
  const more = () => {
    if (query.isFetching || disabled) return;
    void query.fetchNextPage();
    setOpen(true);
    inputRef.current?.focus();
  };
  const clearSearch = () => {
    composing.current = false;
    setInput("");
    setSearchInput("");
    setKeyword("");
    onChange(null);
    inputRef.current?.focus();
  };
  return (
    <Stack spacing={0.75}>
      <Typography
        variant="caption"
        color="text.secondary"
        role="status"
        aria-live="polite"
      >
        {query.isPending
          ? "正在加载人员…"
          : `已加载 ${options.length} 人${query.hasNextPage ? "" : query.isError ? "" : "，已全部加载"}`}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Autocomplete
          openOnFocus
          clearOnBlur={false}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          sx={{ flex: 1, minWidth: 0 }}
          options={options}
          value={value}
          inputValue={input}
          disabled={disabled}
          loading={query.isFetching}
          filterOptions={(items) => items}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          getOptionLabel={(person) => `${person.name}（${person.username}）`}
          onChange={(_, person) => onChange(person)}
          onInputChange={(_, text, reason) => {
            if (reason === "reset" && !text && !value) return;
            setInput(text);
            if (reason === "input") {
              setSearchInput(text);
              onChange(null);
            }
            if (reason === "clear") clearSearch();
          }}
          onKeyDown={(event) => {
            if (composing.current && event.key === "Enter")
              (
                event as typeof event & { defaultMuiPrevented: boolean }
              ).defaultMuiPrevented = true;
          }}
          clearText="清除人员"
          openText="展开人员"
          closeText="收起人员"
          loadingText="正在加载人员…"
          noOptionsText={
            query.isError ? "人员加载失败，请重试" : "暂无符合条件的人员"
          }
          renderInput={(params) => (
            <TextField
              {...params}
              inputRef={inputRef}
              required
              size={size}
              label={label}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {input && !value && (
                      <InputAdornment position="end">
                        <Tooltip title="清除人员搜索">
                          <IconButton
                            size="small"
                            aria-label="清除人员搜索"
                            disabled={disabled}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={clearSearch}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              placeholder="输入姓名或账号查询"
              helperText={helperText}
              error={query.isError && !options.length}
              onCompositionStart={() => {
                composing.current = true;
              }}
              onCompositionEnd={(event) => {
                composing.current = false;
                setKeyword((event.target as HTMLInputElement).value.trim());
              }}
            />
          )}
        />
        <Box sx={{ width: 112, flexShrink: 0, minHeight: 40 }}>
          {query.isError ? (
            <Button
              fullWidth
              sx={{ minHeight: 40 }}
              disabled={disabled || query.isFetching}
              onClick={() => {
                if (query.data) more();
                else {
                  void query.refetch();
                  setOpen(true);
                  inputRef.current?.focus();
                }
              }}
            >
              重试
            </Button>
          ) : (
            query.hasNextPage && (
              <Button
                fullWidth
                size="small"
                sx={{ minHeight: 40, whiteSpace: "nowrap" }}
                disabled={disabled || query.isFetching}
                startIcon={
                  query.isFetchingNextPage ? (
                    <CircularProgress size={14} />
                  ) : undefined
                }
                onClick={more}
              >
                {query.isFetchingNextPage ? "正在加载…" : "加载更多人员"}
              </Button>
            )
          )}
        </Box>
      </Stack>
      {query.isError && (
        <Alert severity="error">
          {options.length
            ? "后续人员加载失败，已加载人员仍可选择。"
            : "人员加载失败，请重试。"}
        </Alert>
      )}
    </Stack>
  );
}
