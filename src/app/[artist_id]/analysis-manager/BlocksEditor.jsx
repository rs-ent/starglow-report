// src/app/[artist_id]/analysis-manager/BlocksEditor.jsx
import React, { useState } from 'react';
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

const BlocksEditor = ({ block = null, onSave, onCancel }) => {
  const defaultType = block ? block.type : BLOCK_TYPES[0].value;
  const [type, setType] = useState(defaultType);
  const [formData, setFormData] = useState(block || { type: defaultType });
  const [activeTab, setActiveTab] = useState('edit');

  const currentType = BLOCK_TYPES.find(bt => bt.value === type);

  const handleTypeSelect = (selectedType) => {
    setType(selectedType);
    setFormData({ ...formData, type: selectedType });
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
    <div className="border p-4 rounded bg-white shadow-md max-w-lg transition-all">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <p className="font-semibold mb-2">블록 타입 선택:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-auto p-2 border rounded">
            {BLOCK_TYPES.map((bt) => {
              const isSelected = bt.value === type;
              return (
                <Tooltip key={bt.value} placement="top" overlay={bt.desc}>
                  <div
                    onClick={() => handleTypeSelect(bt.value)}
                    className={`cursor-pointer p-2 border rounded transition-all text-sm 
                      ${isSelected ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300 hover:border-gray-400'}
                    `}
                  >
                    <div className="font-medium mb-1">{bt.label}</div>
                    <div className="text-gray-500 text-xs line-clamp-2">{bt.desc}</div>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Edit / Preview Tabs */}
        <div className="mb-4 border-b border-gray-300 flex space-x-2">
          <button
            type="button"
            className={`px-4 py-2 ${activeTab === 'edit' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-600'}`}
            onClick={() => setActiveTab('edit')}
          >
            Edit
          </button>
          <button
            type="button"
            className={`px-4 py-2 ${activeTab === 'preview' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-600'}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>

        {/* Edit Tab */}
        {activeTab === 'edit' && (
          <BlocksInputs type={type} data={formData} onChange={handleInputChange} />
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <BlocksRenderer block={formData} />
        )}

        <div className="mt-4 flex space-x-2">
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save Block
          </button>
          {onCancel && (
            <button onClick={onCancel} type="button" className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BlocksEditor;