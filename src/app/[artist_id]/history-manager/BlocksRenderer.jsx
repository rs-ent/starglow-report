// src/app/[artist_id]/history-manager/BlocksRenderer.jsx
import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { 
  FaLink, FaDownload, FaQuoteLeft, FaList, FaCheckCircle, 
  FaExclamationCircle, FaInfoCircle, FaHistory, FaHeading, FaSubscript 
} from 'react-icons/fa';
import { useSwipeable } from 'react-swipeable';

// 헬퍼 컴포넌트: Section, Title, Subtitle 등
const Section = ({ children, className = '' }) => (
  <section className={`section-base ${className}`}>{children}</section>
);

const Title = ({ level, children }) => {
  const Tag = `h${level}`;
  const classNames = {
    1: 'text-4xl font-bold mt-4 mb-2 flex items-center border-b-1 pb-2 text-[var(--primary)]',
    2: 'text-2xl font-bold mt-10 mb-2 flex items-center pb-1 text-[var(--primary)]',
    3: 'text-xl font-semibold mt-6 mb-1 flex items-center pb-1 text-[var(--accent)]',
  };

  return (
    <Tag className={classNames[level]}>
      {children}
    </Tag>
  );
};

// 갤러리 컴포넌트
const Gallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const galleryRef = React.useRef(null);

  const handlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  React.useEffect(() => {
    if (galleryRef.current) {
      galleryRef.current.scrollTo({
        left: galleryRef.current.clientWidth * currentIndex,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  return (
    <div className="my-8 relative">
      <div
        {...handlers}
        ref={galleryRef}
        className="flex overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory"
      >
        {images.map((image, index) => (
          <div key={index} className="flex-shrink-0 w-full snap-start px-2">
            <img
              src={image.src}
              alt={image.alt || 'Gallery image'}
              className="w-full h-56 sm:h-48 object-cover rounded-lg shadow-soft transition-transform transform hover:scale-105"
            />
          </div>
        ))}
      </div>
      {/* 내비게이션 도트 */}
      <div className="flex justify-center mt-2">
        {images.map((_, index) => (
          <span
            key={index}
            className={`h-2 w-2 mx-1 rounded-full cursor-pointer transition-colors duration-300 ${
              currentIndex === index ? 'bg-[var(--accent)]' : 'bg-gray-300 hover:bg-[var(--accent)]'
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          ></span>
        ))}
      </div>
      {/* 내비게이션 버튼 */}
      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[var(--background)] p-2 rounded-full shadow-strong hover:bg-[var(--background-muted)] transition-all focus:outline-none"
        aria-label="Previous Slide"
      >
        &#8592;
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[var(--background)] p-2 rounded-full shadow-strong hover:bg-[var(--background-muted)] transition-all focus:outline-none"
        aria-label="Next Slide"
      >
        &#8594;
      </button>
    </div>
  );
};

// 메인 BlocksRenderer 컴포넌트
const BlocksRenderer = ({ block }) => {
  const { type, ...props } = block;

  switch (type) {
    case 'SectionTitle':
        return (
            <div className="my-4">
                {props.src && (
                <img
                    src={props.src}
                    alt={props.alt || 'Section image'}
                    className="w-full object-cover rounded-lg shadow-soft mb-4"
                />
                )}
                <Title level={1}>{props.text}</Title>
            </div>
        );
    case 'Title':
      return <Title level={2}>{props.text}</Title>;
    case 'Subtitle':
      return <Title level={3}>{props.text}</Title>;
    case 'Text':
      return <p className="text-sm font-normal mt-1 mb-2 text-[var(--text-primary)]">{props.content}</p>;
    case 'Image':
      return (
        <img
          src={props.src}
          alt={props.alt}
          className="my-8 w-3/4 mx-auto content-center object-cover rounded-lg shadow-soft"
        />
      );
    case 'Video':
      const extractYouTubeId = (url) => {
        const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
      };

      const videoId = extractYouTubeId(props.src);

      return (
        <div className="video-container my-12">
          <iframe
            className="w-3/4 mx-auto rounded-lg shadow-soft transition-transform transform hover:scale-105"
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube Video"
          ></iframe>
        </div>
      );
    case 'List':
      const ListIcon = props.ordered ? FaList : FaCheckCircle;
      return (
        <div className="my-4">
          <ListIcon className="inline-block mr-2 text-[var(--accent)]" />
          {props.ordered ? (
            <ol className="list-decimal list-inside my-2">
              {props.items.map((item, index) => (
                <li key={index} className="mb-1">
                  {item}
                </li>
              ))}
            </ol>
          ) : (
            <ul className="list-disc list-inside my-2">
              {props.items.map((item, index) => (
                <li key={index} className="mb-1">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    case 'Blockquote':
      return (
        <blockquote className="border-l-4 border-[var(--accent)] pl-4 italic my-6 text-[var(--text-muted)]">
          <FaQuoteLeft className="inline-block mr-2 text-[var(--accent)]" />
          "{props.text}"
          {props.cite && (
            <cite className="block text-right text-sm text-[var(--text-secondary)] mt-2">
              - {props.cite}
            </cite>
          )}
        </blockquote>
      );
    case 'Code':
      return (
        <pre className="bg-[var(--background-muted)] text-[var(--foreground)] p-4 rounded-lg my-4 overflow-auto shadow-soft">
          <code className={`language-${props.language}`}>{props.code}</code>
        </pre>
      );
    case 'Table':
      return (
        <div className="overflow-x-auto my-8">
          <table className="min-w-full border-collapse border border-[var(--background-second)]">
            <thead>
              <tr>
                {props.tableData[0]?.split('@@').map((header, index) => (
                  <th
                    key={index}
                    className="border border-[var(--background-second)] px-4 py-2 bg-[var(--background-brushed)] text-center text-[var(--text-primary)] text-base"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.tableData.slice(1).map((row, rowIndex) => {
                const cells = row.split('@@');
                return (
                  <tr key={rowIndex} className="even:bg-[var(--background-muted)]">
                    {cells.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-[var(--background-second)] px-4 py-2 text-center text-[var(--text-primary)] text-sm"
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

      const renderChart = () => {
        switch (props.chartType) {
          case 'LineChart':
            return (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={props.data}>
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
                    data={props.data}
                    dataKey={props.dataKey}
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="var(--primary)"
                    label
                  >
                    {props.data.map((entry, index) => (
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
                <BarChart data={props.data}>
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
        <div className="my-4">
          {props.title && <Title level={3}>{props.title}</Title>}
          {renderChart()}
        </div>
      );
    case 'Link':
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] underline flex items-center my-4 transition-colors duration-300 hover:text-[var(--primary)]"
        >
          <FaLink className="mr-2" />
          {props.text}
        </a>
      );
    case 'File':
      return (
        <a
          href={props.href}
          download
          className="text-[var(--accent)] underline flex items-center my-4 transition-colors duration-300 hover:text-[var(--primary)]"
        >
          <FaDownload className="mr-2" />
          {props.filename}
        </a>
      );
    case 'Countdown':
      const calculateTimeLeft = () => {
        const difference = +new Date(props.targetDate) - +new Date();
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

      const timerComponents = Object.keys(timeLeft).map((interval) => (
        <span key={interval} className="mx-1">
          {timeLeft[interval]} {interval}
        </span>
      ));

      return (
        <div className="my-4 p-4 border border-[var(--background-second)] rounded-lg shadow-soft bg-[var(--background-brushed)]">
          {props.title && <Title level={3}>{props.title}</Title>}
          <div className="flex justify-center items-center text-lg">
            {timerComponents.length ? timerComponents : <span>이벤트가 시작되었습니다!</span>}
          </div>
        </div>
      );
    case 'Gallery':
      return <Gallery images={props.images} />;
    default:
      return null;
  }
};

export default BlocksRenderer;