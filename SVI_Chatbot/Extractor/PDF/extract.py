"""
PDF 텍스트/테이블/이미지 추출 CLI

Usage:
    python extract.py data/sample.pdf
    python extract.py data/sample.pdf --output-dir ./out
    python extract.py data/sample.pdf --format chunks
    python extract.py data/sample.pdf --format both
"""

import argparse
import json
from pathlib import Path

from src.extractor import PDFExtractor
from src.structure_parser import StructureParser
from src.chunker import PDFChunker


def print_progress(current: int, total: int, result):
    tables = len(result.tables)
    images = len(result.images)
    print(f"  [{current:2d}/{total}] Page {result.page_number:2d} - tables: {tables}, images: {images}")


def main():
    parser = argparse.ArgumentParser(description="PDF Extractor for RAG")
    parser.add_argument("pdf_path", help="PDF file path")
    parser.add_argument("--output-dir", default="./output")
    parser.add_argument("--format", choices=["markdown", "chunks", "both"], default="both")
    parser.add_argument("--chunk-size", type=int, default=1000)
    parser.add_argument("--chunk-overlap", type=int, default=200)
    args = parser.parse_args()

    pdf_path = Path(args.pdf_path)
    if not pdf_path.exists():
        print(f"Error: file not found - {pdf_path}")
        return

    output_dir = Path(args.output_dir)
    source_name = pdf_path.stem
    print(f"PDF: {pdf_path}")
    print(f"Output: {output_dir}")
    print()

    # 1) 추출
    extractor = PDFExtractor(str(pdf_path), str(output_dir))
    print(f"Extracting {extractor.total_pages} pages...")
    results = extractor.extract_all(progress_callback=print_progress)
    extractor.close()
    print()

    # 2) 구조 파싱
    print("Parsing document structure...")
    struct_parser = StructureParser(str(pdf_path))
    sections = struct_parser.parse(results)
    print(f"  -> {len(sections)} sections detected")
    for sec in sections[:20]:  # 처음 20개만 표시
        indent = "  " * sec.level
        print(f"    {indent}[L{sec.level}] {sec.title[:60]} (p.{sec.start_page}-{sec.end_page})")
    if len(sections) > 20:
        print(f"    ... and {len(sections) - 20} more")
    print()

    # 3) 청킹
    chunker = PDFChunker(chunk_size=args.chunk_size, chunk_overlap=args.chunk_overlap)
    if sections:
        chunks = chunker.chunk_by_sections(sections, results, source=source_name)
    else:
        print("  No sections found - falling back to page-based chunking")
        chunks = chunker.chunk_by_pages(results, source=source_name)
    print(f"  -> {len(chunks)} chunks created")

    # 4) 저장
    if args.format in ("chunks", "both"):
        chunks_path = output_dir / "chunks" / f"{source_name}_chunks.json"
        chunks_path.parent.mkdir(parents=True, exist_ok=True)
        with open(chunks_path, "w", encoding="utf-8") as f:
            json.dump([c.model_dump() for c in chunks], f, ensure_ascii=False, indent=2)
        print(f"  -> Chunks saved: {chunks_path}")

    if args.format in ("markdown", "both"):
        md_path = output_dir / "markdown" / f"{source_name}.md"
        md_path.parent.mkdir(parents=True, exist_ok=True)
        full_md = "\n\n---\n\n".join(r.markdown for r in results)
        md_path.write_text(full_md, encoding="utf-8")
        print(f"  -> Markdown saved: {md_path}")

    print("\nDone!")


if __name__ == "__main__":
    main()
