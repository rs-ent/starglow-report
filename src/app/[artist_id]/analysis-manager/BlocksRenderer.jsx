// src/app/[artist_id]/history-manager/BlocksRenderer.jsx
import React from 'react';
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

function safeLangValue(val, locale = 'ko') {
  if (!val) return '';
  if (typeof val === 'string') {
    return val; // 예전 (단일 string) 데이터
  }
  if (typeof val === 'object') {
    // 새 구조: { ko:'...', en:'...' }
    return val[locale] || '';
  }
  return '';
}

function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

// 섹션, 타이틀 헬퍼 컴포넌트
const Section = ({ children, className = '' }) => (
  <section
    className={`section-base ${className}`}
    role="region"
    aria-label="Content Section"
  >
    {children}
  </section>
);

const Title = ({ level, children }) => {
  const Tag = `h${level}`;
  // 기존 classNames -> RGBA 변환
  const classNames = {
    1: `
      text-4xl font-bold mt-4 mb-2 flex items-center border-b-2 pb-2 
      border-[rgba(255,255,255,0.2)] 
      text-[rgba(59,130,246,1)]
    `,
    2: `
      text-2xl font-bold mt-10 mb-2 flex items-center pb-1 
      text-[rgba(59,130,246,1)]
    `,
    3: `
      text-xl font-semibold mt-6 mb-1 flex items-center pb-1
      text-[rgba(139,92,246,1)]
    `,
  };

  return (
    <Tag className={classNames[level]} tabIndex="0">
      {children}
    </Tag>
  );
};

