'use client';

import { useState, useEffect } from 'react';
import { fetchInvestmentPoints, addInvestmentPoint, deleteData, updateData } from '../../firebase/fetch';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/firebase';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';
import { useKPI } from '../../../context/GlobalData';

import MagicWithOpenAI from './InvestmentPointAI';
import './investmentPointManager.css';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin, zoomPlugin);

const CreateLineChart = dynamic(() => import('./CreateLineChart'), { ssr: false });

const predefinedColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

// 차트 데이터 구성
const getChartData = (chartConfig, sortedData) => {
    const labels = sortedData
        .filter((data) => {
            const date = new Date(data.date);
            const { start, end } = chartConfig.dateRange || {};
            return (!start || date >= new Date(start)) && (!end || date <= new Date(end));
        })
        .map((data) => new Date(data.date).toLocaleDateString());

    const datasets = chartConfig.selectedFields.map((configItem, index) => ({
        label: configItem.label || configItem.field,
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

// 차트 옵션
const getChartOptions = (chartConfig) => ({
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
                            content: marker.description || `Point ${index + 1}`,
                            enabled: !!marker.description,
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
                            content: marker.description || `Box ${index + 1}`,
                            enabled: !!marker.description,
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

// 유튜브 URL 파싱 함수 (shorts 포함)
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
            // 시작시간 파라미터 t 지원
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
    const [investmentPoints, setInvestmentPoints] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        artist_id: artist_id,
        type: 'Investment Point',
        title: '',
        context: '',
        media: [],
        mediaTitles: [],
        chartConfig: null,
        selectedKPIs: [],
        chartTitle: '',
        source: '',
    });
    const [uploadFile, setUploadFile] = useState(null);
    const [newMediaUrl, setNewMediaUrl] = useState('');
    const [mediaType, setMediaType] = useState('image');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedKPIs, setSelectedKPIs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chartConfig, setChartConfig] = useState(null);

    const kpiData = useKPI();
    const filteredKPIData = Object.entries(kpiData).filter(([key, value]) => typeof value === 'number' || typeof value === 'string');
    const sortedData = kpiData.timeline;

    useEffect(() => {
        if (artist_id) {
            loadInvestmentPoints();
        }
    }, [artist_id]);

    const loadInvestmentPoints = async () => {
        setLoading(true);
        try {
            const points = await fetchInvestmentPoints(artist_id);
            setInvestmentPoints(points);
        } catch (error) {
            console.error('Error loading investment points:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleKPISelection = (kpiKey) => {
        setSelectedKPIs((prev) => {
            if (prev.includes(kpiKey)) {
                return prev.filter((key) => key !== kpiKey);
            } else if (prev.length < 4) {
                return [...prev, kpiKey];
            } else {
                alert('You can select up to 4 KPIs.');
                return prev;
            }
        });
    };

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
            alert('Please provide a valid URL');
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

    const handleSave = async () => {
        if (!formData.title.trim() || !formData.context.trim()) {
            alert('Title and context are required.');
            return;
        }

        const newPoint = {
            ...formData,
            id: formData.id || `IP-${new Date().toISOString()}`,
            artist_id: artist_id,
        };

        try {
            if (isEditing) {
                await updateData(formData.id, 'InvestmentPoint', newPoint);
                setInvestmentPoints((prev) =>
                    prev.map((point) =>
                        point.id === formData.id ? { ...point, ...newPoint } : point
                    )
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
            type: 'Investment Point',
            title: '',
            context: '',
            media: [],
            mediaTitles: [],
            chartConfig: null,
            selectedKPIs: [],
            chartTitle: '',
            source: '',
        });
        setIsEditing(false);
        setSelectedKPIs([]);
        setChartConfig(null);
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

    const handleDelete = async (id) => {
        if (!confirm('Delete this investment point?')) return;

        try {
            await deleteData(id, 'InvestmentPoint');
            setInvestmentPoints(investmentPoints.filter((point) => point.id !== id));
        } catch (error) {
            console.error('Error deleting investment point:', error);
        }
    };

    const startEditing = (point) => {
        setFormData({ ...point });
        setSelectedKPIs(point.selectedKPIs || []);
        setChartConfig(point.chartConfig || null);
        setIsEditing(true);
    };

    const handleSaveChart = (config) => {
        setChartConfig(config);
        setFormData((prevData) => ({
            ...prevData,
            chartConfig: config,
        }));
    };

    return (
        <div className="investment-point-manager">
            <h1>Investment Point Management</h1>

            <section className="existing-investment-points">
                <h2>Existing Points</h2>
                {loading ? (
                    <p className="loading">Loading...</p>
                ) : investmentPoints.length > 0 ? (
                    <ul className="investment-point-list">
                        {investmentPoints.map((point) => (
                            <li key={point.id} className="investment-point-item">
                                <div className="item-header">
                                    <h3>{point.title} ({point.type})</h3>
                                    <div className="item-actions">
                                        <button onClick={() => startEditing(point)} className="btn btn-primary">Edit</button>
                                        <button onClick={() => handleDelete(point.id)} className="btn btn-remove">Delete</button>
                                    </div>
                                </div>
                                <p className="item-context whitespace-pre-wrap">{point.context}</p>
                                {point.media.map((mediaItem, index) => (
                                    <div key={`${mediaItem.url}-${index}`} className="media-block">
                                        {mediaItem.type === 'image' ? (
                                            <img src={mediaItem.url} alt={mediaItem.title || `Image ${index + 1}`} className="media-image" />
                                        ) : (
                                            <div className="media-video-wrapper">
                                                <iframe
                                                    className="media-video"
                                                    src={extractYouTubeEmbedUrl(mediaItem.url)}
                                                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    title="Video"
                                                ></iframe>
                                            </div>
                                        )}
                                        {mediaItem.title && <p className="media-title">{mediaItem.title}</p>}
                                    </div>
                                ))}
                                {point.chartConfig && (
                                    <div className="chart-preview">
                                        <Line data={getChartData(point.chartConfig, sortedData)} options={getChartOptions(point.chartConfig)} />
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No points found.</p>
                )}
            </section>

            <section className="add-investment-point">
                <h2>{isEditing ? 'Edit Investment Point' : 'Add New Investment Point'}</h2>

                <form onSubmit={(e) => e.preventDefault()} className="investment-form">
                    <div className="form-group">
                        <label>Type:</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData((prevData) => ({ ...prevData, type: e.target.value }))}
                            className="form-control"
                        >
                            <option value="Investment Point">Investment Point</option>
                            <option value="Risk">Risk</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Title:</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="form-control"
                            placeholder="Enter title"
                        />
                    </div>

                    <div className="form-group">
                        <label>Media Type:</label>
                        <select
                            value={mediaType}
                            onChange={(e) => setMediaType(e.target.value)}
                            className="form-control"
                        >
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                        </select>
                    </div>

                    <div className="form-group media-upload-group">
                        <label>Upload File:</label>
                        <input
                            type="file"
                            accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                            onChange={(e) => setUploadFile(e.target.files[0])}
                            className="form-control"
                        />
                        <button type="button" onClick={handleFileUpload} className="btn btn-primary">Upload</button>
                    </div>

                    <div className="form-group media-url-group">
                        <label>Or Add Media URL:</label>
                        <input
                            type="text"
                            value={newMediaUrl}
                            onChange={(e) => setNewMediaUrl(e.target.value)}
                            className="form-control"
                            placeholder="e.g. https://youtu.be/PK32nWq81xA"
                        />
                        <button type="button" onClick={addMediaUrl} className="btn btn-primary">Add URL</button>
                    </div>

                    {formData.media && formData.media.length > 0 && (
                        <ul className="media-list">
                            {formData.media.map((item, index) => (
                                <li key={item.url} className="media-item">
                                    <div className="media-link-row">
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="media-link">
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
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="media-actions">
                                        <button onClick={() => removeMedia(index)} className="btn btn-remove">Remove</button>
                                        <button onClick={() => moveMedia(index, 'up')} disabled={index === 0} className="btn btn-secondary">↑</button>
                                        <button onClick={() => moveMedia(index, 'down')} disabled={index === formData.media.length - 1} className="btn btn-secondary">↓</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="form-group">
                        <label>Source:</label>
                        <input
                            type="text"
                            value={formData.source}
                            onChange={(e) => setFormData((prevData) => ({ ...prevData, source: e.target.value }))}
                            className="form-control"
                            placeholder="Reference source or URL"
                        />
                    </div>

                    {/*<div className="form-group">
                        <h3>Select up to 4 KPIs</h3>
                        <div className="kpi-list">
                            {filteredKPIData.map(([key, value]) => (
                                <label key={key} className="kpi-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedKPIs.includes(key)}
                                        onChange={() => toggleKPISelection(key)}
                                    />
                                    <span>{key}: {typeof value === 'number' ? Number(value.toFixed(2)).toLocaleString() : value}</span>
                                </label>
                            ))}
                        </div>
                        <p className="selected-kpis">Selected: {selectedKPIs.join(', ') || 'None'}</p>
                    </div>*/}

                    <button
                        type="button"
                        className="btn btn-chart"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Create or Edit Chart
                    </button>

                    {isModalOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <button onClick={() => setIsModalOpen(false)} className="close-button">×</button>
                                <CreateLineChart
                                    sortedData={sortedData}
                                    onClose={() => setIsModalOpen(false)}
                                    onSave={handleSaveChart}
                                />
                            </div>
                        </div>
                    )}

                    {chartConfig && chartConfig.selectedFields && chartConfig.selectedFields.length > 0 && (
                        <>
                        <input
                            type="text"
                            value={formData.chartTitle}
                            onChange={(e) => setFormData((prevData) => ({ ...prevData, chartTitle: e.target.value }))}
                            className="form-control"
                            placeholder="Chart Title"
                        />
                        <div className="chart-preview">
                            <Line
                                data={getChartData(chartConfig, sortedData)}
                                options={getChartOptions({ ...chartConfig, chartTitle: formData.chartTitle })}
                            />
                            <button
                                className="btn btn-secondary"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Edit Chart
                            </button>
                        </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Context:</label>
                        <textarea
                            value={formData.context}
                            onChange={(e) => setFormData((prev) => ({ ...prev, context: e.target.value }))}
                            className="form-control"
                            rows={6}
                            placeholder="Enter context or notes here..."
                        />
                    </div>
                    <MagicWithOpenAI
                        title={formData.title}
                        context={formData.context}
                        setContext={(enhancedContext) => setFormData((prev) => ({ ...prev, context: enhancedContext }))}
                        kpiData={selectedKPIs}
                        chartConfig={chartConfig}
                    />

                    <div className="form-actions">
                        <button type="button" onClick={handleSave} className="btn btn-primary">
                            {isEditing ? 'Update' : 'Save'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={resetForm} className="btn btn-secondary">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </section>
        </div>
    );
};

export default InvestmentPointManager;