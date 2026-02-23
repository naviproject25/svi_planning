"""PDF 추출 결과 데이터 모델"""

from __future__ import annotations

from enum import Enum
from pydantic import BaseModel


class ElementType(str, Enum):
    TEXT = "text"
    TABLE = "table"
    IMAGE = "image"
    HEADING = "heading"


class TableData(BaseModel):
    headers: list[str]
    rows: list[list[str]]
    page: int
    bbox: tuple[float, float, float, float] | None = None


class ImageData(BaseModel):
    filename: str
    page: int
    width: int
    height: int
    bbox: tuple[float, float, float, float] | None = None


class PageElement(BaseModel):
    type: ElementType
    content: str
    page: int
    bbox: tuple[float, float, float, float] | None = None


class PageResult(BaseModel):
    page_number: int  # 1-indexed
    markdown: str
    raw_text: str = ""
    tables: list[TableData] = []
    images: list[ImageData] = []
    elements: list[PageElement] = []


class Section(BaseModel):
    """문서 내 자동 탐지된 섹션."""
    title: str
    level: int = 1  # 헤딩 레벨 (1=대제목, 2=중제목, ...)
    content: str = ""
    start_page: int = 0
    end_page: int = 0


class Chunk(BaseModel):
    id: str
    content: str
    metadata: dict = {}
    token_count: int | None = None
