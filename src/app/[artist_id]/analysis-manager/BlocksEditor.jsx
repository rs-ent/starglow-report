// src/app/[artist_id]/analysis-manager/BlocksEditor.jsx
import React, { useState, useEffect } from 'react';
import BlocksInputs from './BlocksInputs';
import BlocksRenderer from './BlocksRenderer';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';

const BLOCK_TYPES = [
  {value:'SectionTitle', label:'섹션 타이틀', desc:'이미지 옵션이 있는 큰 제목 섹션'},
  {value:'Title', label:'제목', desc:'주요 헤딩(큰 제목)'},
  {value:'Subtitle', label:'부제목', desc:'메인 제목을 보조하는 서브 헤딩'},
  {value:'Text', label:'텍스트', desc:'일반 단락 텍스트'},
  {value:'Image', label:'이미지', desc:'대체 텍스트를 가진 이미지 블록'},
  {value:'Video', label:'비디오', desc:'YouTube 비디오를 임베드'},
  {value:'List', label:'리스트', desc:'순서있는/순서없는 리스트 항목'},
  {value:'Blockquote', label:'인용구', desc:'인용문을 표시하는 블록'},
  {value:'Code', label:'코드', desc:'포맷팅된 코드 스니펫'},
  {value:'Table', label:'표', desc:'행과 열을 가진 테이블 데이터'},
  {value:'Chart', label:'차트', desc:'데이터 시각화 차트'},
  {value:'Link', label:'링크', desc:'외부 리소스로 가는 하이퍼링크'},
  {value:'File', label:'파일', desc:'다운로드 가능한 파일 링크'},
  {value:'Countdown', label:'카운트다운', desc:'특정 날짜까지 남은 시간을 표시'},
  {value:'Gallery', label:'갤러리', desc:'여러 이미지를 갤러리 형태로 표시'},
];

function convertLegacyFields(data) {
  if (!data) return data;

  const newData = { ...data };

  const fieldsToConvert = ['text', 'alt', 'content', 'cite'];
  fieldsToConvert.forEach((field) => {
    const val = newData[field];
    if (typeof val === 'string') {
      newData[field] = { ko: val, en: '' };
    }
  });

  // 예시: items가 단순 array면 ko/en 객체로
  if (Array.isArray(newData.items) && newData.items.length > 0) {
    // 첫 번째 요소가 string이면 => 아직 ko/en 변환 안됐다고 가정
    if (typeof newData.items[0] === 'string') {
      newData.items = { ko: [...newData.items], en: [] };
    }
  }

  return newData;
}

