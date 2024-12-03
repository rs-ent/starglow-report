// src/app/[artist_id]/rewards-manager/ImagePool.js

import React, { useCallback } from 'react';
import { uploadFiles, deleteFile } from '../../firebase/fetch';
import { v4 as uuidv4 } from 'uuid'; // UUID 생성용
import Toast from '../../components/client/Toast';

const ImagePool = ({ artist_id, imagePool, setImagePool, setToastMessage }) => {

    // 이미지 업로드 핸들러
    const handleImageUpload = useCallback(async (mockupId, e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            try {
                const uploadResults = await uploadFiles(files, `rewards/${artist_id}/${mockupId}/`, (index, progress) => {
                    console.log(`Uploading ${mockupId} file ${index}: ${progress}%`);
                });
                const newImages = uploadResults.map(({ downloadURL }) => ({ url: downloadURL, focalPoint: null }));
                setImagePool((prev) => ({
                    ...prev,
                    [mockupId]: prev[mockupId] ? [...prev[mockupId], ...newImages] : [...newImages],
                }));
                setToastMessage('Images uploaded successfully!');
            } catch (error) {
                console.error('Error uploading images:', error);
                alert('Failed to upload images.');
            }
        }
    }, [artist_id, setImagePool, setToastMessage]);

    // 이미지 제거 핸들러
    const handleImageRemove = useCallback(async (mockupId, image) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                // Firebase Storage에서 이미지 삭제
                const filePath = decodeURIComponent(new URL(image.url).pathname.substring(1)); // 예: 'storage_path/file.jpg'
                await deleteFile(filePath);
                // 로컬 상태에서 이미지 제거
                setImagePool((prev) => ({
                    ...prev,
                    [mockupId]: prev[mockupId].filter((img) => img.url !== image.url),
                }));
                setToastMessage('Image removed successfully!');
            } catch (error) {
                console.error('Error removing image:', error);
                alert('Failed to remove image.');
            }
        }
    }, [setImagePool, setToastMessage]);

    // 이미지의 focal point 설정 핸들러
    const handleSetFocalPoint = useCallback((mockupId, imageUrl, event) => {
        const container = event.currentTarget;
        const rect = container.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width).toFixed(3);
        const y = ((event.clientY - rect.top) / rect.height).toFixed(3);
        setImagePool((prev) => ({
            ...prev,
            [mockupId]: prev[mockupId].map((img) =>
                img.url === imageUrl ? { ...img, focalPoint: { x: Number(x), y: Number(y) } } : img
            ),
        }));
        setToastMessage('Focal point set successfully!');
    }, [setImagePool, setToastMessage]);

    // Mockup 유형 리스트
    const mockupTypes = ['Photocard', 'Album', 'Invitation', 'Goods']; // 필요에 따라 추가

    return (
        <div className="p-6 mb-6 bg-[var(--background)] border border-[var(--foreground)]">
            <h3 className="text-lg font-bold mb-4">Image Pool</h3>
            {mockupTypes.map((mockupId) => (
                <div key={mockupId} className="mb-4">
                    <h4 className="font-bold mb-2">{mockupId} Image Pool</h4>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(mockupId, e)}
                        className="border rounded w-full p-2 mb-2"
                    />
                    {imagePool[mockupId] && imagePool[mockupId].length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {imagePool[mockupId].map((image, idx) => (
                                <div key={uuidv4()} className="relative">
                                    <div
                                        className="w-32 h-32 relative cursor-pointer"
                                        onClick={(e) => handleSetFocalPoint(mockupId, image.url, e)}
                                        title="Click to set focal point"
                                    >
                                        <img src={image.url} alt={`${mockupId} ${idx}`} className="w-32 h-32 object-cover rounded" />
                                        {image.focalPoint && (
                                            <div
                                                className="absolute"
                                                style={{
                                                    top: `${image.focalPoint.y * 100}%`,
                                                    left: `${image.focalPoint.x * 100}%`,
                                                    transform: 'translate(-50%, -50%)',
                                                    width: '10px',
                                                    height: '10px',
                                                    backgroundColor: 'rgba(255, 0, 0, 0.7)',
                                                    borderRadius: '50%',
                                                }}
                                            />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleImageRemove(mockupId, image)}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        &times;
                                    </button>
                                    {!image.focalPoint && (
                                        <button
                                            onClick={(e) => handleSetFocalPoint(mockupId, image.url, e)}
                                            className="absolute bottom-0 left-0 bg-blue-500 text-white rounded px-2 py-1 text-xs"
                                        >
                                            Set Focal Point
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No images in the pool.</p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ImagePool;