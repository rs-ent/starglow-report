'use client';

import { useState, useEffect } from 'react';
import { fetchInvestmentPoints, addInvestmentPoint, deleteData, updateData } from '../../firebase/fetch';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/firebase';
import { v4 as uuidv4 } from 'uuid';

import MagicWithOpenAI from './InvestmentPointAI';
import './investmentPointManager.css';
import { useKPI } from '../../../context/GlobalData';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin, zoomPlugin);
import { Line } from 'react-chartjs-2';

import dynamic from 'next/dynamic';
const CreateLineChart = dynamic(() => import('./CreateLineChart'), { ssr: false });

const predefinedColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
const getChartData = (chartConfig, sortedData) => {
    const labels = sortedData
        .filter((data) => {
            const date = new Date(data.date);
            const { start, end } = chartConfig.dateRange || {};
            if (!start || !end) {
                console.error('Invalid dateRange:', chartConfig.dateRange);
            }
            return (
                (!start || date >= new Date(start)) &&
                (!end || date <= new Date(end))
            );
        })
        .map((data) => new Date(data.date).toLocaleDateString());

    const datasets = chartConfig.selectedFields.map((configItem, index) => ({
        label: configItem.label || configItem.field,
        data: sortedData
            .filter((data) => {
                const date = new Date(data.date);
                const { start, end } = chartConfig.dateRange || {};
                if (!start || !end) {
                    console.error('Invalid dateRange:', chartConfig.dateRange);
                }
                return (
                    (!start || date >= new Date(start)) &&
                    (!end || date <= new Date(end))
                );
            })
            .map((data) => data[configItem.field]),
        borderColor: predefinedColors[index % predefinedColors.length],
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        tension: 0.4,
    }));

    return { labels, datasets };
};

