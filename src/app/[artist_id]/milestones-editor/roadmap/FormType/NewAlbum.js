'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const NewAlbumForm = forwardRef(({ date, category = { label: '앨범 발매', value: 'new_album' } }, ref) => {
    // 초기 데이터
    const initialFormData = {
        albumName: category.label + ' 예정',
        releaseDate: date || '',
        total_tracks: 1,
        album_type: '싱글',
        description: '',
        category: category.label,
        dist: 'discography',
        form: category.value || 'new_album'
    };

    const [formData, setFormData] = useState(initialFormData);

    // date prop이 변경될 때 formData 업데이트
    useEffect(() => {
        if (date) {
            setFormData((prev) => ({
                ...prev,
                releaseDate: date,
            }));
        }
    }, [date]);

    // 트랙 수 변경에 따른 앨범 타입 자동 업데이트
    useEffect(() => {
        const calculateAlbumType = () => {
            if (formData.total_tracks >= 3 && formData.total_tracks <= 6) return 'EP';
            if (formData.total_tracks >= 7 && formData.total_tracks <= 9) return '미니 앨범';
            if (formData.total_tracks >= 10) return '정규 앨범';
            return '싱글';
        };

        const albumType = calculateAlbumType();
        if (formData.album_type !== albumType) {
            setFormData((prev) => ({
                ...prev,
                album_type: albumType,
            }));
        }
    }, [formData.total_tracks]);

    // 부모가 호출할 수 있는 메서드 정의
    useImperativeHandle(ref, () => ({
        getFormData: () => {
            if (!formData.albumName || !formData.releaseDate) {
                alert('모든 필수 항목을 입력해주세요.');
                return null;
            }
            return formData;
        },
    }));

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="p-4 bg-white shadow rounded">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="mb-1">
                    <label className="block mb-2">앨범명</label>
                    <input
                        type="text"
                        value={formData.albumName}
                        onChange={(e) => handleInputChange('albumName', e.target.value)}
                        placeholder="앨범명을 입력하세요."
                        className="w-full p-2 border rounded mb-4"
                        required
                    />
                </div>

                <div className="mb-1">
                    <label className="block mb-2">발매 날짜</label>
                    <input
                        type="month"
                        value={formData.releaseDate}
                        onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                        className="w-full p-2 border rounded mb-4"
                        required
                    />
                </div>

                <div className="mb-1">
                    <label className="block mb-2">트랙 수</label>
                    <input
                        type="number"
                        min="1"
                        value={formData.total_tracks}
                        onChange={(e) => handleInputChange('total_tracks', Number(e.target.value))}
                        className="w-full p-2 border rounded mb-4"
                        required
                    />
                </div>

                <div className="mb-1">
                    <label className="block mb-2">앨범 유형</label>
                    <select
                        value={formData.album_type}
                        onChange={(e) => handleInputChange('album_type', e.target.value)}
                        className="w-full p-2 border rounded mb-4"
                    >
                        <option value="싱글">싱글</option>
                        <option value="EP">EP</option>
                        <option value="미니 앨범">미니 앨범</option>
                        <option value="정규 앨범">정규 앨범</option>
                    </select>
                </div>

                <div className="mb-1">
                    <label className="block mb-2">추가 설명</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="추가적인 정보를 입력하세요 (선택 사항)."
                        className="w-full p-2 border rounded mb-4"
                        rows={4}
                    />
                </div>
            </div>
        </div>
    );
});

export default NewAlbumForm;