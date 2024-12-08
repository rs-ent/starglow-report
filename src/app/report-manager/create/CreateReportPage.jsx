'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // URL 파라미터 접근 예제
import { saveData, uploadFiles, fetchData } from '../../firebase/fetch';

export default function CreateReportPage() {
    const searchParams = useSearchParams();
    const docId = searchParams.get('docId'); // docId가 URL 파라미터로 주어졌다고 가정
    const [formData, setFormData] = useState({
        artist_eng: "KNK",
        artist_id: "knk_20160303",
        artist_kor: "크나큰",
        background: null,
        circlechart_target: "202409",
        current_fund: 13875000,
        gallery: null,
        goal_fund: 200000000,
        image_alpha: "",
        investor_count: 650,
        investors_share_ratio: 0.4,
        macro_marketGrowth_comment: "-",
        main_color: "#FFB1B9",
        melon_artist_id: "946943",
        meso_circlechart_comment: "TEST",
        project_status: "모집중",
        sub_title: "크나큰 IPO 리포트",
        title: "KNK IPO REPORT",
        type: "아이돌"
    });

    const [localPreview, setLocalPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // docId가 있으면 해당 리포트 불러와서 formData 초기화
    useEffect(() => {
        if (docId) {
            (async () => {
                const report = await fetchData('Report', {comp: 'docId', val: docId});
                if (report) {
                    setFormData(prev => ({
                        ...prev,
                        ...report
                    }));
                    if (report.image_alpha) {
                        setLocalPreview(report.image_alpha); // 기존 이미지 미리보기
                    }
                }
            })();
        }
    }, [docId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        if (['current_fund', 'goal_fund', 'investor_count'].includes(name)) {
            newValue = parseInt(value, 10);
        } else if (name === 'investors_share_ratio') {
            newValue = parseFloat(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const localURL = URL.createObjectURL(file);
            setLocalPreview(localURL);

            setUploading(true);
            setUploadProgress(0);

            try {
                const results = await uploadFiles([file], "reports/KNK/image_alpha/", (index, progress) => {
                    setUploadProgress(progress);
                });
                const { downloadURL } = results[0];

                setFormData((prev) => ({
                    ...prev,
                    image_alpha: downloadURL
                }));

                setUploading(false);
            } catch (error) {
                console.error("Image upload error:", error);
                setUploading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // docId가 있으면 업데이트, 없으면 새로 생성
            const savedDocId = await saveData('Report', formData, docId || null); 
            alert(`리포트가 ${docId ? '수정' : '생성'}되었습니다! 문서 ID: ${savedDocId}`);
        } catch (error) {
            console.error("리포트 저장 중 오류 발생:", error);
            alert("리포트 저장 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">{docId ? '리포트 수정' : '리포트 생성'}</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-semibold mb-1" htmlFor="artist_eng">Artist (Eng):</label>
                    <input 
                        type="text" 
                        id="artist_eng" 
                        name="artist_eng" 
                        value={formData.artist_eng} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="artist_id">Artist ID:</label>
                    <input 
                        type="text" 
                        id="artist_id" 
                        name="artist_id" 
                        value={formData.artist_id} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="artist_kor">Artist (Kor):</label>
                    <input 
                        type="text" 
                        id="artist_kor" 
                        name="artist_kor" 
                        value={formData.artist_kor} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded"
                    />
                </div>

                {/* 필요에 따라 다른 필드들도 추가 */}
                <div>
                    <label className="block font-semibold mb-1" htmlFor="title">Title:</label>
                    <input 
                        type="text" 
                        id="title" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="sub_title">Sub Title:</label>
                    <input 
                        type="text" 
                        id="sub_title" 
                        name="sub_title" 
                        value={formData.sub_title} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="type">Type:</label>
                    <input 
                        type="text" 
                        id="type" 
                        name="type" 
                        value={formData.type} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="project_status">Project Status:</label>
                    <input 
                        type="text" 
                        id="project_status" 
                        name="project_status" 
                        value={formData.project_status} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded"
                    />
                </div>
                {/* Image Alpha 업로드 (파일 선택 시 즉시 업로드) */}
                <div>
                    <label className="block font-semibold mb-1" htmlFor="image_alpha">Image Alpha:</label>
                    <input 
                        type="file" 
                        id="image_alpha_file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block"
                    />

                    {localPreview && (
                        <div className="mt-2">
                            <p>로컬 미리보기 (업로드 전/중):</p>
                            <img src={localPreview} alt="Local Preview" className="w-64 h-auto rounded" />
                        </div>
                    )}

                    {uploading && (
                        <div className="mt-2">
                            <p>이미지 업로드 중: {uploadProgress.toFixed(2)}%</p>
                        </div>
                    )}

                    {formData.image_alpha && !uploading && (
                        <div className="mt-2">
                            <p>업로드 완료! 최종 이미지 미리보기:</p>
                            <img src={formData.image_alpha} alt="Uploaded Preview" className="w-64 h-auto rounded" />
                        </div>
                    )}
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="current_fund">Current Fund:</label>
                    <input 
                        type="number" 
                        id="current_fund" 
                        name="current_fund" 
                        value={formData.current_fund} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="goal_fund">Goal Fund:</label>
                    <input 
                        type="number" 
                        id="goal_fund" 
                        name="goal_fund" 
                        value={formData.goal_fund} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="investor_count">Investor Count:</label>
                    <input 
                        type="number" 
                        id="investor_count" 
                        name="investor_count" 
                        value={formData.investor_count} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="investors_share_ratio">Investors Share Ratio:</label>
                    <input 
                        type="number" 
                        step="0.01"
                        id="investors_share_ratio" 
                        name="investors_share_ratio" 
                        value={formData.investors_share_ratio} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="melon_artist_id">Melon Artist ID:</label>
                    <input 
                        type="text" 
                        id="melon_artist_id" 
                        name="melon_artist_id" 
                        value={formData.melon_artist_id} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="macro_marketGrowth_comment">Macro Market Growth Comment:</label>
                    <input 
                        type="text" 
                        id="macro_marketGrowth_comment" 
                        name="macro_marketGrowth_comment" 
                        value={formData.macro_marketGrowth_comment} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="meso_circlechart_comment">Meso Circlechart Comment:</label>
                    <input 
                        type="text" 
                        id="meso_circlechart_comment" 
                        name="meso_circlechart_comment" 
                        value={formData.meso_circlechart_comment} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="main_color">Main Color:</label>
                    <input 
                        type="color" 
                        id="main_color" 
                        name="main_color" 
                        value={formData.main_color} 
                        onChange={handleChange} 
                        className="border p-2 w-full rounded min-h-24"
                    />
                </div>

                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    {docId ? '리포트 수정' : '리포트 생성'}
                </button>
            </form>
        </div>
    );
}