const getChartOptions = (chartConfig) => ({
    responsive: true,
    plugins: {
        legend: { display: true, position: 'top' },
        title: { display: true, text: 'Chart Preview' },
        annotation: {
            annotations: chartConfig.markers.reduce((acc, marker, index) => {
                if (marker.type === 'point') {
                    acc[`marker_${index}`] = {
                        type: 'point',
                        xValue: marker.xValue,
                        yValue: marker.yValue,
                        backgroundColor: marker.color || 'rgba(255, 99, 132, 0.3)',
                        radius: marker.radius || 8,
                        label: {
                            content: marker.description || `Point ${index + 1}`,
                            enabled: !!marker.description,
                            position: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
                        backgroundColor: `rgba(${parseInt(marker.color.slice(1, 3), 16)}, ${parseInt(marker.color.slice(3, 5), 16)}, ${parseInt(marker.color.slice(5, 7), 16)}, ${marker.alpha || 0.3})`,
                        borderColor: marker.borderColor || 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        label: {
                            content: marker.description || `Box ${index + 1}`,
                            enabled: !!marker.description,
                            position: 'start',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
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

const InvestmentPointManager = ({artist_id}) => {
    const [investmentPoints, setInvestmentPoints] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        type: 'Investment Point',
        title: '',
        context: '',
        media: [], // 이미지와 비디오를 통합하여 관리
        mediaTitles: [], // 각각의 미디어 제목
        chartConfig: null, // 차트 설정 포함
        selectedKPIs: [],  // 선택된 KPI 포함
        chartTitle: '', // 차트 제목
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
    const filteredKPIData = Object.entries(kpiData).filter(([key, value]) => {
        return typeof value === 'number' || typeof value === 'string'; // 숫자나 문자열인 값만 포함
    });
    const sortedData = kpiData.sortedData;

    const toggleKPISelection = (kpiKey) => {
        setSelectedKPIs((prev) => {
            if (prev.includes(kpiKey)) {
                return prev.filter((key) => key !== kpiKey); // 이미 선택된 KPI를 해제
            } else if (prev.length < 4) {
                return [...prev, kpiKey]; // 최대 4개까지만 선택 가능
            } else {
                console.error('You can select up to 4 KPIs.');
                return prev;
            }
        });
    };

    useEffect(() => {
        if (artist_id) {
            loadInvestmentPoints();
        }
    }, [artist_id]);

    const loadInvestmentPoints = async () => {
        setLoading(true);
        try {
            const points = await fetchInvestmentPoints(artist_id);
            console.log(points);
            setInvestmentPoints(points);
        } catch (error) {
            console.error('Fetch error:', error);
            console.error('Error loading investment points.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async () => {
        if (!uploadFile) {
            console.error('No file selected for upload.');
            return;
        }
    
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
                        type: mediaType, // 'image' 또는 'video'
                        title: '', // 나중에 입력할 수 있도록 초기화
                    },
                ],
            }));
    
            setUploadFile(null);
            console.log('File uploaded successfully!');
        } catch (error) {
            console.error('File upload error:', error);
            console.error(`Error uploading file: ${error.message}`);
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
        if (!newMediaUrl) {
            console.error('URL cannot be empty.');
            return;
        }
    
        if (!isValidUrl(newMediaUrl)) {
            console.error('Invalid URL format.');
            return;
        }
    
        setFormData((prevData) => ({
            ...prevData,
            media: [
                ...prevData.media,
                {
                    url: newMediaUrl,
                    type: mediaType, // 'image' 또는 'video'
                    title: '', // 초기 제목은 비워둠
                },
            ],
        }));
    
        setNewMediaUrl('');
        console.log(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} URL added successfully!`);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.context) {
            console.error('Title and context are required.');
            return;
        }
    
        try {
            const newPoint = {
                ...formData,
                id: formData.id || `IP-${new Date().toISOString()}`,
                artist_id,
            };
    
            if (isEditing) {
                await updateData(formData.id, 'InvestmentPoint', newPoint);
    
                setInvestmentPoints((prev) =>
                    prev.map((point) =>
                        point.id === formData.id ? { ...point, ...newPoint } : point
                    )
                );
                console.log('Investment point updated successfully!');
            } else {
                const docId = await addInvestmentPoint(newPoint);
                setInvestmentPoints([...investmentPoints, { id: docId, ...newPoint }]);
                console.log('Investment point added successfully!');
            }
    
            resetForm();
        } catch (error) {
            console.error('Save error:', error);
            console.error('Error saving investment point.');
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            type: 'Investment Point', // 초기값: 투자 포인트
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
    };

    const removeMedia = (index) => {
        setFormData((prevData) => ({
            ...prevData,
            media: prevData.media.filter((_, i) => i !== index), // 해당 인덱스의 미디어 제거
            mediaTitles: prevData.mediaTitles.filter((_, i) => i !== index), // 제목도 동기화
        }));
        console.log('Media removed.');
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
        const confirm = window.confirm(`Are you sure you want to delete this investment point? ${id}`);
        if (!confirm) return;
    
        try {
            await deleteData(id, 'InvestmentPoint');
            const updatedPoints = investmentPoints.filter(point => point.id !== id);
            setInvestmentPoints(updatedPoints);
            console.log('Investment point deleted successfully!');
        } catch (error) {
            console.error('Delete error:', error);
            console.error('Error deleting investment point.');
        }
    };

    const startEditing = (point) => {
        setFormData({
            ...point
        });
        setIsEditing(true);
    };

    const handleSaveChart = (config) => {
        setChartConfig(config);
        setFormData((prevData) => ({
            ...prevData,
            chartConfig: config,
        }));
        console.log('Saved Chart Config:', config); // 저장된 차트 설정 확인
    };

    return (
        <div className="investment-point-manager">
            <h1>Manage Investment Points for Artist: {artist_id}</h1>

            <div className="existing-investment-points">
                <h2>Existing Investment Points</h2>
                {loading ? (
                    <p>Loading investment points...</p>
                ) : investmentPoints.length > 0 ? (
                    <ul className="investment-point-list">
                        {investmentPoints.map((point) => (
                            <li key={point.id} className="investment-point-item">
                                <h3>{point.title} ({point.type})</h3>
                                <p>{point.context}</p>
                                {point.media.length > 0 && (
                                    <div className="point-media">
                                        <h4>Media:</h4>
                                        <ul className="media-list">
                                            {point.media.map((mediaItem, index) => (
                                                <li key={`${mediaItem.url}-${index}`} className="media-item">
                                                    {mediaItem.type === 'image' ? (
                                                        <img src={mediaItem.url} alt={mediaItem.title || `Image ${index + 1}`} className="media-image" />
                                                    ) : (
                                                        <video controls className="media-video">
                                                            <source src={mediaItem.url} type="video/mp4" />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    )}
                                                    {mediaItem.title && <p className="media-title">{mediaItem.title}</p>}
                                                    <a href={mediaItem.url} target="_blank" rel="noopener noreferrer" className="media-link">
                                                        {mediaItem.url}
                                                    </a>
                                                    <div className="media-actions">
                                                        <button onClick={() => removeMedia(index)} className="btn btn-remove">Remove</button>
                                                        <button onClick={() => moveMedia(index, 'up')} disabled={index === 0} className="btn btn-move">⬆️</button>
                                                        <button onClick={() => moveMedia(index, 'down')} disabled={index === formData.media.length - 1} className="btn btn-move">⬇️</button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {point.chartConfig && (
                                    <div className="chart-preview">
                                        <Line data={getChartData(point.chartConfig, sortedData)} options={getChartOptions(point.chartConfig)} />
                                    </div>
                                )}
                                <div className="point-actions">
                                    <button onClick={() => startEditing(point)} className="btn btn-edit">Edit</button>
                                    <button onClick={() => handleDelete(point.id)} className="btn btn-delete">Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No investment points found for this artist.</p>
                )}
            </div>

            <div className="add-investment-point">
                <h2>{isEditing ? `Edit ${formData.type}` : `Add New ${formData.type}`}</h2>

                <form onSubmit={(e) => e.preventDefault()} className="investment-form">
                    <div className="form-group">
                        <label htmlFor="type">Select Type:</label>
                        <select
                            id="type"
                            value={formData.type}
                            onChange={(e) => setFormData((prevData) => ({ ...prevData, type: e.target.value }))}
                            className="form-control"
                        >
                            <option value="Investment Point">Investment Point</option>
                            <option value="Risk">Risk</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">Title:</label>
                        <input
                            id="title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="form-control"
                        />
                    </div>

                    {/* Media Upload Section */}
                    <div className="form-group">
                        <label htmlFor="mediaType">Media Type:</label>
                        <select
                            id="mediaType"
                            value={mediaType}
                            onChange={(e) => setMediaType(e.target.value)}
                            className="form-control"
                        >
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Upload Media:</label>
                        <input
                            type="file"
                            accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                            onChange={(e) => setUploadFile(e.target.files[0])}
                            className="form-control-file"
                        />
                        <button type="button" onClick={handleFileUpload} className="btn btn-primary">Upload</button>
                    </div>

                    <div className="form-group">
                        <label>Add Media URL:</label>
                        <input
                            type="text"
                            value={newMediaUrl}
                            onChange={(e) => setNewMediaUrl(e.target.value)}
                            className="form-control"
                            placeholder="Enter media URL"
                        />
                        <button type="button" onClick={addMediaUrl} className="btn btn-primary">Add URL</button>
                    </div>

                    {/* Media List */}
                    {formData.media && formData.media.length > 0 && (
                        <ul className="media-list">
                            {formData.media.map((item, index) => (
                                <li key={item.url} className="media-item">
                                    <div className="media-details">
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="media-link">
                                            {item.type === 'image' ? '🖼️' : '🎥'} {item.url}
                                        </a>
                                        <input
                                            type="text"
                                            placeholder={`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Title`}
                                            value={formData.mediaTitles[index] || ''}
                                            onChange={(e) => {
                                                const newTitles = [...formData.mediaTitles];
                                                newTitles[index] = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    mediaTitles: newTitles,
                                                }));
                                            }}
                                            className="form-control media-title-input"
                                        />
                                    </div>
                                    <div className="media-actions">
                                        <button onClick={() => removeMedia(index)} className="btn btn-remove">Remove</button>
                                        <button onClick={() => moveMedia(index, 'up')} disabled={index === 0} className="btn btn-move">⬆️</button>
                                        <button onClick={() => moveMedia(index, 'down')} disabled={index === formData.media.length - 1} className="btn btn-move">⬇️</button>
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
                            placeholder="Enter source"
                        />
                    </div>

                    {/* KPI Selection */}
                    <div className="kpi-section">
                        <h2>Select up to 4 KPIs</h2>
                        <div className="kpi-scroll-container">
                            {filteredKPIData.map(([key, value]) => (
                                <div className="kpi-card" key={key}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={selectedKPIs.includes(key)}
                                            onChange={() => toggleKPISelection(key)}
                                        />
                                        <div className="kpi-content">
                                            <h3>{key}</h3>
                                            <p>{typeof value === 'number' ? Number(value.toFixed(2)).toLocaleString() : value}</p>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                        <p className="selected-kpis">Selected KPIs: {selectedKPIs.join(', ')}</p>
                    </div>

                    {/* Create Line Chart Button */}
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Create Line Chart
                    </button>

                    {/* Modal for Chart Creation */}
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

                    {/* Chart Preview */}
                    {chartConfig && chartConfig.selectedFields && chartConfig.selectedFields.length > 0 && (
                        <div className="chart-preview">
                            <h2>Chart Preview with Markers</h2>
                            <div className="chart-container">
                                <label>
                                    Chart Title:
                                    <input
                                        type="text"
                                        value={formData.chartTitle}
                                        onChange={(e) => setFormData((prevData) => ({ ...prevData, chartTitle: e.target.value }))}
                                        className="form-control"
                                        placeholder="Enter chart title"
                                    />
                                </label>
                                <Line
                                    data={getChartData(chartConfig, sortedData)}
                                    options={getChartOptions(chartConfig)}
                                />
                            </div>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Edit Chart
                            </button>
                        </div>
                    )}

                    {/* Context Section */}
                    <div className="context-section">
                        <h2>Context</h2>
                        <textarea
                            value={formData.context}
                            onChange={(e) => setFormData((prev) => ({ ...prev, context: e.target.value }))}
                            placeholder="Enter your context here..."
                            rows={6}
                            className="form-control"
                        />
                        <MagicWithOpenAI
                            title={formData.title}
                            context={formData.context}
                            setContext={(enhancedContext) => setFormData((prev) => ({ ...prev, context: enhancedContext }))}
                            kpiData={selectedKPIs}
                            chartConfig={chartConfig}
                        />
                    </div>

                    {/* Save and Cancel Buttons */}
                    <div className="form-actions">
                        <button type="button" onClick={handleSave} className="btn btn-primary">
                            {isEditing ? `Update ${formData.type}` : `Save ${formData.type}`}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={resetForm} className="btn btn-secondary">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvestmentPointManager;