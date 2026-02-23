"""PDF 추출 엔진 — PyMuPDF4LLM (텍스트) + pdfplumber (테이블) 2-패스"""

from __future__ import annotations

from pathlib import Path
from typing import Callable

import pymupdf
import pymupdf4llm
import pdfplumber

from .models import (
    ImageData,
    PageElement,
    PageResult,
    TableData,
    ElementType,
)


class PDFExtractor:
    """PDF에서 텍스트, 테이블, 이미지를 추출한다."""

    def __init__(self, pdf_path: str, output_dir: str = "./output"):
        self.pdf_path = Path(pdf_path)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        (self.output_dir / "images").mkdir(parents=True, exist_ok=True)

        self.doc = pymupdf.open(str(self.pdf_path))
        self.total_pages = len(self.doc)

    # ------------------------------------------------------------------
    # Public
    # ------------------------------------------------------------------

    def extract_all(
        self,
        progress_callback: Callable[[int, int, PageResult], None] | None = None,
    ) -> list[PageResult]:
        """전체 페이지 추출. callback(현재, 전체, 결과)로 실시간 진행 표시."""
        results: list[PageResult] = []
        for page_idx in range(self.total_pages):
            result = self.extract_page(page_idx)
            results.append(result)
            if progress_callback:
                progress_callback(page_idx + 1, self.total_pages, result)
        return results

    def extract_page(self, page_index: int) -> PageResult:
        """단일 페이지 추출 (뷰어에서 페이지 전환 시 호출)."""
        # Pass 1: PyMuPDF4LLM → Markdown
        md_text = pymupdf4llm.to_markdown(
            doc=str(self.pdf_path),
            pages=[page_index],
            hdr_info=False,
            ignore_code=True,
            write_images=True,
            image_path=str(self.output_dir / "images"),
            image_format="png",
            dpi=200,
            image_size_limit=0.02,
        )

        # Raw text
        page = self.doc[page_index]
        raw_text = page.get_text()

        # Pass 2: pdfplumber → 테이블
        tables = self._extract_tables(page_index)

        # Fallback: markdown 추출이 빈약하면 raw text + 테이블 마크다운으로 보완
        md_stripped = md_text.strip()
        raw_stripped = raw_text.strip()
        if raw_stripped and len(md_stripped) < len(raw_stripped) * 0.3:
            md_text = self._build_fallback_markdown(raw_text, tables)

        # 이미지 추출
        images = self._extract_images(page_index)

        # 요소 목록 (뷰어 시각화용)
        elements = self._build_elements(page_index, raw_text, tables, images)

        return PageResult(
            page_number=page_index + 1,
            markdown=md_text,
            raw_text=raw_text,
            tables=tables,
            images=images,
            elements=elements,
        )

    def render_page(self, page_index: int, zoom: float = 2.0) -> bytes:
        """PDF 페이지를 PNG 바이트로 렌더링 (뷰어 좌측 패널용)."""
        page = self.doc[page_index]
        mat = pymupdf.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)
        return pix.tobytes("png")

    def close(self):
        self.doc.close()

    # ------------------------------------------------------------------
    # Private
    # ------------------------------------------------------------------

    def _build_fallback_markdown(
        self, raw_text: str, tables: list[TableData]
    ) -> str:
        """pymupdf4llm 추출 실패 시 raw text + 테이블로 markdown 구성."""
        parts: list[str] = []

        # 테이블을 markdown으로 변환
        table_markdowns = [_table_to_markdown(t) for t in tables if t.headers]

        # raw text를 정리하여 markdown으로
        lines = raw_text.split("\n")
        cleaned: list[str] = []
        for line in lines:
            line = line.strip()
            if not line:
                if cleaned and cleaned[-1] != "":
                    cleaned.append("")
                continue
            cleaned.append(line)

        parts.append("\n".join(cleaned))

        # 테이블 추가
        for tmd in table_markdowns:
            parts.append("\n\n" + tmd)

        return "\n".join(parts)

    def _extract_tables(self, page_index: int) -> list[TableData]:
        """pdfplumber로 테이블 추출 (merged cell 처리 우수)."""
        results: list[TableData] = []
        with pdfplumber.open(str(self.pdf_path)) as pdf:
            if page_index >= len(pdf.pages):
                return results
            page = pdf.pages[page_index]

            found = page.find_tables()
            for table_obj in found:
                raw = table_obj.extract()
                if not raw or len(raw) < 2:
                    continue
                headers = [cell or "" for cell in raw[0]]
                rows = [[cell or "" for cell in row] for row in raw[1:]]
                bbox = tuple(table_obj.bbox) if table_obj.bbox else None
                results.append(
                    TableData(
                        headers=headers,
                        rows=rows,
                        page=page_index + 1,
                        bbox=bbox,
                    )
                )
        return results

    def _extract_images(self, page_index: int) -> list[ImageData]:
        """PyMuPDF로 이미지 추출 (작은 아이콘 필터링)."""
        page = self.doc[page_index]
        image_list = page.get_images()
        results: list[ImageData] = []

        for img_idx, img in enumerate(image_list):
            xref = img[0]
            try:
                base_image = self.doc.extract_image(xref)
            except Exception:
                continue
            if not base_image:
                continue

            w, h = base_image["width"], base_image["height"]
            # 50x50 미만 아이콘 스킵
            if w < 50 or h < 50:
                continue

            ext = base_image.get("ext", "png")
            filename = f"page{page_index + 1}_img{img_idx + 1}.{ext}"
            img_path = self.output_dir / "images" / filename
            img_path.write_bytes(base_image["image"])

            results.append(
                ImageData(
                    filename=filename,
                    page=page_index + 1,
                    width=w,
                    height=h,
                )
            )
        return results

    def _build_elements(
        self,
        page_index: int,
        raw_text: str,
        tables: list[TableData],
        images: list[ImageData],
    ) -> list[PageElement]:
        """페이지 내 감지된 요소 목록 생성."""
        elements: list[PageElement] = []

        # 텍스트 블록
        page = self.doc[page_index]
        blocks = page.get_text("dict")["blocks"]
        for block in blocks:
            if block["type"] == 0:  # text block
                text = ""
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        text += span.get("text", "")
                    text += "\n"
                text = text.strip()
                if text:
                    bbox = tuple(block["bbox"])
                    elements.append(
                        PageElement(
                            type=ElementType.TEXT,
                            content=text,
                            page=page_index + 1,
                            bbox=bbox,
                        )
                    )

        # 테이블
        for table in tables:
            md_table = _table_to_markdown(table)
            elements.append(
                PageElement(
                    type=ElementType.TABLE,
                    content=md_table,
                    page=page_index + 1,
                    bbox=table.bbox,
                )
            )

        # 이미지
        for img in images:
            elements.append(
                PageElement(
                    type=ElementType.IMAGE,
                    content=img.filename,
                    page=page_index + 1,
                    bbox=img.bbox,
                )
            )

        return elements


def _table_to_markdown(table: TableData) -> str:
    """TableData → Markdown 테이블 문자열."""
    if not table.headers:
        return ""
    header_line = "| " + " | ".join(table.headers) + " |"
    separator = "| " + " | ".join(["---"] * len(table.headers)) + " |"
    rows = ["| " + " | ".join(row) + " |" for row in table.rows]
    return "\n".join([header_line, separator] + rows)
