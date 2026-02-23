"""
PDF Extraction Viewer - Streamlit

Run: streamlit run app.py
"""

import hashlib
import json
from pathlib import Path

import pandas as pd
import pymupdf
import pymupdf4llm
import pdfplumber
import streamlit as st

from src.extractor import PDFExtractor
from src.structure_parser import StructureParser
from src.chunker import PDFChunker
from src.models import Chunk

st.set_page_config(
    page_title="PDF Extractor",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded",
)


# ------------------------------------------------------------------
# Caching
# ------------------------------------------------------------------

@st.cache_resource
def load_pdf(path: str):
    return pymupdf.open(path)


@st.cache_data
def render_page(pdf_path: str, page_index: int, zoom: float = 2.0) -> bytes:
    doc = pymupdf.open(pdf_path)
    page = doc[page_index]
    mat = pymupdf.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    data = pix.tobytes("png")
    doc.close()
    return data


@st.cache_data
def extract_page_markdown(pdf_path: str, page_index: int) -> str:
    md = pymupdf4llm.to_markdown(
        doc=pdf_path,
        pages=[page_index],
        hdr_info=False,
        ignore_code=True,
    )
    # Fallback: markdown 추출 빈약 시 raw text 사용
    doc = pymupdf.open(pdf_path)
    raw = doc[page_index].get_text()
    doc.close()
    if raw.strip() and len(md.strip()) < len(raw.strip()) * 0.3:
        lines = [l.strip() for l in raw.split("\n")]
        md = "\n\n".join(l for l in lines if l)
    return md


@st.cache_data
def extract_page_pypdf(pdf_path: str, page_index: int) -> str:
    """PyPDFLoader 방식 - pypdf로 페이지 텍스트 추출."""
    from pypdf import PdfReader
    reader = PdfReader(pdf_path)
    if page_index < len(reader.pages):
        return reader.pages[page_index].extract_text() or ""
    return ""


@st.cache_data
def extract_page_tables(pdf_path: str, page_index: int) -> list[dict]:
    tables = []
    with pdfplumber.open(pdf_path) as pdf:
        if page_index < len(pdf.pages):
            page = pdf.pages[page_index]
            for t in page.find_tables():
                raw = t.extract()
                if raw and len(raw) >= 2:
                    tables.append({
                        "headers": [c or "" for c in raw[0]],
                        "rows": [[c or "" for c in row] for row in raw[1:]],
                    })
    return tables


# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------