// 갤러리 컴포넌트
const Gallery = ({ images }) => {
  const [lightboxIndex, setLightboxIndex] = React.useState(null);
  const lightboxRef = React.useRef(null);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showNext = React.useCallback(() => {
    if (images.length > 0 && lightboxIndex !== null) {
      setLightboxIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  }, [images, lightboxIndex]);

  const showPrev = React.useCallback(() => {
    if (images.length > 0 && lightboxIndex !== null) {
      setLightboxIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    }
  }, [images, lightboxIndex]);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex !== null) {
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'ArrowRight') {
          showNext();
        } else if (e.key === 'ArrowLeft') {
          showPrev();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <div
      className="my-8 items-center transition-all duration-300"
      role="region"
      aria-label="Advanced Image Gallery"
    >
      {images && images.length > 0 ? (
        <div
          className="px-8 grid gap-2 items-center justify-items-center w-full"
          style={{ gridTemplateColumns: `repeat(${images.length}, minmax(0, 1fr))` }}
        >
          {images.map((img, index) => (
            <button
              key={index}
              className="
                group relative w-full overflow-hidden rounded-md
                focus:outline-none
                focus:ring-2
                focus:ring-[rgba(59,130,246,1)]
                transition
              "
              onClick={() => openLightbox(index)}
              aria-label={`Open image ${index + 1}`}
            >
              <div
                className="
                  w-full h-40 bg-[rgba(229,231,235,1)]
                  flex items-center justify-center overflow-hidden
                  transition-transform duration-300
                  group-hover:scale-105
                  shadow-md
                "
              >
                {img.src ? (
                  <img
                    src={img.src}
                    alt={img.alt || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-[rgba(107,114,128,1)] text-sm">
                    No Image Available
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-60 bg-[rgba(229,231,235,1)] text-[rgba(55,65,81,1)]">
          No Images to Display
        </div>
      )}

      {lightboxIndex !== null && (
        <div
          ref={lightboxRef}
          className="
            fixed inset-0 z-50 
            bg-[rgba(0,0,0,0.8)] 
            flex items-center justify-center 
            p-4
            transition-colors duration-300
          "
          role="dialog"
          aria-modal="true"
          aria-label="Lightbox Image View"
        >
          <div className="relative max-w-3xl w-full">
            {/* 닫기 버튼 */}
            <button
              onClick={closeLightbox}
              className="
                absolute top-4 right-4 
                text-[rgba(255,255,255,1)] text-2xl
                bg-[rgba(0,0,0,0.5)]
                rounded-full p-2
                hover:bg-[rgba(0,0,0,0.7)]
                focus:outline-none
                focus:ring-2
                focus:ring-[rgba(59,130,246,1)]
                transition
              "
              aria-label="Close Lightbox"
            >
              <FaTimes />
            </button>
            {/* 이전/다음 버튼 */}
            {images.length > 1 && (
              <>
                <button
                  onClick={showPrev}
                  className="
                    absolute top-1/2 left-2 transform -translate-y-1/2
                    text-[rgba(255,255,255,1)] text-2xl
                    bg-[rgba(0,0,0,0.5)]
                    rounded-full p-2
                    hover:bg-[rgba(0,0,0,0.7)]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[rgba(59,130,246,1)]
                    transition
                  "
                  aria-label="Show Previous Image"
                >
                  <FaArrowLeft />
                </button>
                <button
                  onClick={showNext}
                  className="
                    absolute top-1/2 right-2 transform -translate-y-1/2
                    text-[rgba(255,255,255,1)] text-2xl
                    bg-[rgba(0,0,0,0.5)]
                    rounded-full p-2
                    hover:bg-[rgba(0,0,0,0.7)]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[rgba(59,130,246,1)]
                    transition
                  "
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
                  alt={currentImage.alt || `Lightbox image ${lightboxIndex + 1}`}
                  className="max-h-[90vh] object-contain transition-transform duration-300 shadow-2xl"
                />
              ) : (
                <div className="text-[rgba(255,255,255,1)]">
                  No Image Available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 메인 BlocksRenderer 컴포넌트
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
              className="
                w-full object-cover rounded-lg 
                shadow-[0_4px_12px_rgba(0,0,0,0.3)]
                mb-4
                hover:opacity-95 
                transition
              "
              loading="lazy"
            />
          )}
          <Title level={1}>{safeLangValue(props.text, locale)}</Title>
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
          <Title level={3}>{safeLangValue(props.text, locale)}</Title>
        </div>
      );

    case 'Text':
      return (
        <p
          className="text-sm font-normal mt-1 mb-4 text-[rgba(255,255,255,0.85)]"
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
            className="
              w-3/4 object-cover rounded-lg 
              shadow-[0_4px_12px_rgba(0,0,0,0.3)] 
              hover:opacity-95
              transition
            "
            loading="lazy"
          />
        </div>
      );

    case 'Video':
      const extractYouTubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
      };
      const videoId = extractYouTubeId(props.src);

      return (
        <div className="video-container my-9" role="region" aria-label="Video Block">
          {videoId ? (
            <iframe
              className="w-5/6 h-60 mx-auto rounded-lg shadow-soft transition-transform transform focus:outline-none focus:ring-2 focus:ring-blue-500"
              src={`https://www.youtube.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded YouTube Video"
            ></iframe>
          ) : (
            <div className="w-5/6 mx-auto text-center text-gray-500 p-4 bg-gray-100 rounded">
              Invalid or Missing Video URL
            </div>
          )}
        </div>
      );

    case 'List': {
      const ListIcon = props.ordered ? FaList : FaCheckCircle;
      // items가 { ko:[], en:[] }거나 단일 array일 수 있음
      // => safeArray + safeLangValue 필요
      let items = props.items;
      if (typeof items === 'object' && items !== null && !Array.isArray(items)) {
        // 새 구조: items = { ko: [...], en: [...] }
        items = items[locale] || [];
      } else if (!Array.isArray(items)) {
        items = [];
      }

      return (
        <div className="my-4 transition-all" role="list" aria-label="List Block">
          <div className="flex items-center mb-2">
            <ListIcon
              className="inline-block mr-2 text-[rgba(139,92,246,1)]"
              aria-hidden="true"
            />
            <span className="sr-only">
              {props.ordered ? 'Ordered List' : 'Unordered List'}
            </span>
          </div>
          {props.ordered ? (
            <ol className="list-decimal list-inside my-2 text-[rgba(255,255,255,0.85)]">
              {items.map((item, index) => (
                <li key={index} className="mb-1" role="listitem">
                  {item}
                </li>
              ))}
            </ol>
          ) : (
            <ul className="list-disc list-inside my-2 text-[rgba(255,255,255,0.85)]">
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
      // text / cite => 각각 safeLangValue
      const quoteText = safeLangValue(props.text, locale);
      const quoteCite = safeLangValue(props.cite, locale);

      return (
        <blockquote
          className="
            border-l-4 border-[rgba(139,92,246,1)] pl-4 italic 
            my-6 text-[rgba(255,255,255,0.7)] 
            transition-all
          "
          role="quote"
          aria-label="Blockquote"
        >
          <FaQuoteLeft
            className="inline-block mr-2 text-[rgba(139,92,246,1)]"
            aria-hidden="true"
          />
          “{quoteText}”
          {quoteCite && (
            <cite className="block text-right text-sm text-[rgba(255,255,255,0.6)] mt-2">
              - {quoteCite}
            </cite>
          )}
        </blockquote>
      );
    }

    case 'Code':
      return (
        <div className="my-4" role="region" aria-label="Code Block">
          <pre
            className="bg-[var(--background-muted)] text-[var(--foreground)] p-4 rounded-lg overflow-auto shadow-soft"
            tabIndex="0"
          >
            <code className={`language-${safeText(props.language)}`}>{safeText(props.code)}</code>
          </pre>
        </div>
      );

    case 'Table':
      const tableData = safeArray(props.tableData);
      if (tableData.length === 0) {
        return <div className="my-8 text-center text-gray-500">No Table Data</div>;
      }

      const headers = tableData[0] ? tableData[0].split('@@') : [];
      const rows = tableData.slice(1);

      return (
        <div className="overflow-x-auto my-8" role="region" aria-label="Table Block">
          <table className="min-w-full border-collapse border border-[var(--background-second)]" role="table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="border border-[var(--background-second)] px-4 py-2 bg-[var(--background-brushed)] text-center text-[var(--text-primary)] text-base"
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
                  <tr key={rowIndex} className="even:bg-[var(--background-muted)]" role="row">
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

    case 'Chart':
      const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];
      const chartData = safeArray(props.data);

      const renderChart = () => {
        if (!chartData || chartData.length === 0) {
          return <div className="text-center text-gray-500 p-4">No chart data available</div>;
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
                  <Line type="monotone" dataKey={props.dataKey} stroke="var(--accent)" />
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <Bar dataKey={props.dataKey} fill="var(--accent)" />
                </BarChart>
              </ResponsiveContainer>
            );
        }
      };

      return (
        <div className="my-4" role="region" aria-label="Chart Block">
          {props.title && <Title level={3}>{safeText(props.title)}</Title>}
          {renderChart()}
        </div>
      );

    case 'Link':
      return (
        <div className="my-4" role="link" aria-label="Link Block">
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
        <div className="my-4" role="link" aria-label="File Download Block">
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

    case 'Countdown':
      const calculateTimeLeft = () => {
        const difference = props.targetDate ? +new Date(props.targetDate) - +new Date() : -1;
        let timeLeft = {};

        if (difference > 0) {
          timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / (1000 * 60)) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          };
        }

        return timeLeft;
      };

      const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());

      React.useEffect(() => {
        const timer = setInterval(() => {
          setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
      }, [props.targetDate]);

      const timerKeys = Object.keys(timeLeft);
      const timerComponents = timerKeys.length
        ? timerKeys.map((interval) => (
            <span key={interval} className="mx-1">
              {timeLeft[interval]} {interval}
            </span>
          ))
        : null;

      return (
        <div
          className="my-4 p-4 border border-[var(--background-second)] rounded-lg shadow-soft bg-[var(--background-brushed)]"
          role="region"
          aria-label="Countdown Block"
        >
          {props.title && <Title level={3}>{safeText(props.title)}</Title>}
          <div className="flex justify-center items-center text-lg">
            {timerComponents ? (
              timerComponents
            ) : (
              <span className="text-green-600">이벤트가 시작되었습니다!</span>
            )}
          </div>
        </div>
      );

    case 'Gallery':
      return (
        <div role="region" aria-label="Gallery Block">
          <Gallery images={safeArray(props.images)} />
        </div>
      );

    default:
      return (
        <div className="my-4 text-center text-gray-500" role="region" aria-label="Unknown Block">
          Unsupported block type: {type}
        </div>
      );
  }
};

export default BlocksRenderer;