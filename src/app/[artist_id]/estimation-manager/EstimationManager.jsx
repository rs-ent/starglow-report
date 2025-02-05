'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { fetchData, saveData } from '../../firebase/fetch'; 
import {
    PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, ReferenceLine
} from 'recharts';
import { formatNumber } from '../../utils/formatNumber'; 
import { safeLangMapper, safeLangValue, updateLangField, convertKor } from '../../../script/convertLang';

export default function EstimationManager({ artistId }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [activeLanguage, setActiveLanguage] = useState('en');

    // Firestore에서 Roadmap 데이터 불러오기
    useEffect(() => {
        async function loadRoadmap() {
            try {
                setLoading(true);
                const roadmap = await fetchData('Roadmap', { comp: 'docId', val: artistId }, false);
                if (roadmap && roadmap.investments) {
                    setData(roadmap.investments);
                } else {
                    // 기본 템플릿
                    setData([
                        {
                          key: "musicAlbum",
                          label: convertKor("음원/음반 발매"),
                          value: convertKor("정규 및 리메이크 앨범 등"),
                          spend: "600,000,000",
                        },
                        {
                          key: "concert",
                          label: convertKor("공연/행사 기획"),
                          value: convertKor("콘서트/투어/팬미팅 등"),
                          spend: "550,000,000",
                        },
                        {
                          key: "content",
                          label: convertKor("콘텐츠 기획 및 제작"),
                          value: convertKor("유튜브 콘텐츠 등"),
                          spend: "142,000,000",
                        },
                        {
                          key: "goods",
                          label: convertKor("굿즈/MD 제작"),
                          value: convertKor("포토카드/열쇠고리 등"),
                          spend: "215,000,000",
                        },
                        {
                          key: "management",
                          label: convertKor("매니지먼트 활동"),
                          value: convertKor("영화/방송/외부콘텐츠 등"),
                          spend: "65,000,000",
                        },
                        {
                          key: "marketing",
                          label: convertKor("홍보/마케팅"),
                          value: convertKor("유통사/소셜미디어 등"),
                          spend: "345,000,000",
                        },
                        {
                          key: "etc",
                          label: convertKor("기타"),
                          value: convertKor("식대/유류비 등"),
                          spend: "95,000,000",
                        },
                    ]);
                }
            } catch (err) {
                console.error('Error fetching roadmap:', err);
                setError('로드맵 데이터를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        }

        loadRoadmap();
    }, [artistId]);

    const handleChange = (index, field, newValue) => {
        const updatedData = [...data];
        if (field === 'label' || field === 'value') {
          const currentField = updatedData[index][field];
          updatedData[index][field] = updateLangField(
            typeof currentField === 'object' ? currentField : convertKor(currentField),
            activeLanguage,
            newValue
          );
        } else {
          updatedData[index][field] = newValue;
        }
        setData(updatedData);
    };

    const handleAddRow = () => {
        setData([
          ...data,
          { key: '', label: convertKor(''), value: convertKor(''), spend: '' },
        ]);
    };

    const handleDeleteRow = (index) => {
        const updatedData = [...data];
        updatedData.splice(index, 1);
        setData(updatedData);
    };

    const handleSave = async () => {
        try {
          setSaving(true);
          const roadmapData = {
            artist_id: artistId,
            investments: data,
          };
          await saveData('Roadmap', roadmapData, artistId);
          alert('로드맵 데이터가 저장되었습니다.');
        } catch (err) {
          console.error('Error saving roadmap:', err);
          alert('로드맵 저장 중 오류가 발생했습니다.');
        } finally {
          setSaving(false);
        }
    };

    // 계산 로직
    const totalAmount = useMemo(() => {
        return data.reduce((sum, row) => sum + Number(row.spend.replace(/,/g,'') || 0), 0);
    }, [data]);

    // 파이 차트 데이터
    const pieChartData = useMemo(() => {
        return data
          .map((row) => ({
            label: safeLangValue(row.label, activeLanguage),
            spend: Number(row.spend.replace(/,/g, '')) || 0,
          }))
          .sort((a, b) => {
            if (a.label === "기타" || a.label === "Miscellaneous" || a.label === 'etc') return 1;
            if (b.label === "기타" || b.label === "Miscellaneous" || b.label === 'etc') return -1;
            return b.spend - a.spend;
          });
    }, [data, activeLanguage]);

    const COLORS = ['#4A90E2', '#40BFA3', '#F1C40F', '#EC7063', '#9B59B6', '#F1948A', '#85C1E9'];

    const InvestmentPieChart = ({ data }) => {
        return (
            <ResponsiveContainer width="100%" height={270}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="spend"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        fontSize={9}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        startAngle={90}
                        endAngle={-270}
                    >
                        {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        );
    };

    const investorsShareRatio = 0.1; // 임의 비율 설정
    const minRevenue = 1000000000; // 최소 연간 매출
    const avgRevenue = 2000000000; // 평균 연간 매출
    const maxRevenue = 3000000000; // 최대 연간 매출
    const investorsBEPRevenue = 200000000; // 손익분기점에서 투자자 몫
    const bep = investorsBEPRevenue / investorsShareRatio;
    const investorsAvgRevenue = avgRevenue * investorsShareRatio;
    const investorsMaxRevenue = maxRevenue * investorsShareRatio;
    const investorsMinRevenue = minRevenue * investorsShareRatio;

    const revenueData = [
        { name: '최대 예상 수익', Revenue: maxRevenue, Investors: investorsMaxRevenue },
        { name: '평균 예상 수익', Revenue: avgRevenue, Investors: investorsAvgRevenue },
        { name: '최소 예상 수익', Revenue: minRevenue, Investors: investorsMinRevenue },
        { name: '손익분기점', Revenue: bep, Investors: investorsBEPRevenue },
    ];

    revenueData.sort((a, b) => b.Investors - a.Investors);

    const PerformanceChart = ({ revenueData, locale }) => {
        const breakEvenRevenue = revenueData.find(row => row.name === '손익분기점')?.Revenue || 1;
        const formattedData = revenueData
          .map(row => ({
            ...row,
            percentage: ((row.Revenue - breakEvenRevenue) / breakEvenRevenue) * 100,
          }))
          .sort((a, b) => a.Revenue - b.Revenue);
    
        return (
            <ResponsiveContainer width="100%" height={200}>
                <LineChart
                data={formattedData}
                margin={{ top: 20, right: 30, left: -10, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="4 4" stroke="#e9e9e9" />
                    <XAxis
                        dataKey="Revenue"
                        tickFormatter={(value) => `${locale === 'ko' ? '₩' : '$'}${formatNumber(value, '', 2, locale)}`}
                        tick={{ fontSize: 9 }}
                    />
                    <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} tick={{ fontSize: 9 }} />
                    <ReferenceLine
                        y={0}
                        label={{
                        value: "손익분기점",
                        position: "insideTop",
                        fontSize: 10,
                        fill: "gray",
                        }}
                        stroke="gray"
                        strokeDasharray="3 3"
                    />
                    <Line type="monotone" dataKey="percentage" stroke="#4A90E2" strokeWidth={1} />
                </LineChart>
            </ResponsiveContainer>
        );
    };

    if (loading) {
        return (
            <div 
                className="
                    flex items-center justify-center h-screen 
                    text-[var(--foreground)] text-2xl font-bold
                    bg-[var(--background)]
                "
            >
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div 
                className="
                    flex items-center justify-center h-screen
                    text-[var(--foreground)] text-2xl font-bold
                    bg-[var(--background)]
                "
            >
                {error}
            </div>
        );
    }

    return (
        <>
          {/* 상단 언어 전환 버튼 */}
          <div className="sticky top-0 z-10 bg-black border-b border-[rgba(255,255,255,0.2)] flex space-x-2">
            <button
              type="button"
              className={`
                px-4 py-2 transition 
                ${activeLanguage === 'ko'
                  ? 'border-b-2 border-[rgba(59,130,246,1)] text-[rgba(59,130,246,1)]'
                  : 'text-[rgba(200,200,200,0.8)]'}
              `}
              onClick={() => setActiveLanguage('ko')}
            >
              한국어
            </button>
            <button
              type="button"
              className={`
                px-4 py-2 transition
                ${activeLanguage === 'en'
                  ? 'border-b-2 border-[rgba(59,130,246,1)] text-[rgba(59,130,246,1)]'
                  : 'text-[rgba(200,200,200,0.8)]'}
              `}
              onClick={() => setActiveLanguage('en')}
            >
              English
            </button>
          </div>
    
          <div className="min-h-screen p-10 bg-[var(--background)] flex flex-col lg:flex-row gap-6 transition-all">
            {/* 데이터 편집 섹션 */}
            <div className="flex-1 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-[var(--foreground-unfocus)] transition-all">
              <h1 className="text-3xl font-extrabold mb-8 text-center tracking-wide text-[var(--primary)]">
                {activeLanguage === 'en' ? 'Estimated Budget' : '추정 예산'}
              </h1>
              <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full border-collapse text-[var(--foreground)] text-sm">
                  <thead>
                    <tr className="bg-[var(--background-second)] text-xs uppercase tracking-wider text-[var(--foreground)]">
                      <th className="py-3 px-4 border-b border-[var(--foreground-unfocus)]">Key</th>
                      <th className="py-3 px-4 border-b border-[var(--foreground-unfocus)]">Label</th>
                      <th className="py-3 px-4 border-b border-[var(--foreground-unfocus)]">Value</th>
                      <th className="py-3 px-4 border-b border-[var(--foreground-unfocus)]">Budget</th>
                      <th className="py-3 px-4 border-b border-[var(--foreground-unfocus)]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, index) => (
                      <tr
                        key={index}
                        className="hover:bg-[var(--background-second)]/70 transition-colors"
                      >
                        <td className="py-2 px-4 border-b border-[var(--foreground-unfocus)]">
                          <input
                            type="text"
                            value={row.key}
                            onChange={(e) => handleChange(index, 'key', e.target.value)}
                            className="
                              w-full bg-transparent text-[var(--foreground)]
                              placeholder-[var(--foreground-unfocus)]
                              focus:outline-none border-b-2 border-transparent
                              focus:border-b-[var(--accent)] transition-colors duration-300 pb-1 text-sm
                            "
                            placeholder="ex: musicAlbum"
                          />
                        </td>
                        <td className="py-2 px-4 border-b border-[var(--foreground-unfocus)]">
                          <input
                            type="text"
                            value={safeLangValue(row.label, activeLanguage)}
                            onChange={(e) => handleChange(index, 'label', e.target.value)}
                            className="
                              w-full bg-transparent text-[var(--foreground)]
                              placeholder-[var(--foreground-unfocus)]
                              focus:outline-none border-b-2 border-transparent
                              focus:border-b-[var(--accent)] transition-colors duration-300 pb-1 text-sm
                            "
                            placeholder="ex: 음원/음반 발매"
                          />
                        </td>
                        <td className="py-2 px-4 border-b border-[var(--foreground-unfocus)]">
                          <input
                            type="text"
                            value={safeLangValue(row.value, activeLanguage)}
                            onChange={(e) => handleChange(index, 'value', e.target.value)}
                            className="
                              w-full bg-transparent text-[var(--foreground)]
                              placeholder-[var(--foreground-unfocus)]
                              focus:outline-none border-b-2 border-transparent
                              focus:border-b-[var(--accent)] transition-colors duration-300 pb-1 text-sm
                            "
                            placeholder="ex: 정규 및 리메이크 앨범 등"
                          />
                        </td>
                        <td className="py-2 px-4 border-b border-[var(--foreground-unfocus)]">
                          <input
                            type="text"
                            value={row.spend}
                            onChange={(e) => handleChange(index, 'spend', e.target.value)}
                            className="
                              w-full bg-transparent text-[var(--foreground)]
                              placeholder-[var(--foreground-unfocus)]
                              focus:outline-none border-b-2 border-transparent
                              focus:border-b-[var(--accent)] transition-colors duration-300 pb-1 text-sm
                            "
                            placeholder="ex: 600,000,000"
                          />
                        </td>
                        <td className="py-2 px-4 border-b border-[var(--foreground-unfocus)] text-center">
                          <button
                            onClick={() => handleDeleteRow(index)}
                            className="
                              text-[var(--danger)] hover:text-[var(--foreground)]
                              hover:scale-110 transform transition-transform duration-200 text-sm
                            "
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-end mt-6 space-x-4">
                <button
                  onClick={handleAddRow}
                  className="
                    px-6 py-2 font-bold text-[var(--text-primary)] rounded-full 
                    bg-[var(--background-second)]
                    hover:bg-[var(--background-muted)] transition-all duration-300 shadow-lg text-sm
                  "
                >
                  행 추가
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`
                    px-6 py-2 font-bold rounded-full text-[var(--text-primary)] text-sm
                    ${saving 
                      ? 'bg-[var(--foreground-unfocus)] cursor-not-allowed' 
                      : 'bg-[var(--accent)] hover:scale-105 transition-transform duration-300 shadow-lg'
                    }
                  `}
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
    
            {/* 미리보기 */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-[var(--foreground-unfocus)] transition-all">
                <h3 className="text-lg font-bold text-[var(--primary)] mb-4">
                    {activeLanguage === 'en' ? 'Allocation' : '추정 예산'}
                </h3>
                <InvestmentPieChart data={pieChartData} />
                <table className="w-full border-collapse border border-gray-300 text-center text-xs text-[var(--text-primary)] mt-4">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="py-2 px-4 border border-gray-300 font-bold">분류</th>
                      <th className="py-2 px-4 border border-gray-300 font-bold">내용</th>
                      <th className="py-2 px-4 border border-gray-300 font-bold">비중</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, index) => {
                      const spendNum = Number(row.spend.replace(/,/g, '') || 0);
                      const ratio = totalAmount ? ((spendNum / totalAmount) * 100).toFixed(0) : 0;
                      return (
                        <tr key={index}>
                          <td className="py-2 px-4 border font-medium bg-gray-900">
                            {safeLangValue(row.label, activeLanguage)}
                          </td>
                          <td className="py-2 px-4 border">
                            {safeLangValue(row.value, activeLanguage)}
                          </td>
                          <td className="py-2 px-4 border">{ratio}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
    );
}