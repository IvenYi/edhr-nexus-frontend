#!/usr/bin/env python3
"""Run local PaddleOCR and emit recognized text lines as JSON."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def _collect_texts_from_result(result) -> list[str]:
    texts: list[str] = []
    if result is None:
        return texts
    if hasattr(result, "json"):
        try:
            result = result.json
        except Exception:
            pass
    if isinstance(result, dict):
        data = result.get("res", result)
        for key in ("rec_texts", "texts"):
            values = data.get(key) if isinstance(data, dict) else None
            if isinstance(values, list):
                texts.extend(str(value) for value in values if str(value).strip())
                return texts
        for value in data.values() if isinstance(data, dict) else []:
            texts.extend(_collect_texts_from_result(value))
        return texts
    if isinstance(result, (list, tuple)):
        if len(result) >= 2 and isinstance(result[1], (list, tuple)) and result[1]:
            first = result[1][0]
            if isinstance(first, str):
                texts.append(first)
                return texts
        for item in result:
            texts.extend(_collect_texts_from_result(item))
        return texts
    return texts


def main() -> int:
    if len(sys.argv) != 2:
        print(json.dumps({"ok": False, "error": "usage: paddle_id_card_ocr.py <image-path>"}, ensure_ascii=False))
        return 2

    image_path = Path(sys.argv[1])
    if not image_path.exists():
        print(json.dumps({"ok": False, "error": "image not found"}, ensure_ascii=False))
        return 2

    try:
        try:
            from paddleocr import PaddleOCR  # type: ignore

            ocr = PaddleOCR(lang="ch")
            if hasattr(ocr, "predict"):
                raw_results = ocr.predict(str(image_path))
            else:
                raw_results = ocr.ocr(str(image_path), cls=True)
        except TypeError:
            from paddleocr import PaddleOCR  # type: ignore

            ocr = PaddleOCR(use_angle_cls=True, lang="ch")
            raw_results = ocr.ocr(str(image_path), cls=True)

        lines = _collect_texts_from_result(raw_results)
        print(json.dumps({"ok": True, "lines": lines}, ensure_ascii=False))
        return 0
    except Exception as exc:  # pragma: no cover - executed in deployed OCR environment
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
