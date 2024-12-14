// src/app/[artist_id]/history-manager/BlocksRenderer.jsx
import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { 
  FaLink, FaDownload, FaQuoteLeft, FaList, FaCheckCircle, 
  FaArrowLeft, FaArrowRight, FaTimes
} from 'react-icons/fa';

// 섹션, 타이틀 헬퍼 컴포넌트
const Section = ({ children, className = '' }) => (
  <section className={`section-base ${className}`} role="region" aria-label="Content Section">
    {children}
  </section>
);

const Title = ({ level, children }) => {
  const Tag = `h${level}`;
  const classNames = {
    1: 'text-4xl font-bold mt-4 mb-2 flex items-center border-b-1 pb-2 text-[var(--primary)]',
    2: 'text-2xl font-bold mt-10 mb-2 flex items-center pb-1 text-[var(--primary)]',
    3: 'text-xl font-semibold mt-6 mb-1 flex items-center pb-1 text-[var(--accent)]',
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
    <div className="my-8 items-center" role="region" aria-label="Advanced Image Gallery">
      {images && images.length > 0 ? (
        <div
          className="px-8 grid gap-2 items-center justify-items-center w-full"
          // images.length 개수만큼 1fr씩 할당
          style={{ gridTemplateColumns: `repeat(${images.length}, minmax(0, 1fr))` }}
        >
          {images.map((img, index) => (
            <button
              key={index}
              className="group relative w-full overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => openLightbox(index)}
              aria-label={`Open image ${index + 1}`}
            >
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                {img.src ? (
                  <img
                    src={img.src}
                    alt={img.alt || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-gray-500 text-sm">No Image Available</div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-60 bg-gray-200 text-gray-700">
          No Images to Display
        </div>
      )}

      {lightboxIndex !== null && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Lightbox Image View"
        >
          <div className="relative max-w-3xl w-full">
            {/* 닫기 버튼 */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close Lightbox"
            >
              <FaTimes />
            </button>
            {/* 이전/다음 버튼 */}
            {images.length > 1 && (
              <>
                <button
                  onClick={showPrev}
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white text-2xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Show Previous Image"
                >
                  <FaArrowLeft />
                </button>
                <button
                  onClick={showNext}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white text-2xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="max-h-[90vh] object-contain transition-transform duration-300"
                />
              ) : (
                <div className="text-white">No Image Available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// 메인 BlocksRenderer 컴포넌트
const BlocksRenderer = ({ block }) => {
  const { type, ...props } = block;

  // 안전한 데이터 핸들링
  const safeText = (text) => (text && typeof text === 'string' ? text : '');
  const safeArray = (arr) => (Array.isArray(arr) ? arr : []);
  
  switch (type) {
    case 'SectionTitle':
      return (
        <div className="my-4" role="region" aria-label="Section Title Block">
          {props.src && (
            <img
              src={props.src}
              alt={safeText(props.alt) || 'Section image'}
              className="w-full object-cover rounded-lg shadow-soft mb-4"
              loading="lazy"
            />
          )}
          <Title level={1}>{safeText(props.text)}</Title>
        </div>
      );

    case 'Title':
      return (
        <div role="heading" aria-level="2" aria-label="Title Block">
          <Title level={2}>{safeText(props.text)}</Title>
        </div>
      );

    case 'Subtitle':
      return (
        <div role="heading" aria-level="3" aria-label="Subtitle Block">
          <Title level={3}>{safeText(props.text)}</Title>
        </div>
      );

    case 'Text':
      return (
        <p
          className="text-sm font-normal mt-1 mb-4 text-[var(--text-primary)]"
          role="text"
          aria-label="Text Block"
        >
          {safeText(props.content)}
        </p>
      );

    case 'Image':
      return (
        <div className="my-8 flex justify-center" role="img" aria-label="Image Block">
          <img
            src={props.src || ''}
            alt={safeText(props.alt) || 'Image'}
            className="w-3/4 object-cover rounded-lg shadow-soft"
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
        <div className="video-container my-12" role="region" aria-label="Video Block">
          {videoId ? (
            <iframe
              className="w-3/4 mx-auto rounded-lg shadow-soft transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              src={`https://www.youtube.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded YouTube Video"
            ></iframe>
          ) : (
            <div className="w-3/4 mx-auto text-center text-gray-500 p-4 bg-gray-100 rounded">
              Invalid or Missing Video URL
            </div>
          )}
        </div>
      );

    case 'List':
      const ListIcon = props.ordered ? FaList : FaCheckCircle;
      const items = safeArray(props.items);
      return (
        <div className="my-4" role="list" aria-label="List Block">
          <div className="flex items-center mb-2">
            <ListIcon className="inline-block mr-2 text-[var(--accent)]" aria-hidden="true" />
            <span className="sr-only">{props.ordered ? 'Ordered List' : 'Unordered List'}</span>
          </div>
          {props.ordered ? (
            <ol className="list-decimal list-inside my-2">
              {items.map((item, index) => (
                <li key={index} className="mb-1" role="listitem">
                  {item}
                </li>
              ))}
            </ol>
          ) : (
            <ul className="list-disc list-inside my-2">
              {items.map((item, index) => (
                <li key={index} className="mb-1" role="listitem">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    case 'Blockquote':
      return (
        <blockquote
          className="border-l-4 border-[var(--accent)] pl-4 italic my-6 text-[var(--text-muted)]"
          role="quote"
          aria-label="Blockquote"
        >
          <FaQuoteLeft className="inline-block mr-2 text-[var(--accent)]" aria-hidden="true" />
          "{safeText(props.text)}"
          {props.cite && (
            <cite className="block text-right text-sm text-[var(--text-secondary)] mt-2">
              - {props.cite}
            </cite>
          )}
        </blockquote>
      );

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