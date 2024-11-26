'use client';

import { useState, useEffect } from 'react';
import { fetchInvestmentPoints, addInvestmentPoint, deleteData, updateData } from '@/app/firebase/fetch';
import { useParams } from 'next/navigation';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/app/firebase/firebase';
import { v4 as uuidv4 } from 'uuid';

import MagicWithOpenAI from './InvestmentPointAI';
import './investmentPointManager.css';
import { useKPI } from '@/context/GlobalData';

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

const InvestmentPointManager = () => {
    const { artist_id } = useParams();
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
        <div style={{ padding: '20px' }}>
            <h1>Manage Investment Points for Artist: {artist_id}</h1>

            <div>
                <h2>Existing Investment Points</h2>
                {loading ? (
                    <p>Loading investment points...</p>
                ) : investmentPoints.length > 0 ? (
                    <ul>
                        {investmentPoints.map((point) => (
                            <li key={point.id}>
                                <h3>{point.title} ({point.type})</h3>
                                <p>{point.context}</p>
                                {point.media.length > 0 ? (
                                    <div className="point-media">
                                    <h4>Media:</h4>
                                    <ul>
                                        {point.media.map((mediaItem, index) => (
                                            <li key={`${mediaItem.url}-${index}`}>
                                                {mediaItem.type === 'image' ? (
                                                    <div>
                                                        <img src={mediaItem.url} alt={mediaItem.title || `Image ${index + 1}`} style={{ maxWidth: '200px' }} />
                                                        {mediaItem.title && <p>{mediaItem.title}</p>}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <video controls style={{ maxWidth: '400px' }}>
                                                            <source src={mediaItem.url} type="video/mp4" />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                        {mediaItem.title && <p>{mediaItem.title}</p>}
                                                    </div>
                                                )}
                                                <a href={mediaItem.url} target="_blank" rel="noopener noreferrer">
                                                    {mediaItem.url}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                    </div>
                                ) : <p></p>}
                                {point.chartConfig && (
                                    <div style={{ marginTop: '20px' }}>
                                        <Line data={getChartData(point.chartConfig, sortedData)} options={getChartOptions(point.chartConfig)} />
                                    </div>
                                )}
                                <button onClick={() => startEditing(point)}>Edit</button>
                                <button onClick={() => handleDelete(point.id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No investment points found for this artist.</p>
                )}
            </div>

            <div style={{ marginBottom: '30px', marginTop: '100px' }}>
                <h2>{isEditing ? `Edit ${formData.type}` : `Add New ${formData.type}`}</h2>


                {/* 드롭다운으로 Investment Point와 Risk 선택 */}
                <label htmlFor="type">Select Type:</label>
                <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData((prevData) => ({ ...prevData, type: e.target.value }))}
                >
                    <option value="Investment Point">Investment Point</option>
                    <option value="Risk">Risk</option>
                </select>

                <form onSubmit={(e) => e.preventDefault()}>
                    <label htmlFor="title">Title:</label>
                    <input
                        id="title"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                    <br />
                    <label htmlFor="mediaType">Media Type:</label>
                    <select
                        id="mediaType"
                        value={mediaType}
                        onChange={(e) => setMediaType(e.target.value)}
                    >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                    </select>
                    <br />
                    <label>
                        Upload Media:
                        <input
                            type="file"
                            accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                            onChange={(e) => setUploadFile(e.target.files[0])}
                        />
                        <button type="button" onClick={handleFileUpload}>
                            Upload
                        </button>
                    </label>
                    <br />
                    <label>
                        Add Media URL:
                        <input
                            type="text"
                            value={newMediaUrl}
                            onChange={(e) => setNewMediaUrl(e.target.value)}
                        />
                        <button type="button" onClick={addMediaUrl}>
                            Add URL
                        </button>
                    </label>
                    {formData.media && formData.media.length > 0 ? (
                        <ul>
                            {formData.media.map((item, index) => (
                                <li key={item.url}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {/* 미디어 URL 및 링크 */}
                                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                                            {item.type === 'image' ? '🖼️' : '🎥'} {item.url}
                                        </a>
                                        {/* 미디어 제목 입력 */}
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
                                        />
                                        {/* 삭제 버튼 */}
                                        <button onClick={() => removeMedia(index)}>Remove</button>
                                        {/* 우선순위 버튼 */}
                                        <button onClick={() => moveMedia(index, 'up')} disabled={index === 0}>
                                            ⬆️
                                        </button>
                                        <button onClick={() => moveMedia(index, 'down')} disabled={index === formData.media.length - 1}>
                                            ⬇️
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (<></>)}
                    
                    <label>
                        Source:
                        <input
                            type="text"
                            value={formData.source}
                            onChange={(e) =>
                                setFormData((prevData) => ({
                                    ...prevData,
                                    source: e.target.value,
                                }))
                            }
                        />
                    </label>
                    <div>
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
                        <p>
                            Selected KPIs: {selectedKPIs.join(', ')}
                        </p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Create Line Chart
                    </button>

                    {isModalOpen && (
                        <CreateLineChart
                            sortedData={sortedData}
                            onClose={() => setIsModalOpen(false)}
                            onSave={handleSaveChart}
                        />
                    )}

                    {chartConfig && chartConfig.selectedFields && chartConfig.selectedFields.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <h2>Chart Preview with Markers</h2>
                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                <label>
                                    Chart Title:
                                    <input
                                        type="text"
                                        value={formData.chartTitle}
                                        onChange={(e) =>
                                            setFormData((prevData) => ({
                                                ...prevData,
                                                chartTitle: e.target.value,
                                            }))
                                        }
                                    />
                                </label>
                                <Line
                                    data={{
                                        labels: sortedData
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
                                            .map((data) => new Date(data.date).toLocaleDateString()),
                                        datasets: chartConfig.selectedFields.map((configItem) => ({
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
                                            borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                            tension: 0.4,
                                        })),
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { display: true, position: 'top' },
                                            title: { display: true, text: formData.chartTitle || 'Chart with Markers' },
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
                                                                enabled: true,
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
                                                                enabled: true,
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
                                    }}
                                />
                            </div>

                            <button
                                className="secondary-button"
                                onClick={() => setIsModalOpen(true)}
                                style={{ marginTop: '10px' }}
                            >
                                Edit Chart
                            </button>
                        </div>
                    )}

                    <br />

                    <div>
                        <h2>Context</h2>
                        <textarea
                            value={formData.context}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, context: e.target.value }))
                            }
                            placeholder="Enter your context here..."
                            rows={6}
                            style={{ width: '100%' }}
                        />
                        <MagicWithOpenAI
                            title={formData.title}
                            context={formData.context}
                            setContext={(enhancedContext) =>
                                setFormData((prev) => ({ ...prev, context: enhancedContext }))
                            }
                            kpiData={selectedKPIs}
                            chartConfig={chartConfig}
                        />
                    </div>
                    <br />

                    <button type="button" onClick={handleSave}>
                        {isEditing ? `Update ${formData.type}` : `Save ${formData.type}`}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={resetForm}>
                            Cancel
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default InvestmentPointManager;