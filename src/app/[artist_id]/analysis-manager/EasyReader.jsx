'use client';

import React from 'react';
import { FaRss } from 'react-icons/fa';
import { safeLangValue } from '../../../script/convertLang';

/** HTML/텍스트 특수문자 이스케이프 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 블록 하나를 "논문 스타일" HTML로 변환하는 함수
 */
function blockToHTML(block, idx, locale) {
  const { type } = block;

  switch (type) {
    case 'SectionTitle': {
      // block: { src, text: { ko, en } }
      const heading = safeLangValue(block.text, locale) || `Section ${idx + 1}`;
      const imageSrc = block.src || '';
      return `
        <div class="paper-block section-title-block">
          ${
            imageSrc
              ? `<img src="${escapeHtml(imageSrc)}" alt="Section Image" class="paper-section-image" />`
              : ''
          }
          <h1 class="paper-section-title">${escapeHtml(heading)}</h1>
        </div>
      `;
    }

    // 블록: Title → H2
    case 'Title': {
      const heading = safeLangValue(block.text, locale) || `Block #${idx + 1}`;
      return `
        <div class="paper-block paper-title-block">
          <h2>${escapeHtml(heading)}</h2>
        </div>
      `;
    }

    // 블록: Subtitle → H3
    case 'Subtitle': {
      const subtitle = safeLangValue(block.text, locale) || `Block #${idx + 1}`;
      return `
        <div class="paper-block paper-subtitle-block">
          <h3>${escapeHtml(subtitle)}</h3>
        </div>
      `;
    }

    // 블록: Text
    case 'Text': {
      // { content: {ko, en} } or string
      const content = safeLangValue(block.content, locale);
      return `
        <div class="paper-block paper-text-block">
          <p>${escapeHtml(content)}</p>
        </div>
      `;
    }

    // 블록: Gallery
    case 'Gallery': {
      const images = Array.isArray(block.images) ? block.images : [];
      const galleryItems = images
        .map((img, i) => {
          const src = img.src || '';
          const alt = img.alt || `Gallery Image ${i + 1}`;
          return `
            <div class="paper-gallery-item">
              <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="paper-gallery-image"/>
            </div>
          `;
        })
        .join('');
      return `
        <div class="paper-block paper-gallery-block">
          <div class="paper-gallery-container">
            ${galleryItems}
          </div>
        </div>
      `;
    }

    // 블록: Image
    case 'Image': {
      const src = block.src || '';
      const alt = safeLangValue(block.alt, locale) || `Image ${idx + 1}`;
      return `
        <div class="paper-block paper-image-block">
          <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="paper-single-image"/>
        </div>
      `;
    }

    // (추가 예시) case 'Blockquote', 'List', 'Video', etc...

    default:
      return `
        <div class="paper-block paper-unknown-block">
          <p><em>Unsupported block type: ${escapeHtml(type)}</em></p>
        </div>
      `;
  }
}

/**
 * 전체 블록 배열을 하나의 "논문 스타일" HTML로 합치는 함수
 */
function generateAcademicPaperView(blocks, locale, reportData) {
  // 문서 상단 타이틀(예: artist 명)
  const paperTitle =
    locale === 'ko'
      ? `History for ${reportData?.artist_kor || 'Artist'}`
      : `History for ${reportData?.artist_eng || 'Artist'}`;

  const today = new Date().toLocaleDateString();

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(paperTitle)}</title>
  <style>
    /* ========== 전체 문서 스타일 (논문 느낌) ========== */
    @page {
      margin: 2cm;
    }

    body {
      font-family: 'Times New Roman', serif;
      background: #ffffff;
      color: #000000;
      margin: 2cm 3cm; /* 화면 표시용. 인쇄 시는 @page 우선 */
      line-height: 1.8; /* 줄 간격 조금 넉넉히 */
      text-align: justify; /* 양쪽 정렬 → 논문 느낌 */
    }

    h1, h2, h3 {
      font-weight: bold;
      margin-top: 1.2em;
      margin-bottom: 0.5em;
    }
    h1 {
      font-size: 1.6em;
      text-align: center;
      margin-bottom: 0.8em;
    }
    h2 {
      font-size: 1.3em;
    }
    h3 {
      font-size: 1.1em;
    }

    p {
      text-indent: 2em;
      margin-bottom: 1em;
      font-size: 1.0em;
    }

    /* 헤더 영역 */
    .paper-header {
      text-align: center;
      margin-bottom: 2em;
    }
    .paper-header .paper-author {
      font-size: 1.0em;
      color: #333;
    }
    .paper-header .paper-date {
      font-size: 0.9em;
      color: #666;
      margin-top: 0.5em;
    }

    /* 각 블록 간 여백 */
    .paper-block {
      margin-bottom: 1.5em;
    }

    /* SectionTitle 전용 */
    .paper-section-image {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      margin-bottom: 0.5em;
      display: block;
    }
    .paper-section-title {
      font-size: 1.4em;
      text-align: center;
      margin-bottom: 0.5em;
    }

    /* Gallery */
    .paper-gallery-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5em;
      justify-content: center;
    }
    .paper-gallery-item {
      flex: 0 0 auto;
    }
    .paper-gallery-image {
      width: 150px;
      height: 100px;
      object-fit: cover;
      border: 1px solid #ccc;
    }

    .paper-single-image {
      display: block;
      margin: 0.5em auto;
      max-width: 80%;
      border: 1px solid #ccc;
    }

    /* 인쇄 모드에서 하단에 페이지 번호 표시 (옵션) */
    @media print {
      body {
        margin: 0;
      }
      @page {
        margin: 2cm;
      }
      body::after {
        content: counter(page);
        position: fixed;
        bottom: 1cm;
        right: 1cm;
        font-size: 0.8em;
        color: #666;
      }
    }
  </style>
</head>
<body>
  <div class="paper-header">
    <h1>${escapeHtml(paperTitle)}</h1>
    <div class="paper-author">Remu Report</div>
    <div class="paper-date">Date: ${escapeHtml(today)}</div>
  </div>
`;

  // 본문(블록들)
  blocks.forEach((block, idx) => {
    html += blockToHTML(block, idx, locale);
  });

  html += `
</body>
</html>
`;
  return html;
}

/**
 * EasyReader 컴포넌트
 * - props.data: 블록 배열
 * - props.locale: ko/en
 * - props.reportData: { artist_kor, artist_eng, ... }
 *
 * 화면에 "논문 보기" 버튼을 보여주고, 클릭 시 새 탭에 논문 스타일 HTML 렌더링
 */
export default function EasyReader({ data = [], locale = 'ko', reportData = {} }) {
  const handleOpenPaperView = () => {
    // HTML 문자열 생성
    const paperHtml = generateAcademicPaperView(data, locale, reportData);

    // Blob 생성 → 새 탭으로 열기
    const blob = new Blob([paperHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="my-4 flex items-center justify-end">
      <button
        onClick={handleOpenPaperView}
        className="text-white"
      >
        <FaRss />
      </button>
    </div>
  );
}

