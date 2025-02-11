// src/app/[artist_id]/analysis-manager/BlocksRenderer.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  FaLink,
  FaDownload,
  FaQuoteLeft,
  FaList,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaTimes,
} from 'react-icons/fa';

import { safeLangMapper, safeLangValue } from '../../../script/convertLang';

// 간단한 undefined 방지용 함수
const safeText = (text) => text || '';

// 배열 안전 처리 함수
const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

/* --------------------------------------------------------------------------
   헬퍼 컴포넌트: Section & Title
   globals.css의 .section-base, .border-gradient-b, .text-gradient 등 적용
-------------------------------------------------------------------------- */
const Section = ({ children, className = '' }) => (
  <section
    className={`section-base ${className}`}
    role="region"
    aria-label="Content Section"
  >
    {children}
  </section>
);

const Title = ({ level, children, gradient = false, Icon }) => {
  const Tag = `h${level}`;
  const baseClasses =
    'font-bold flex items-center pb-1 transition-all duration-300';
  const levelClasses = {
    1: 'text-6xl mt-8 mb-2 pb-4 border-b-2 border-gradient-b text-[var(--primary)] text-glow',
    2: 'text-4xl mt-16 mb-2 text-[var(--primary)] text-outline purple-text-glow-5',
    3: 'text-xl mt-6 mb-1 text-[rgba(139,92,246,1)]',
  };
  const gradientClass = gradient ? 'text-gradient' : '';
  return (
    <Tag
      className={`${baseClasses} ${levelClasses[level] || ''} ${gradientClass}`}
      tabIndex="0"
    >
      {Icon && <Icon className="mr-2 inline-block" />}
      {children}
    </Tag>
  );
};