const BlocksEditor = ({ block = null, onSave, onCancel, locale = 'ko' }) => {
  const defaultType = block ? block.type : BLOCK_TYPES[0].value;
  const [type, setType] = useState(defaultType);
  const [formData, setFormData] = useState(block || { type: defaultType });
  const [activeTab, setActiveTab] = useState('edit');
  const [activeLanguage, setActiveLanguage] = useState(locale);

  const currentType = BLOCK_TYPES.find(bt => bt.value === type);

  useEffect(() => {
    if (block) {
      const converted = convertLegacyFields(block);
      setFormData(converted);
      // block.type이 바뀌었다면 type도 동기화
      if (converted.type) {
        setType(converted.type);
      }
    }
  }, [block]);

  const handleTypeSelect = (selectedType) => {
    setType(selectedType);
    setFormData({ ...formData, type: selectedType });
  };

  const handleLanguageChange = (lang) => {
    setActiveLanguage(lang);
  };

  const handleInputChange = (data) => {
    setFormData((prevData) => ({ ...prevData, ...data }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    if (!block && onCancel) {
      onCancel();
    }
  };

  return (
    <div className="
      border border-[rgba(255,255,255,0.1)]
      bg-[rgba(255,255,255,0.01)]
      backdrop-blur-md
      p-6
      rounded-xl
      shadow-2xl
      max-w-lg
      transition-all
      text-[rgba(255,255,255,0.9)]
    ">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Block Type Selector */}
        <div>
          <p className="font-semibold mb-2">Block Type:</p>
          <div className="
            grid grid-cols-3 gap-2 max-h-60 overflow-auto 
            p-2 border border-[rgba(255,255,255,0.1)] rounded 
            bg-[rgba(255,255,255,0.05)]
          ">
            {BLOCK_TYPES.map((bt) => {
              const isSelected = bt.value === type;
              return (
                <Tooltip key={bt.value} placement="top" overlay={bt.desc}>
                  <div
                    onClick={() => handleTypeSelect(bt.value)}
                    className={`
                      cursor-pointer p-2 rounded transition-all text-sm shadow-sm
                      border border-[rgba(255,255,255,0.1)]
                      bg-[rgba(255,255,255,0.05)]
                      hover:bg-[rgba(255,255,255,0.1)]
                      hover:border-[rgba(255,255,255,0.2)]
                      ${isSelected ? 'bg-[rgba(59,130,246,0.2)] border-[rgba(59,130,246,0.4)]' : ''}
                    `}
                  >
                    <div className="font-medium mb-1">{bt.label}</div>
                    <div className="text-[rgba(255,255,255,0.7)] text-xs line-clamp-2">
                      {bt.desc}
                    </div>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Edit / Preview Tabs */}
        <div className="border-b border-[rgba(255,255,255,0.2)] flex space-x-2">
          <button
            type="button"
            className={`
              px-4 py-2 transition
              ${
                activeTab === 'edit'
                  ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]'
                  : 'text-[rgba(200,200,200,0.8)]'
              }
            `}
            onClick={() => setActiveTab('edit')}
          >
            Edit
          </button>
          <button
            type="button"
            className={`
              px-4 py-2 transition
              ${
                activeTab === 'preview'
                  ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]'
                  : 'text-[rgba(200,200,200,0.8)]'
              }
            `}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>

        {/* Main Editor Body */}
        {activeTab === 'edit' ? (
          <div className="mt-2">
            <BlocksInputs
              type={type}
              data={formData}
              onChange={handleInputChange}
              currentLang={activeLanguage}
            />
          </div>
        ) : (
          <div className="mt-2 p-3 border border-[rgba(255,255,255,0.1)] rounded bg-[rgba(255,255,255,0.02)]">
            <BlocksRenderer block={formData} locale={activeLanguage} />
          </div>
        )}

        {/* Language Tab (Only in Edit Mode) */}
        <div className="border-t border-[rgba(255,255,255,0.2)] flex space-x-2">
          <button
            type="button"
            className={`
              px-4 py-2 transition 
              ${
                activeLanguage === 'ko'
                  ? 'border-t-2 border-[var(--primary)] text-[var(--primary)]'
                  : 'text-[rgba(200,200,200,0.8)]'
              }
            `}
            onClick={() => handleLanguageChange('ko')}
          >
            한국어
          </button>
          <button
            type="button"
            className={`
              px-4 py-2 transition
              ${
                activeLanguage === 'en'
                  ? 'border-t-2 border-[var(--primary)] text-[var(--primary)]'
                  : 'text-[rgba(200,200,200,0.8)]'
              }
            `}
            onClick={() => handleLanguageChange('en')}
          >
            English
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex space-x-2 justify-end">
          <button
            type="submit"
            className="
              px-4 py-2 rounded 
              bg-[rgba(59,130,246,1)] 
              text-[rgba(255,255,255,1)] 
              hover:bg-[rgba(29,78,216,1)] 
              transition shadow 
              hover:shadow-lg
            "
          >
            Save Block
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              type="button"
              className="
                px-4 py-2 
                bg-[rgba(209,213,219,1)] 
                text-[rgba(55,65,81,1)] 
                rounded 
                hover:bg-[rgba(156,163,175,1)]
                transition shadow
              "
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BlocksEditor;