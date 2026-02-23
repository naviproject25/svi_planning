"""범용 PDF 구조 파서 - 어떤 PDF든 헤딩/섹션을 자동 탐지"""

from __future__ import annotations

import re
from dataclasses import dataclass

import pymupdf

from .models import PageResult, Section


@dataclass
class _Heading:
    title: str
    level: int
    page: int
    offset: int  # 전체 텍스트에서의 시작 위치


class StructureParser:
    """PDF에서 헤딩과 섹션 구조를 자동으로 탐지한다.

    탐지 방식:
    1. PyMuPDF의 텍스트 블록에서 폰트 크기 분석
    2. 본문보다 큰 폰트 = 헤딩으로 판단
    3. 상위 2개 레벨만 섹션 경계로 사용
    4. 헤딩 사이 텍스트를 정확히 분할
    """

    def __init__(self, pdf_path: str, max_heading_levels: int = 2):
        self.pdf_path = pdf_path
        self.max_heading_levels = max_heading_levels

    def parse(self, page_results: list[PageResult]) -> list[Section]:
        """페이지 결과에서 섹션 구조를 추출한다."""
        doc = pymupdf.open(self.pdf_path)

        # 1) 전체 텍스트를 페이지별로 합침 (offset 추적)
        full_text = ""
        page_offsets: list[tuple[int, int, int]] = []  # (start, end, page_number)
        for pr in page_results:
            start = len(full_text)
            full_text += pr.markdown + "\n\n"
            page_offsets.append((start, len(full_text), pr.page_number))

        # 2) 폰트 크기별 텍스트 수집
        size_texts: dict[float, list[str]] = {}
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            blocks = page.get_text("dict")["blocks"]
            for block in blocks:
                if block["type"] != 0:
                    continue
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        text = span.get("text", "").strip()
                        if not text or len(text) < 2:
                            continue
                        size = round(span.get("size", 0), 1)
                        size_texts.setdefault(size, []).append(text)

        doc.close()

        if not size_texts:
            return self._fallback_pages(page_results)

        # 3) 본문 크기 = 가장 많은 글자 수를 차지하는 폰트 크기
        size_char_count = {
            s: sum(len(t) for t in texts) for s, texts in size_texts.items()
        }
        body_size = max(size_char_count, key=size_char_count.get)

        # 본문보다 큰 크기만 헤딩 후보 (상위 N개 레벨)
        heading_sizes = sorted(
            [s for s in size_texts if s > body_size],
            reverse=True,
        )[: self.max_heading_levels]

        if not heading_sizes:
            return self._fallback_pages(page_results)

        size_to_level = {s: i + 1 for i, s in enumerate(heading_sizes)}

        # 4) 헤딩 텍스트를 full_text에서 찾아 offset 기록
        heading_texts: list[tuple[str, int, float]] = []  # (text, page, size)
        doc = pymupdf.open(self.pdf_path)
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            blocks = page.get_text("dict")["blocks"]
            for block in blocks:
                if block["type"] != 0:
                    continue
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        text = span.get("text", "").strip()
                        size = round(span.get("size", 0), 1)
                        if text and size in size_to_level and len(text) >= 2 and not text.isdigit():
                            heading_texts.append((text, page_idx + 1, size))
        doc.close()

        # 연속 같은 페이지 + 같은 크기 → 병합 (줄바꿈된 긴 제목)
        merged: list[tuple[str, int, float]] = []
        for text, page, size in heading_texts:
            if (
                merged
                and merged[-1][1] == page
                and merged[-1][2] == size
                and len(merged[-1][0]) < 50
            ):
                merged[-1] = (merged[-1][0] + " " + text, page, size)
            else:
                merged.append((text, page, size))

        # 5) full_text에서 각 헤딩의 offset 찾기
        headings: list[_Heading] = []
        search_start = 0
        for title, page, size in merged:
            # 해당 페이지 범위 내에서만 검색
            page_start = 0
            page_end = len(full_text)
            for ps, pe, pn in page_offsets:
                if pn == page:
                    page_start = ps
                    page_end = pe
                    break

            idx = full_text.find(title, max(search_start, page_start))
            if idx == -1:
                idx = full_text.find(title, page_start)
            if idx == -1:
                continue

            headings.append(_Heading(
                title=title,
                level=size_to_level[size],
                page=page,
                offset=idx,
            ))
            search_start = idx + len(title)

        if not headings:
            return self._fallback_pages(page_results)

        # 6) 헤딩 사이 텍스트 추출
        sections: list[Section] = []
        for i, h in enumerate(headings):
            content_start = h.offset
            content_end = headings[i + 1].offset if i + 1 < len(headings) else len(full_text)
            content = full_text[content_start:content_end].strip()

            end_page = self._offset_to_page(content_end - 1, page_offsets)

            sections.append(Section(
                title=h.title,
                level=h.level,
                content=content,
                start_page=h.page,
                end_page=end_page,
            ))

        return sections

    def _fallback_pages(self, page_results: list[PageResult]) -> list[Section]:
        """폰트 크기 차이가 없을 때 페이지 단위 fallback."""
        sections: list[Section] = []
        for pr in page_results:
            text = pr.markdown.strip()
            if not text:
                continue
            # 첫 번째 의미 있는 줄을 제목으로
            title = f"Page {pr.page_number}"
            for line in text.split("\n"):
                line = line.strip()
                if line and not line.startswith("![") and len(line) > 2:
                    title = line[:80]
                    break

            sections.append(Section(
                title=title,
                level=1,
                content=text,
                start_page=pr.page_number,
                end_page=pr.page_number,
            ))
        return sections

    def _offset_to_page(self, offset: int, page_offsets: list[tuple[int, int, int]]) -> int:
        for start, end, page_num in page_offsets:
            if start <= offset < end:
                return page_num
        return page_offsets[-1][2] if page_offsets else 1