/* --------------------------------------------------------------------------
   Gallery 컴포넌트 (이미지 갤러리 + 전체 화면 라이트박스)
   globals.css의 애니메이션, 전환, 그림자 효과 활용
-------------------------------------------------------------------------- */
const Gallery = ({ images }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const lightboxRef = useRef(null);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const showNext = useCallback(() => {
    if (images.length && lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev + 1) % images.length);
    }
  }, [images, lightboxIndex]);

  const showPrev = useCallback(() => {
    if (images.length && lightboxIndex !== null) {
      setLightboxIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  }, [images, lightboxIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex !== null) {
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowRight') showNext();
        else if (e.key === 'ArrowLeft') showPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  const currentImage =
    lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <>
      <div
        className="my-8 transition-all duration-300"
        role="region"
        aria-label="Advanced Image Gallery"
      >
        {images && images.length > 0 ? (
          <div
            className="px-4 grid gap-2 items-center justify-items-center w-full"
            style={{
              gridTemplateColumns: `repeat(${Math.min(
                images.length,
                3
              )}, minmax(0, 1fr))`,
            }}
          >
            {images.map((img, index) => (
              <button
                key={index}
                className="group relative w-full overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(59,130,246,1)] transition transform hover:scale-105"
                onClick={() => openLightbox(index)}
                aria-label={`Open image ${index + 1}`}
              >
                <div className="w-full h-40 bg-[rgba(229,231,235,1)] flex items-center justify-center overflow-hidden shadow-md transition-transform duration-300">
                  {img.src ? (
                    <img
                      src={img.src}
                      alt={img.alt || `Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-sm text-[var(--foreground-muted)]">
                      No Image Available
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-60 bg-[rgba(229,231,235,1)] text-[var(--text-secondary)]">
            No Images to Display
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.9)] flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Lightbox Image View"
        >
          <div className="relative max-w-3xl w-full">
            {/* 닫기 버튼 */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-3xl bg-[rgba(0,0,0,0.6)] rounded-full p-2 hover:bg-[rgba(0,0,0,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgba(59,130,246,1)] transition"
              aria-label="Close Lightbox"
            >
              <FaTimes />
            </button>
            {/* 이전/다음 버튼 */}
            {images.length > 1 && (
              <>
                <button
                  onClick={showPrev}
                  className="absolute top-1/2 left-4 transform -translate-y-1/2 text-3xl bg-[rgba(0,0,0,0.6)] rounded-full p-2 hover:bg-[rgba(0,0,0,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgba(59,130,246,1)] transition"
                  aria-label="Show Previous Image"
                >
                  <FaArrowLeft />
                </button>
                <button
                  onClick={showNext}
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 text-3xl bg-[rgba(0,0,0,0.6)] rounded-full p-2 hover:bg-[rgba(0,0,0,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgba(59,130,246,1)] transition"
                  aria-label="Show Next Image"
                >
                  <FaArrowRight />
                </button>
              </>
            )}
            <div className="flex items-center justify-center">
              {currentImage && currentImage.src ? (
                <img
                  src={currentImage.src}
                  alt={
                    currentImage.alt ||
                    `Lightbox image ${lightboxIndex + 1}`
                  }
                  className="max-h-[90vh] object-contain transition-transform duration-300 shadow-2xl"
                />
              ) : (
                <div className="text-[var(--foreground)]">
                  No Image Available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* --------------------------------------------------------------------------
   메인 BlocksRenderer 컴포넌트
   각 블록 타입마다 globals.css의 동적 효과, 그라데이션, 애니메이션 적용
-------------------------------------------------------------------------- */
const BlocksRenderer = ({ block, locale = 'ko' }) => {
  const { type, ...props } = block;

  switch (type) {
    case 'SectionTitle':
      return (
        <div
          className="my-4 transition-all"
          role="region"
          aria-label="Section Title Block"
        >
          {props.src && (
            <img
              src={props.src}
              alt={safeLangValue(props.alt, locale) || 'Section image'}
              className="w-full object-cover rounded-lg shadow-[0_8px_16px_rgba(0,0,0,0.4)] mb-4 hover:opacity-90 transition-all bg-animated-glow"
              loading="lazy"
            />
          )}
          <Title level={1} gradient>
            {safeLangValue(props.text, locale)}
          </Title>
        </div>
      );

    case 'Title':
      return (
        <div role="heading" aria-level="2" aria-label="Title Block">
          <Title level={2}>{safeLangValue(props.text, locale)}</Title>
        </div>
      );

    case 'Subtitle':
      return (
        <div role="heading" aria-level="3" aria-label="Subtitle Block">
          <Title level={3} gradient>
            ❐ {safeLangValue(props.text, locale)}
          </Title>
        </div>
      );

    case 'Text':
      return (
        <p
          className="text-sm font-normal mt-1 mb-4 text-[var(--text-primary)] transition-all tracking-wide leading-relaxed"
          role="text"
          aria-label="Text Block"
        >
          {safeLangValue(props.content, locale)}
        </p>
      );

    case 'Image':
      return (
        <div
          className="my-8 flex justify-center transition-all"
          role="img"
          aria-label="Image Block"
        >
          <img
            src={props.src || ''}
            alt={safeLangValue(props.alt, locale) || 'Image'}
            className="w-11/12 sm:w-3/4 object-cover rounded-lg shadow-[0_8px_16px_rgba(0,0,0,0.4)] hover:opacity-90 transition-all"
            loading="lazy"
          />
        </div>
      );

    case 'Video': {
      const extractYouTubeId = (url) => {
        if (!url) return null;
        const match = url.match(
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );
        return match ? match[1] : null;
      };
      const videoId = extractYouTubeId(props.src);
      return (
        <div
          className="video-container my-9 transition-all"
          role="region"
          aria-label="Video Block"
        >
          {videoId ? (
            <iframe
              className="w-11/12 h-60 mx-auto rounded-lg shadow-soft transition-transform transform focus:outline-none focus:ring-2 focus:ring-blue-500"
              src={`https://www.youtube.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded YouTube Video"
            ></iframe>
          ) : (
            <div className="w-11/12 mx-auto text-center text-gray-500 p-4 bg-gray-100 rounded">
              Invalid or Missing Video URL
            </div>
          )}
        </div>
      );
    }

    case 'List': {
      const ListIcon = props.ordered ? FaList : FaCheckCircle;
      let items = props.items;
      if (typeof items === 'object' && items !== null && !Array.isArray(items)) {
        items = items[locale] || [];
      } else if (!Array.isArray(items)) {
        items = [];
      }
      return (
        <div
          className="my-4 transition-all"
          role="list"
          aria-label="List Block"
        >
          <div className="flex items-center mb-2">
            <ListIcon
              className="inline-block mr-2 text-[rgba(139,92,246,1)] animate-pulse-soft"
              aria-hidden="true"
            />
            <span className="sr-only">
              {props.ordered ? 'Ordered List' : 'Unordered List'}
            </span>
          </div>
          {props.ordered ? (
            <ol className="list-decimal list-inside my-2 text-[var(--text-primary)]">
              {items.map((item, index) => (
                <li key={index} className="mb-1" role="listitem">
                  {item}
                </li>
              ))}
            </ol>
          ) : (
            <ul className="list-disc list-inside my-2 text-[var(--text-primary)]">
              {items.map((item, index) => (
                <li key={index} className="mb-1" role="listitem">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    case 'Blockquote': {
      const quoteText = safeLangValue(props.text, locale);
      const quoteCite = safeLangValue(props.cite, locale);
      return (
        <blockquote
          className="border-l-4 border-[rgba(139,92,246,1)] pl-4 italic my-6 text-[var(--text-secondary)] transition-all"
          role="quote"
          aria-label="Blockquote"
        >
          <FaQuoteLeft
            className="inline-block mr-2 text-[rgba(139,92,246,1)]"
            aria-hidden="true"
          />
          “{quoteText}”
          {quoteCite && (
            <cite className="block text-right text-sm text-[var(--foreground-muted)] mt-2">
              - {quoteCite}
            </cite>
          )}
        </blockquote>
      );
    }

    case 'Code':
      return (
        <div
          className="my-4 transition-all"
          role="region"
          aria-label="Code Block"
        >
          <pre
            className="bg-[var(--background-muted)] text-[var(--foreground)] p-4 rounded-lg overflow-auto shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-all"
            tabIndex="0"
          >
            <code className={`language-${safeText(props.language)}`}>
              {safeText(props.code)}
            </code>
          </pre>
        </div>
      );

    case 'Table': {
      const tableData = safeLangMapper(props.tableData, locale);
      if (tableData.length === 0) {
        return (
          <div className="my-8 text-center text-gray-500">
            No Table Data
          </div>
        );
      }
      const headers = tableData[0] ? tableData[0].split('@@') : [];
      const rows = tableData.slice(1);
      return (
        <div
          className="overflow-x-auto my-8 transition-all"
          role="region"
          aria-label="Table Block"
        >
          <table className="min-w-full border-collapse border border-[var(--background-second)]">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="border border-[var(--background-second)] px-4 py-2 bg-[var(--background-brushed)] text-center text-[var(--text-primary)] text-base border-gradient-b"
                    role="columnheader"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                const cells = row.split('@@');
                return (
                  <tr
                    key={rowIndex}
                    className="even:bg-[var(--background-muted)]"
                    role="row"
                  >
                    {cells.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-[var(--background-second)] px-4 py-2 text-center text-[var(--text-primary)] text-sm"
                        role="cell"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    case 'Chart': {
      const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];
      const chartData = safeArray(props.data);
      const renderChart = () => {
        if (!chartData || chartData.length === 0) {
          return (
            <div className="text-center text-gray-500 p-4">
              No chart data available
            </div>
          );
        }
        switch (props.chartType) {
          case 'LineChart':
            return (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="var(--text-primary)" />
                  <YAxis stroke="var(--text-primary)" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={props.dataKey}
                    stroke="var(--accent)"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            );
          case 'PieChart':
            return (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie
                    data={chartData}
                    dataKey={props.dataKey}
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="var(--primary)"
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            );
          case 'BarChart':
          default:
            return (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="var(--text-primary)" />
                  <YAxis stroke="var(--text-primary)" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey={props.dataKey}
                    fill="var(--accent)"
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            );
        }
      };
      return (
        <div
          className="my-4 transition-all"
          role="region"
          aria-label="Chart Block"
        >
          {props.title && (
            <Title level={3} gradient>
              {safeText(props.title)}
            </Title>
          )}
          <div className="bg-animated-glow p-4 rounded-lg shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-all">
            {renderChart()}
          </div>
        </div>
      );
    }

    case 'Link':
      return (
        <div
          className="my-4 transition-all"
          role="link"
          aria-label="Link Block"
        >
          <a
            href={props.href || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] underline flex items-center transition-colors duration-300 hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaLink className="mr-2" aria-hidden="true" />
            {safeText(props.text) || 'External Link'}
          </a>
        </div>
      );

    case 'File':
      return (
        <div
          className="my-4 transition-all"
          role="link"
          aria-label="File Download Block"
        >
          <a
            href={props.href || '#'}
            download
            className="text-[var(--accent)] underline flex items-center transition-colors duration-300 hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaDownload className="mr-2" aria-hidden="true" />
            {safeText(props.filename) || 'Download File'}
          </a>
        </div>
      );

    case 'Countdown': {
      const calculateTimeLeft = () => {
        const diff = props.targetDate
          ? +new Date(props.targetDate) - +new Date()
          : -1;
        let timeLeft = {};
        if (diff > 0) {
          timeLeft = {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
          };
        }
        return timeLeft;
      };
      const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
      useEffect(() => {
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
      }, [props.targetDate]);
      const timerComponents = Object.keys(timeLeft).length
        ? Object.keys(timeLeft).map((interval) => (
            <span key={interval} className="mx-1 text-xl font-semibold">
              {timeLeft[interval]} {interval}
            </span>
          ))
        : null;
      return (
        <div
          className="my-4 p-4 border border-[var(--background-second)] rounded-lg shadow-soft bg-[var(--background-brushed)] transition-all"
          role="region"
          aria-label="Countdown Block"
        >
          {props.title && (
            <Title level={3} gradient>
              {safeText(props.title)}
            </Title>
          )}
          <div className="flex justify-center items-center text-lg">
            {timerComponents || (
              <span className="text-green-600 font-bold">
                이벤트가 시작되었습니다!
              </span>
            )}
          </div>
        </div>
      );
    }

    case 'Gallery':
      return (
        <div role="region" aria-label="Gallery Block">
          <Gallery images={safeArray(props.images)} />
        </div>
      );

    default:
      return (
        <div
          className="my-4 text-center text-gray-500 transition-all"
          role="region"
          aria-label="Unknown Block"
        >
          Unsupported block type: {type}
        </div>
      );
  }
};

export default BlocksRenderer;