def main():
    st.title("PDF Extraction Viewer")

    # --- Sidebar ---
    with st.sidebar:
        st.header("Settings")

        # 파일 업로드 또는 경로 입력
        upload_mode = st.radio("PDF source", ["File path", "Upload"], horizontal=True)

        pdf_path = None
        if upload_mode == "Upload":
            uploaded = st.file_uploader("Upload PDF", type=["pdf"])
            if uploaded:
                # 임시 저장
                tmp_path = Path("data") / uploaded.name
                tmp_path.parent.mkdir(parents=True, exist_ok=True)
                tmp_path.write_bytes(uploaded.read())
                pdf_path = str(tmp_path)
        else:
            pdf_path = st.text_input("PDF file path", value="")
            # data 폴더 내 PDF 자동 탐색
            data_dir = Path("data")
            if data_dir.exists():
                pdfs = list(data_dir.glob("*.pdf"))
                if pdfs:
                    selected = st.selectbox(
                        "or select from data/",
                        ["(manual input)"] + [str(p) for p in pdfs],
                    )
                    if selected != "(manual input)":
                        pdf_path = selected

        if not pdf_path or not Path(pdf_path).exists():
            st.info("PDF file path or upload a file to start.")
            return

        doc = load_pdf(pdf_path)
        total_pages = len(doc)

        st.markdown(f"**Pages**: {total_pages}")
        st.markdown(f"**File**: {Path(pdf_path).name}")

        st.divider()
        mode = st.radio(
            "Extraction Mode",
            ["Custom (pymupdf4llm + pdfplumber)", "LangChain (PyPDFLoader)"],
            horizontal=True,
            key="extraction_mode",
        )

        page_num = st.slider("Page", 1, total_pages, 1, key="page_slider")

        st.divider()
        zoom = st.slider("Zoom", 1.0, 3.0, 2.0, 0.5)

        st.divider()
        extract_all_btn = st.button(
            "Extract All Pages", type="primary", use_container_width=True
        )

    # --- Main area: side-by-side ---
    col_pdf, col_parsed = st.columns([1, 1], gap="medium")
    page_idx = page_num - 1

    with col_pdf:
        st.subheader(f"PDF - Page {page_num}/{total_pages}")
        img_bytes = render_page(pdf_path, page_idx, zoom)
        st.image(img_bytes, use_container_width=True)

    is_langchain = mode.startswith("LangChain")

    with col_parsed:
        st.subheader("Extracted")

        first_tab = "PyPDFLoader" if is_langchain else "Markdown"
        tab_md, tab_raw, tab_tables, tab_images = st.tabs(
            [first_tab, "Raw Text", "Tables", "Images"]
        )

        with tab_md:
            if is_langchain:
                lc_text = extract_page_pypdf(pdf_path, page_idx)
                st.text_area("PyPDFLoader", lc_text, height=600, label_visibility="collapsed")
            else:
                md_text = extract_page_markdown(pdf_path, page_idx)
                st.markdown(md_text)

        with tab_raw:
            page = doc[page_idx]
            raw_text = page.get_text()
            st.text_area("Raw Text", raw_text, height=600, label_visibility="collapsed")

        with tab_tables:
            tables = extract_page_tables(pdf_path, page_idx)
            if tables:
                for idx, t in enumerate(tables):
                    st.markdown(f"**Table {idx + 1}**")
                    df = pd.DataFrame(t["rows"], columns=t["headers"])
                    st.dataframe(df, use_container_width=True)
            else:
                st.info("No tables on this page.")

        with tab_images:
            page_obj = doc[page_idx]
            img_list = page_obj.get_images()
            shown = 0
            for img_idx, img in enumerate(img_list):
                xref = img[0]
                try:
                    base_img = doc.extract_image(xref)
                except Exception:
                    continue
                if base_img and base_img["width"] > 50 and base_img["height"] > 50:
                    st.image(
                        base_img["image"],
                        caption=f"Image {img_idx + 1} ({base_img['width']}x{base_img['height']})",
                    )
                    shown += 1
            if shown == 0:
                st.info("No significant images on this page.")

    # --- Full extraction ---
    if extract_all_btn:
        st.divider()
        st.subheader("Full Extraction")

        source_name = Path(pdf_path).stem
        progress_bar = st.progress(0)
        status_text = st.empty()
        log_area = st.empty()

        if is_langchain:
            # ============================================================
            # LangChain Mode: PyPDFLoader + RecursiveCharacterTextSplitter
            # ============================================================
            from langchain_community.document_loaders import PyPDFLoader
            from langchain_text_splitters import RecursiveCharacterTextSplitter

            status_text.markdown("**PyPDFLoader - loading...**")
            loader = PyPDFLoader(pdf_path)
            docs = loader.load()
            progress_bar.progress(0.5)

            log_lines = []
            for doc_item in docs:
                pg = doc_item.metadata.get("page", 0) + 1
                log_lines.append(f"Page {pg:2d}: {len(doc_item.page_content)} chars")
            log_area.code("\n".join(log_lines), language=None)

            status_text.markdown("**RecursiveCharacterTextSplitter - chunking...**")
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
            )
            split_docs = splitter.split_documents(docs)

            chunks = []
            for i, sd in enumerate(split_docs):
                chunks.append(Chunk(
                    id=hashlib.md5(f"{source_name}_{i}".encode()).hexdigest()[:12],
                    content=sd.page_content,
                    metadata=sd.metadata,
                    token_count=max(1, len(sd.page_content) // 2),
                ))

            progress_bar.progress(1.0)
            st.success(f"Done! {len(docs)} pages, {len(chunks)} chunks (LangChain)")

            full_text = "\n\n---\n\n".join(d.page_content for d in docs)
            sections = []

        else:
            # ============================================================
            # Custom Mode: pymupdf4llm + pdfplumber + StructureParser
            # ============================================================
            extractor = PDFExtractor(pdf_path)
            all_results = []
            log_lines = []

            for pi in range(extractor.total_pages):
                result = extractor.extract_page(pi)
                all_results.append(result)

                pct = (pi + 1) / extractor.total_pages
                progress_bar.progress(pct)
                status_text.markdown(
                    f"**[{pi + 1}/{extractor.total_pages}]** "
                    f"Page {result.page_number} - "
                    f"tables: {len(result.tables)}, images: {len(result.images)}"
                )
                log_lines.append(
                    f"Page {result.page_number:2d}: tables {len(result.tables)}, images {len(result.images)}"
                )
                log_area.code("\n".join(log_lines), language=None)

            extractor.close()

            # 구조 파싱 + 청킹
            status_text.markdown("**Parsing structure & chunking...**")
            struct_parser = StructureParser(pdf_path)
            sections = struct_parser.parse(all_results)

            chunker = PDFChunker()
            if sections:
                chunks = chunker.chunk_by_sections(sections, all_results, source=source_name)
            else:
                chunks = chunker.chunk_by_pages(all_results, source=source_name)

            progress_bar.progress(1.0)
            st.success(f"Done! {len(sections)} sections, {len(chunks)} chunks")

            full_text = "\n\n---\n\n".join(r.markdown for r in all_results)

        # 섹션 요약 (Custom 모드만)
        if sections:
            st.subheader("Document Structure")
            for sec in sections:
                indent = "--" * (sec.level - 1)
                label = f"{indent} {sec.title} (p.{sec.start_page}-{sec.end_page})"
                with st.expander(label):
                    display = sec.content[:500] + "..." if len(sec.content) > 500 else sec.content
                    st.text(display)

        # 다운로드
        st.subheader("Export")
        col_dl1, col_dl2 = st.columns(2)

        with col_dl1:
            chunks_json = json.dumps(
                [c.model_dump() for c in chunks],
                ensure_ascii=False,
                indent=2,
            )
            st.download_button(
                "RAG Chunks (JSON)",
                chunks_json,
                f"{source_name}_chunks.json",
                mime="application/json",
                use_container_width=True,
            )

        with col_dl2:
            st.download_button(
                "Full Text",
                full_text,
                f"{source_name}.md",
                mime="text/markdown",
                use_container_width=True,
            )


if __name__ == "__main__":
    main()
