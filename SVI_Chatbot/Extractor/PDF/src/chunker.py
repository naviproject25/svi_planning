"""RAG용 범용 청킹 - 섹션 기반 + 크기 기반 하이브리드"""

from __future__ import annotations

import hashlib
import re
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter

from .models import Chunk, PageResult, Section, TableData


MAX_CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# 한국어 + 일반 구분자
_KOREAN_SEPARATORS = [
    "\n\n",
    "\n",
    " ",
    ".",
    ",",
    "\u200b",   # Zero-width space
    "\uff0c",   # Fullwidth comma
    "\u3001",   # Ideographic comma
    "\uff0e",   # Fullwidth full stop
    "\u3002",   # Ideographic full stop
    "",
]


class PDFChunker:
    """범용 PDF 청킹."""

    def __init__(
        self,
        chunk_size: int = MAX_CHUNK_SIZE,
        chunk_overlap: int = CHUNK_OVERLAP,
    ):
        self.chunk_size = chunk_size
        self.splitter = RecursiveCharacterTextSplitter(
            separators=_KOREAN_SEPARATORS,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
        )

    def chunk_by_sections(
        self,
        sections: list[Section],
        page_results: list[PageResult],
        source: str = "",
    ) -> list[Chunk]:
        """섹션 기반 청킹 (구조 파서 결과 활용)."""
        chunks: list[Chunk] = []

        for sec_idx, section in enumerate(sections):
            base_meta = {
                "section_title": section.title,
                "section_level": section.level,
                "start_page": section.start_page,
                "end_page": section.end_page,
                "source": source,
            }

            text = section.content.strip()
            if not text:
                continue

            if len(text) <= self.chunk_size:
                chunks.append(
                    Chunk(
                        id=_make_id(source, sec_idx, 0),
                        content=text,
                        metadata=base_meta,
                        token_count=_approx_tokens(text),
                    )
                )
            else:
                sub_texts = self.splitter.split_text(text)
                for idx, sub in enumerate(sub_texts):
                    chunks.append(
                        Chunk(
                            id=_make_id(source, sec_idx, idx),
                            content=sub,
                            metadata={**base_meta, "sub_chunk_index": idx},
                            token_count=_approx_tokens(sub),
                        )
                    )

        # 테이블 별도 청크
        for pr in page_results:
            for t_idx, table in enumerate(pr.tables):
                md = _table_to_markdown(table)
                if not md.strip():
                    continue
                chunks.append(
                    Chunk(
                        id=_make_id(source, f"table_p{pr.page_number}", t_idx),
                        content=md,
                        metadata={
                            "element_type": "table",
                            "page": pr.page_number,
                            "source": source,
                        },
                        token_count=_approx_tokens(md),
                    )
                )

        return chunks

    def chunk_by_pages(
        self,
        page_results: list[PageResult],
        source: str = "",
    ) -> list[Chunk]:
        """페이지 단위 청킹 (구조 파싱 없이)."""
        chunks: list[Chunk] = []
        for pr in page_results:
            text = pr.markdown.strip()
            if not text:
                continue

            meta = {
                "page": pr.page_number,
                "source": source,
            }

            if len(text) <= self.chunk_size:
                chunks.append(
                    Chunk(
                        id=_make_id(source, "page", pr.page_number),
                        content=text,
                        metadata=meta,
                        token_count=_approx_tokens(text),
                    )
                )
            else:
                sub_texts = self.splitter.split_text(text)
                for idx, sub in enumerate(sub_texts):
                    chunks.append(
                        Chunk(
                            id=_make_id(source, f"page{pr.page_number}", idx),
                            content=sub,
                            metadata={**meta, "sub_chunk_index": idx},
                            token_count=_approx_tokens(sub),
                        )
                    )

            # 테이블 별도 청크
            for t_idx, table in enumerate(pr.tables):
                md = _table_to_markdown(table)
                if not md.strip():
                    continue
                chunks.append(
                    Chunk(
                        id=_make_id(source, f"table_p{pr.page_number}", t_idx),
                        content=md,
                        metadata={
                            "element_type": "table",
                            "page": pr.page_number,
                            "source": source,
                        },
                        token_count=_approx_tokens(md),
                    )
                )

        return chunks


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def _make_id(source: str, section: object, idx: int) -> str:
    raw = f"{source}_{section}_{idx}"
    return hashlib.md5(raw.encode()).hexdigest()[:12]


def _approx_tokens(text: str) -> int:
    """대략적인 토큰 수 추정."""
    return max(1, len(text) // 2)


def _table_to_markdown(table: TableData) -> str:
    if not table.headers:
        return ""
    header_line = "| " + " | ".join(table.headers) + " |"
    separator = "| " + " | ".join(["---"] * len(table.headers)) + " |"
    rows = ["| " + " | ".join(row) + " |" for row in table.rows]
    return "\n".join([header_line, separator] + rows)
