#!/usr/bin/env python3
"""Run local PaddleOCR and emit recognized text lines as JSON."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def _box_from_points(points) -> dict[str, float] | None:
    if not isinstance(points, (list, tuple)) or not points:
        return None
    coordinates: list[tuple[float, float]] = []
    if len(points) == 4 and all(isinstance(value, (int, float)) for value in points):
        x1, y1, x2, y2 = (float(value) for value in points)
        return {"x": x1, "y": y1, "width": max(1.0, x2 - x1), "height": max(1.0, y2 - y1)}
    for point in points:
        if isinstance(point, (list, tuple)) and len(point) >= 2:
            try:
                coordinates.append((float(point[0]), float(point[1])))
            except (TypeError, ValueError):
                continue
    if not coordinates:
        return None
    xs = [point[0] for point in coordinates]
    ys = [point[1] for point in coordinates]
    return {
        "x": min(xs),
        "y": min(ys),
        "width": max(1.0, max(xs) - min(xs)),
        "height": max(1.0, max(ys) - min(ys)),
    }


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


def _collect_items_from_result(result) -> list[dict[str, float | str]]:
    items: list[dict[str, float | str]] = []
    if result is None:
        return items
    if hasattr(result, "json"):
        try:
            result = result.json
        except Exception:
            pass
    if isinstance(result, dict):
        data = result.get("res", result)
        if isinstance(data, dict):
            texts = data.get("rec_texts") or data.get("texts")
            boxes = data.get("rec_boxes") or data.get("dt_polys") or data.get("rec_polys") or []
            scores = data.get("rec_scores") or data.get("scores") or []
            if isinstance(texts, list):
                for index, text in enumerate(texts):
                    value = str(text).strip()
                    if not value:
                        continue
                    box = _box_from_points(boxes[index]) if isinstance(boxes, list) and index < len(boxes) else None
                    if not box:
                        continue
                    confidence = scores[index] if isinstance(scores, list) and index < len(scores) else 0
                    items.append({"text": value, **box, "confidence": float(confidence or 0)})
                if items:
                    return items
            for value in data.values():
                items.extend(_collect_items_from_result(value))
            return items
        return items
    if isinstance(result, (list, tuple)):
        if len(result) >= 2 and isinstance(result[0], (list, tuple)) and isinstance(result[1], (list, tuple)) and result[1]:
            box = _box_from_points(result[0])
            text = result[1][0] if len(result[1]) >= 1 else ""
            confidence = result[1][1] if len(result[1]) >= 2 else 0
            if box and str(text).strip():
                items.append({"text": str(text).strip(), **box, "confidence": float(confidence or 0)})
                return items
        for item in result:
            items.extend(_collect_items_from_result(item))
        return items
    return items


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

        items = _collect_items_from_result(raw_results)
        lines = [str(item["text"]) for item in items] or _collect_texts_from_result(raw_results)
        print(json.dumps({"ok": True, "lines": lines, "items": items}, ensure_ascii=False))
        return 0
    except Exception as exc:  # pragma: no cover - executed in deployed OCR environment
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
