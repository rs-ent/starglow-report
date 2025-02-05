'use client';

import { useState, useEffect } from 'react';
import { fetchInvestmentPoints, addInvestmentPoint, deleteData, updateData } from '../../firebase/fetch';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/firebase';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';
import { useKPI } from '../../../context/GlobalData';
import InvestmentPointItem from '../InvestmentPointsAndRisks/InvestmentPointItem';

// 다국어 유틸 함수
import { safeLangValue, updateLangField, convertKor } from '../../../script/convertLang';

// 차트 관련
import {
  Line
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';

// 동적 import
const CreateLineChart = dynamic(() => import('./CreateLineChart'), { ssr: false });

// 차트 플러그인 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin, zoomPlugin);

// 차트 색상
const predefinedColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

/** 
 * 레거시 데이터가 문자열일 수도 있으므로 
 * { ko:'', en:'' } 형태로 변환 
 */
function convertLegacyInvestmentPoint(point) {
  return {
    ...point,
    title: convertKor(point.title),
    context: convertKor(point.context),
    source: convertKor(point.source),
  };
}

/** 차트 데이터 구성 */
const getChartData = (chartConfig, sortedData, activeLanguage) => {
  const labels = sortedData
    .filter((data) => {
      const date = new Date(data.date);
      const { start, end } = chartConfig.dateRange || {};
      return (!start || date >= new Date(start)) && (!end || date <= new Date(end));
    })
    .map((data) => new Date(data.date).toLocaleDateString());

  const datasets = chartConfig.selectedFields.map((configItem, index) => ({
    label: safeLangValue(configItem.label,activeLanguage) || safeLangValue(configItem.field, activeLanguage),
    data: sortedData
      .filter((data) => {
        const date = new Date(data.date);
        const { start, end } = chartConfig.dateRange || {};
        return (!start || date >= new Date(start)) && (!end || date <= new Date(end));
      })
      .map((data) => data[configItem.field]),
    borderColor: predefinedColors[index % predefinedColors.length],
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    tension: 0.4,
  }));

  return { labels, datasets };
};

/** 차트 옵션 */
const getChartOptions = (chartConfig , activeLanguage) => ({
  responsive: true,
  plugins: {
    legend: { display: true, position: 'top' },
    title: { display: true, text: chartConfig?.chartTitle || 'Chart Preview' },
    annotation: {
      annotations: chartConfig.markers.reduce((acc, marker, index) => {
        if (marker.type === 'point') {
          acc[`marker_${index}`] = {
            type: 'point',
            xValue: marker.xValue,
            yValue: marker.yValue,
            backgroundColor: marker.color || 'rgba(255, 99, 132, 0.3)',
            radius: marker.radius || 6,
            label: {
                content: safeLangValue(marker.description, activeLanguage) || safeLangValue({ ko: `Point ${index + 1}`, en: `Point ${index + 1}` }, activeLanguage),
                enabled: !!safeLangValue(marker.description, activeLanguage),
                position: 'center',
                backgroundColor: '#333',
                color: '#fff',
                font: { size: 12 },
                padding: 4,
            },
          };
        } else if (marker.type === 'box') {
          acc[`marker_${index}`] = {
            type: 'box',
            xMin: marker.xMin,
            xMax: marker.xMax,
            yMin: marker.yMin,
            yMax: marker.yMax,
            backgroundColor: 'rgba(100,100,100,0.1)',
            borderColor: '#666',
            borderWidth: 1,
            label: {
                content: safeLangValue(marker.description, activeLanguage) || safeLangValue({ ko: `Box ${index + 1}`, en: `Box ${index + 1}` }, activeLanguage),
                enabled: !!safeLangValue(marker.description, activeLanguage),
                position: 'start',
                backgroundColor: '#333',
                color: '#fff',
                font: { size: 12 },
                padding: 4,
            },
          };
        }
        return acc;
      }, {}),
    },
  },
  zoom: {
    pan: {
      enabled: true,
      mode: 'x',
    },
    zoom: {
      wheel: { enabled: true },
      pinch: { enabled: true },
      mode: 'x',
    },
  },
});

/** 유튜브(Shorts 포함) URL 파싱 */
const extractYouTubeEmbedUrl = (url) => {
  try {
    let videoId = null;
    const shortsRegex = /youtube\.com\/shorts\/([\w-]+)/;
    const standardRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|.*&v=))([\w-]+)/;

    // shorts URL 처리
    const shortsMatch = url.match(shortsRegex);
    if (shortsMatch && shortsMatch[1]) {
      videoId = shortsMatch[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // 일반 유튜브 URL 처리
    const match = url.match(standardRegex);
    if (match && match[1]) {
      videoId = match[1];
    }

    if (videoId) {
      // 시작 시간 (t 파라미터) 지원
      const urlObj = new URL(url);
      const start = urlObj.searchParams.get('t');
      return `https://www.youtube.com/embed/${videoId}${start ? `?start=${start}` : ''}`;
    }

    return url;
  } catch (error) {
    console.error('Invalid YouTube URL:', error);
    return url;
  }
};

const InvestmentPointManager = ({ artist_id }) => {
  // ============ State ============
  const [investmentPoints, setInvestmentPoints] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    artist_id,
    type: 'Investment Point',
    // 다국어 구조
    title: { ko: '', en: '' },
    context: { ko: '', en: '' },
    source: { ko: '', en: '' },
    media: [],
    mediaTitles: [],
    chartConfig: null,
    selectedKPIs: [],
    chartTitle: '',
  });

  const [uploadFile, setUploadFile] = useState(null);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedKPIs, setSelectedKPIs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartConfig, setChartConfig] = useState(null);
  const [view, setView] = useState('Investment Point');

  // 현재 활성화된 아이템 상태 관리
  const [activeItem, setActiveItem] = useState(null);

  // 아이템 클릭 핸들러
  const toggleItem = (index) => {
      setActiveItem((prev) => (prev === index ? null : index));
  };

  // ============ 다국어 ============
  const [activeLanguage, setActiveLanguage] = useState('ko');

  // KPI (차트 자료)
  const kpiData = useKPI();
  const sortedData = kpiData.timeline;

  // ============ Effects ============
  useEffect(() => {
    if (artist_id) {
      loadInvestmentPoints();
    }
  }, [artist_id]);

  // ============ 로드: DB ============
  const loadInvestmentPoints = async () => {
    setLoading(true);
    try {
      const points = await fetchInvestmentPoints(artist_id);
      // 레거시 호환 처리
      const convertedPoints = points.map(convertLegacyInvestmentPoint);
      setInvestmentPoints(convertedPoints);
    } catch (error) {
      console.error('Error loading investment points:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ CRUD ============
  const handleSave = async () => {
    // 최소 한 언어라도 title, context가 있어야 한다는 예시:
    const koTitle = safeLangValue(formData.title, 'ko').trim();
    const enTitle = safeLangValue(formData.title, 'en').trim();
    if (!koTitle && !enTitle) {
      alert('Please provide a Title in at least one language (KO or EN).');
      return;
    }

    const koContext = safeLangValue(formData.context, 'ko').trim();
    const enContext = safeLangValue(formData.context, 'en').trim();
    if (!koContext && !enContext) {
      alert('Please provide a Context in at least one language (KO or EN).');
      return;
    }

    const newPoint = {
      ...formData,
      id: formData.id || `IP-${new Date().toISOString()}`,
      artist_id,
    };

    try {
      if (isEditing) {
        await updateData(formData.id, 'InvestmentPoint', newPoint);
        setInvestmentPoints((prev) =>
          prev.map((point) => (point.id === formData.id ? { ...point, ...newPoint } : point))
        );
      } else {
        const docId = await addInvestmentPoint(newPoint, artist_id);
        setInvestmentPoints([...investmentPoints, { id: docId, ...newPoint }]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving investment point:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      artist_id,
      type: 'Investment Point',
      title: { ko: '', en: '' },
      context: { ko: '', en: '' },
      source: { ko: '', en: '' },
      media: [],
      mediaTitles: [],
      chartConfig: null,
      selectedKPIs: [],
      chartTitle: '',
    });
    setIsEditing(false);
    setSelectedKPIs([]);
    setChartConfig(null);
    setUploadFile(null);
    setNewMediaUrl('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this investment point?')) return;

    try {
      await deleteData(id, 'InvestmentPoint');
      setInvestmentPoints((prev) => prev.filter((point) => point.id !== id));
    } catch (error) {
      console.error('Error deleting investment point:', error);
    }
  };

  const startEditing = (point) => {
    setFormData({ ...point });
    setSelectedKPIs(point.selectedKPIs || []);
    setChartConfig(point.chartConfig || null);
    setIsEditing(true);

    const editorSection = document.querySelector('#editor');
    if (editorSection) {
        editorSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ============ Media Upload / URL ============
  const handleFileUpload = async () => {
    if (!uploadFile) return;
    try {
      const uniqueName = `${uuidv4()}_${uploadFile.name}`;
      const storageRef = ref(storage, `${mediaType}s/${uniqueName}`);
      await uploadBytes(storageRef, uploadFile);
      const downloadUrl = await getDownloadURL(storageRef);

      setFormData((prevData) => ({
        ...prevData,
        media: [
          ...prevData.media,
          {
            url: downloadUrl,
            type: mediaType,
            title: '',
          },
        ],
      }));
      setUploadFile(null);
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const addMediaUrl = () => {
    if (!newMediaUrl || !isValidUrl(newMediaUrl)) {
      alert('Please provide a valid URL.');
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      media: [
        ...prevData.media,
        {
          url: newMediaUrl,
          type: mediaType,
          title: '',
        },
      ],
    }));
    setNewMediaUrl('');
  };

  const removeMedia = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      media: prevData.media.filter((_, i) => i !== index),
      mediaTitles: prevData.mediaTitles.filter((_, i) => i !== index),
    }));
  };

  const moveMedia = (index, direction) => {
    const newMedia = [...formData.media];
    const newTitles = [...formData.mediaTitles];

    if (direction === 'up' && index > 0) {
      [newMedia[index], newMedia[index - 1]] = [newMedia[index - 1], newMedia[index]];
      [newTitles[index], newTitles[index - 1]] = [newTitles[index - 1], newTitles[index]];
    } else if (direction === 'down' && index < newMedia.length - 1) {
      [newMedia[index], newMedia[index + 1]] = [newMedia[index + 1], newMedia[index]];
      [newTitles[index], newTitles[index + 1]] = [newTitles[index + 1], newTitles[index]];
    }

    setFormData((prevData) => ({
      ...prevData,
      media: newMedia,
      mediaTitles: newTitles,
    }));
  };

  // ============ 차트 설정 ============
  const handleSaveChart = (config) => {
    setChartConfig(config);
    setFormData((prevData) => ({
      ...prevData,
      chartConfig: config,
    }));
  };

  // ============ 렌더링 ============
  return (
    <div className="
      px-6 py-8 space-y-12 
      rounded-lg shadow-xl 
      text-[rgba(255,255,255,0.9)] 
      bg-[rgba(0,0,0,0.8)]
      border border-[rgba(255,255,255,0.2)]
    ">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.2)] pb-3">
        <h1 className="text-xl font-bold">Investment Point Management</h1>
      </div>

      {/* 언어 탭 */}
      <div className="sticky top-0 z-10 bg-black border-b border-[rgba(255,255,255,0.2)] flex space-x-2">
        <button
          type="button"
          className={`
            px-4 py-2 transition 
            ${
              activeLanguage === 'ko'
                ? 'border-b-2 border-[rgba(59,130,246,1)] text-[rgba(59,130,246,1)]'
                : 'text-[rgba(200,200,200,0.8)]'
            }
          `}
          onClick={() => setActiveLanguage('ko')}
        >
          한국어
        </button>
        <button
          type="button"
          className={`
            px-4 py-2 transition
            ${
              activeLanguage === 'en'
                ? 'border-b-2 border-[rgba(59,130,246,1)] text-[rgba(59,130,246,1)]'
                : 'text-[rgba(200,200,200,0.8)]'
            }
          `}
          onClick={() => setActiveLanguage('en')}
        >
          English
        </button>
      </div>

      {/* 새 Investment Point 추가/수정 */}
      <section className="space-y-4" id='editor'>
        <h2 className="text-lg font-semibold">
          {isEditing ? 'Edit Investment Point' : 'Add New Investment Point'}
        </h2>

        <div className="space-y-4">
          {/* 타입 선택 */}
          <div>
            <label className="block mb-1 text-sm text-[rgba(200,200,200,0.8)]">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              className="
                w-full p-2 text-sm
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                border border-[rgba(255,255,255,0.2)]
                rounded focus:outline-none
              "
            >
              <option value="Investment Point">Investment Point</option>
              <option value="Risk">Risk</option>
            </select>
          </div>

          {/* Title (ko/en) */}
          <div>
            <label className="block mb-1 text-sm text-[rgba(200,200,200,0.8)]">
              Title ({activeLanguage})
            </label>
            <input
              type="text"
              className="
                w-full p-2 text-sm
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                border border-[rgba(255,255,255,0.2)]
                rounded focus:outline-none
              "
              placeholder="Enter title"
              value={safeLangValue(formData.title, activeLanguage)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: updateLangField(prev.title, activeLanguage, e.target.value),
                }))
              }
            />
          </div>

          {/* 미디어 타입 & 업로드 */}
          <div>
            <label className="block mb-1 text-sm text-[rgba(200,200,200,0.8)]">
              Media Type
            </label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              className="
                w-full p-2 text-sm
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                border border-[rgba(255,255,255,0.2)]
                rounded focus:outline-none
              "
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block mb-1 text-sm text-[rgba(200,200,200,0.8)]">
                Upload File
              </label>
              <input
                type="file"
                accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="
                  block w-full text-sm text-[rgba(255,255,255,0.9)]
                  file:mr-2 file:py-1 file:px-2
                  file:border-0 file:text-sm file:font-medium
                  file:bg-[rgba(255,255,255,0.2)]
                  file:text-[rgba(255,255,255,0.9)]
                  hover:file:bg-[rgba(255,255,255,0.3)]
                  focus:outline-none
                "
              />
            </div>
            <button
              type="button"
              onClick={handleFileUpload}
              className="
                px-4 py-2 text-sm rounded
                bg-[rgba(59,130,246,1)]
                hover:bg-[rgba(37,99,235,1)]
                self-end
              "
            >
              Upload
            </button>
          </div>

          {/* 미디어 URL 추가 */}
          <div>
            <label className="block mb-1 text-sm text-[rgba(200,200,200,0.8)]">
              Or Add Media URL
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                className="
                  flex-1 p-2 text-sm
                  bg-[rgba(255,255,255,0.05)]
                  text-[rgba(255,255,255,0.9)]
                  border border-[rgba(255,255,255,0.2)]
                  rounded focus:outline-none
                "
                placeholder="e.g. https://youtu.be/PK32nWq81xA"
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
              />
              <button
                type="button"
                onClick={addMediaUrl}
                className="
                  px-4 py-2 text-sm rounded
                  bg-[rgba(59,130,246,1)]
                  hover:bg-[rgba(37,99,235,1)]
                "
              >
                Add
              </button>
            </div>
          </div>

          {/* 등록된 미디어 미리보기/정렬 */}
          {formData.media && formData.media.length > 0 && (
            <ul className="space-y-2">
              {formData.media.map((item, index) => (
                <li
                  key={item.url}
                  className="
                    p-2 flex items-center justify-between
                    bg-[rgba(255,255,255,0.05)]
                    text-[rgba(255,255,255,0.9)]
                    rounded border border-[rgba(255,255,255,0.2)]
                  "
                >
                  <div className="flex flex-col space-y-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[rgba(59,130,246,1)] underline text-sm"
                    >
                      {item.type === 'image' ? 'Image' : 'Video'} Link
                    </a>
                    <input
                      type="text"
                      placeholder="Media Title"
                      value={formData.mediaTitles[index] || ''}
                      onChange={(e) => {
                        const newTitles = [...formData.mediaTitles];
                        newTitles[index] = e.target.value;
                        setFormData((prevData) => ({
                          ...prevData,
                          mediaTitles: newTitles,
                        }));
                      }}
                      className="
                        w-full p-1 text-sm
                        bg-[rgba(255,255,255,0.1)]
                        text-[rgba(255,255,255,0.9)]
                        border border-[rgba(255,255,255,0.2)]
                        rounded focus:outline-none
                      "
                    />
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => removeMedia(index)}
                      className="
                        px-2 py-1 bg-[rgba(239,68,68,1)]
                        hover:bg-[rgba(220,38,38,1)]
                        text-white rounded text-xs
                      "
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => moveMedia(index, 'up')}
                      disabled={index === 0}
                      className="
                        px-2 py-1 
                        bg-[rgba(107,114,128,1)]
                        hover:bg-[rgba(75,85,99,1)]
                        text-white rounded text-xs
                      "
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveMedia(index, 'down')}
                      disabled={index === formData.media.length - 1}
                      className="
                        px-2 py-1 
                        bg-[rgba(107,114,128,1)]
                        hover:bg-[rgba(75,85,99,1)]
                        text-white rounded text-xs
                      "
                    >
                      ↓
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Source (ko/en) */}
          <div>
            <label className="block mb-1 text-sm text-[rgba(200,200,200,0.8)]">
              Source ({activeLanguage})
            </label>
            <input
              type="text"
              className="
                w-full p-2 text-sm
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                border border-[rgba(255,255,255,0.2)]
                rounded focus:outline-none
              "
              placeholder="Reference source or URL"
              value={safeLangValue(formData.source, activeLanguage)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  source: updateLangField(prev.source, activeLanguage, e.target.value),
                }))
              }
            />
          </div>

          {/* 차트 생성/편집 모달 */}
          <div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="
                px-4 py-2 text-sm rounded
                bg-[rgba(59,130,246,1)]
                hover:bg-[rgba(37,99,235,1)]
              "
            >
              Create or Edit Chart
            </button>
          </div>
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.7)] z-50">
              <div className="bg-[rgba(0,0,0,0.9)] rounded p-4 relative w-[90%] max-w-4xl border border-[rgba(255,255,255,0.2)]">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-2 right-2 text-[rgba(255,255,255,0.9)] text-2xl"
                >
                  ×
                </button>
                <CreateLineChart
                  sortedData={sortedData}
                  onClose={() => setIsModalOpen(false)}
                  onSave={handleSaveChart}
                  locale={activeLanguage}
                />
              </div>
            </div>
          )}

          {/* 차트 미리보기 */}
          {chartConfig && chartConfig.selectedFields?.length > 0 && (
            <div className="
              p-2 mt-2 
              bg-[rgba(255,255,255,0.05)]
              text-[rgba(255,255,255,0.9)]
              border border-[rgba(255,255,255,0.2)]
              rounded
            ">
              <input
                type="text"
                className="
                  mb-2 w-full p-2 text-sm
                  bg-[rgba(255,255,255,0.1)]
                  border border-[rgba(255,255,255,0.2)]
                  rounded focus:outline-none
                  text-[rgba(255,255,255,0.9)]
                "
                placeholder="Chart Title"
                value={formData.chartTitle}
                onChange={(e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    chartTitle: e.target.value,
                  }))
                }
              />
              <Line
                data={getChartData(chartConfig, sortedData, activeLanguage)}
                options={getChartOptions({ ...chartConfig, chartTitle: formData.chartTitle }, activeLanguage)}
              />
              <button
                className="
                  px-4 py-2 mt-2 
                  bg-[rgba(107,114,128,1)]
                  hover:bg-[rgba(75,85,99,1)]
                  rounded text-sm
                "
                onClick={() => setIsModalOpen(true)}
              >
                Edit Chart
              </button>
            </div>
          )}

          {/* Context (ko/en) */}
          <div>
            <label className="block mb-1 text-sm text-[rgba(200,200,200,0.8)]">
              Context ({activeLanguage})
            </label>
            <textarea
              rows={6}
              className="
                w-full p-2 text-sm
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                border border-[rgba(255,255,255,0.2)]
                rounded focus:outline-none
              "
              placeholder="Enter context or notes here..."
              value={safeLangValue(formData.context, activeLanguage)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  context: updateLangField(prev.context, activeLanguage, e.target.value),
                }))
              }
            />
          </div>

          {/* Save/Cancel 버튼 */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleSave}
              className="
                px-4 py-2 rounded text-sm
                bg-[rgba(59,130,246,1)]
                hover:bg-[rgba(37,99,235,1)]
              "
            >
              {isEditing ? 'Update' : 'Save'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="
                  px-4 py-2 rounded text-sm
                  bg-[rgba(107,114,128,1)]
                  hover:bg-[rgba(75,85,99,1)]
                  text-[rgba(255,255,255,0.9)]
                "
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="sticky top-10 z-10 bg-black border-b border-[rgba(255,255,255,0.2)] flex space-x-2">
        <button
          type="button"
          className={`
            px-4 py-2 transition 
            ${
              view === 'Investment Point'
                ? 'border-b-2 border-[rgba(59,130,246,1)] text-[rgba(59,130,246,1)]'
                : 'text-[rgba(200,200,200,0.8)]'
            }
          `}
          onClick={() => setView('Investment Point')}
        >
          Investment Point
        </button>
        <button
          type="button"
          className={`
            px-4 py-2 transition
            ${
              view === 'Risk'
                ? 'border-b-2 border-[rgba(59,130,246,1)] text-[rgba(59,130,246,1)]'
                : 'text-[rgba(200,200,200,0.8)]'
            }
          `}
          onClick={() => setView('Risk')}
        >
          Risk
        </button>
      </div>

      

      {/* 기존 Investment Points 목록 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Existing Points</h2>
        {loading ? (
          <p className="text-[rgba(200,200,200,0.7)]">Loading...</p>
        ) : investmentPoints.length > 0 ? (
            (investmentPoints.filter((item) => item.type === view).map((item, index) => (
                <div
                    key={index}
                    className="rounded-lg overflow-hidden bg-[rgba(255,255,255,0.05)] shadow-md border border-[var(--border-mid)]"
                >
                    <div className="absoulte top-0 right-2 flex space-x-2">
                        <button
                        onClick={() => startEditing(item)}
                        className="
                            px-3 py-1 text-sm rounded 
                            bg-[rgba(59,130,246,1)]
                            hover:bg-[rgba(37,99,235,1)]
                        "
                        >
                        Edit
                        </button>
                        <button
                        onClick={() => handleDelete(item.id)}
                        className="
                            px-3 py-1 text-sm rounded 
                            bg-[rgba(239,68,68,1)]
                            hover:bg-[rgba(220,38,38,1)]
                        "
                        >
                        Delete
                        </button>
                    </div>
                    {/* 제목 라벨 */}
                    <button
                        style={{
                            fontFamily: 'Conthrax',
                        }}
                        className="w-full text-left p-4 text-gradient text-base hover:bg-opacity-90 transition-all min-h-28"
                        onClick={() => toggleItem(index)}
                    >
                        {safeLangValue(item.title, activeLanguage)}
                    </button>

                    {/* 내용 */}
                    <div
                        className={`transition-all duration-300 ease-in-out ${
                            activeItem === index
                                ? 'max-h-screen opacity-100'
                                : 'max-h-0 opacity-0'
                        }`}
                        style={{
                            overflow: 'hidden',
                            transitionProperty: 'max-height, opacity, padding',
                        }}
                    >
                        <div className="shadow-inner border-t border-t-[var(--border-mid)]">
                            <InvestmentPointItem
                                data={item}
                                timeline={kpiData.timeline}
                                locale={activeLanguage}
                            />
                        </div>
                    </div>
                </div>
            )))
        ) : (
          <p className="text-[rgba(200,200,200,0.7)]">No points found.</p>
        )}
      </section>
    </div>
  );
};

export default InvestmentPointManager;