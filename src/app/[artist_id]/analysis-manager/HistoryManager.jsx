// src/app/[artist_id]/HistoryManager.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useReport } from '../../../context/GlobalData';
import { fetchData, saveData } from '../../firebase/fetch';
import BlocksRenderer from './BlocksRenderer';
import BlocksEditor from './BlocksEditor';
import Modal from 'react-modal';
import EasyReader from './EasyReader';
import { FaPlus, FaArrowUp, FaArrowDown, FaEdit, FaTrash, FaSearch, FaTimes, FaRss } from 'react-icons/fa';

const HistoryManager = ({ artist_id }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBlockIndex, setEditingBlockIndex] = useState(null);
  const [insertionIndex, setInsertionIndex] = useState(null); 
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [activeLanguage, setActiveLanguage] = useState('en');

  const reportData = useReport();

  const fetchHistory = async () => {
    try {
      const fetchedData = await fetchData(
        'history',
        { comp: 'docId', sign: '==', val: artist_id },
        false,
      );

      if (fetchedData && fetchedData.history) {
        setHistoryData(fetchedData.history);
      } else {
        // 데이터가 없으면 초기화
        await saveData('history', { artist_id, history: [] }, artist_id);
        setHistoryData([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching history:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [artist_id]);

  const saveHistoryData = async (data) => {
    try {
      await saveData('history', { artist_id, history: data }, artist_id);
      setHistoryData(data);
    } catch (error) {
      console.log(data);
      console.error('Error saving history:', error);
      alert('Error saving data. Please try again.');
    }
  };

  // 블록 추가
  const handleAddBlock = (newBlock) => {
    let updatedHistory = [...historyData];
    if (insertionIndex !== null) {
      updatedHistory.splice(insertionIndex + 1, 0, newBlock); 
      setInsertionIndex(null);
    } else {
      updatedHistory.push(newBlock);
    }
    saveHistoryData(updatedHistory);
  };

  // 블록 수정
  const handleUpdateBlock = (index, updatedBlock) => {
    const updatedHistory = [...historyData];
    updatedHistory[index] = updatedBlock;
    saveHistoryData(updatedHistory);
    setEditingBlockIndex(null);
  };

  // 블록 삭제 요청/확인
  const handleDeleteBlockRequest = (index) => {
    setDeleteIndex(index);
  };

  const handleDeleteBlockConfirm = () => {
    if (deleteIndex !== null) {
      const updatedHistory = historyData.filter((_, i) => i !== deleteIndex);
      saveHistoryData(updatedHistory);
      setDeleteIndex(null);
    }
  };

  const handleDeleteBlockCancel = () => {
    setDeleteIndex(null);
  };

  // 순서 변경 - 위로 이동
  const moveBlockUp = (index) => {
    if (index === 0) return;
    const updatedHistory = [...historyData];
    [updatedHistory[index - 1], updatedHistory[index]] = [
      updatedHistory[index],
      updatedHistory[index - 1],
    ];
    saveHistoryData(updatedHistory);
  };

  // 순서 변경 - 아래로 이동
  const moveBlockDown = (index) => {
    if (index === historyData.length - 1) return;
    const updatedHistory = [...historyData];
    [updatedHistory[index], updatedHistory[index + 1]] = [
      updatedHistory[index + 1],
      updatedHistory[index],
    ];
    saveHistoryData(updatedHistory);
  };

  // 필터 적용
  const filteredData = filterQuery
    ? historyData.filter((block) =>
        JSON.stringify(block).toLowerCase().includes(filterQuery.toLowerCase())
      )
    : historyData;

  const addInitialBlock = () => {
    // 블록이 전혀 없을 때 Add Block 버튼을 누르면 insertionIndex를 0으로 설정
    setInsertionIndex(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 text-[rgba(180,150,255,1)] animate-pulse text-center text-xl font-semibold">
          Loading analysis...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgba(25,20,30,1)] to-[rgba(5,5,10,1)] p-6">
      <div className="max-w-4xl mx-auto bg-[rgba(255,255,255,0.03)] rounded-lg shadow-xl text-[rgba(255,255,255,0.9)]">
        
        {/* 언어 활성화 */}
        <div className="sticky top-0 z-10 bg-[rgba(0,0,0,0.4)] border-b border-[rgba(255,255,255,0.1)] flex space-x-2 backdrop-blur-sm justify-between">
          <div>
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
          <EasyReader
            data={filteredData} 
            locale={activeLanguage}
            reportData={reportData}
          />
        </div>

        <div className="p-6 space-y-4">
        {/* 헤더 부분 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-wide drop-shadow-lg">
            Analysis Manager
          </h1>
        </div>

        {/* 검색창 */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[rgba(156,163,175,0.8)]" />
            <input
              type="text"
              placeholder="Search blocks..."
              className="w-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)] pl-8 pr-8 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[rgba(255,255,255,0.3)] transition"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[rgba(156,163,175,1)] hover:text-[rgba(255,255,255,0.8)]"
                title="Clear Filter"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {filterQuery && (
          <p className="text-sm text-[rgba(255,255,255,0.6)]">
            Showing filtered results for <strong>"{filterQuery}"</strong>
          </p>
        )}

        <h1 className="pt-12 text-6xl">
          {activeLanguage === 'ko' ? reportData.artist_kor : reportData.artist_eng}
        </h1>

        {/* 블록이 하나도 없을 때만 상단에 add 버튼 표시 */}
        {filteredData.length === 0 &&
            editingBlockIndex === null &&
            insertionIndex === null && (
              <div className="text-center text-[rgba(255,255,255,0.6)] mt-4">
                No blocks to display.
                <div className="mt-4">
                  <button
                    onClick={addInitialBlock}
                    className="px-4 py-2 bg-[rgba(34,197,94,1)] text-[rgba(255,255,255,1)] rounded hover:bg-[rgba(22,163,74,1)] flex items-center space-x-1 mx-auto shadow-md hover:shadow-lg transition"
                  >
                    <FaPlus />
                    <span>Add Block</span>
                  </button>
                </div>
              </div>
            )}

          {/* 블록이 없고 insertionIndex가 설정되었을 때(즉, 초기 블록 추가 상황) */}
          {filteredData.length === 0 &&
            insertionIndex !== null &&
            editingBlockIndex === null && (
              <div className="mt-4 border border-[rgba(255,255,255,0.2)] p-4 rounded bg-[rgba(255,255,255,0.05)]">
                <p className="text-sm text-[rgba(255,255,255,0.6)] mb-2">
                  Inserting block at position {insertionIndex + 1}
                </p>
                <BlocksEditor
                  onSave={handleAddBlock}
                  onCancel={() => setInsertionIndex(null)}
                  locale={activeLanguage}
                />
              </div>
            )}

          {/* 가장 상단에 블록이 있을 경우 맨 위 삽입 지원 */}
          {filteredData.length > 0 && (
            <div className="relative mt-4 group transition-all duration-300 ease-in-out">
              {editingBlockIndex === null && insertionIndex === null && (
                <div className="text-center mb-1 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out transform group-hover:translate-y-2">
                  <button
                    onClick={() => setInsertionIndex(0)}
                    className="px-2 py-1 bg-[rgba(209,250,229,1)] text-[rgba(21,128,61,1)] rounded hover:bg-[rgba(187,247,208,1)] text-sm shadow hover:shadow-md transition"
                  >
                    <FaPlus className="inline mr-1" />
                    Add Block at top
                  </button>
                </div>
              )}
              {editingBlockIndex === null &&
                insertionIndex !== null &&
                insertionIndex === 0 && (
                  <div className="mt-4 border border-[rgba(255,255,255,0.2)] p-4 rounded bg-[rgba(255,255,255,0.05)]">
                    <p className="text-sm text-[rgba(255,255,255,0.6)] mb-2">
                      Inserting block at position {insertionIndex + 1}
                    </p>
                    <BlocksEditor
                      onSave={handleAddBlock}
                      onCancel={() => setInsertionIndex(null)}
                      locale={activeLanguage}
                    />
                  </div>
                )}
            </div>
        )}

        {/* 메인 블록 목록 */}
        <div className="space-y-4 mt-1">
            {filteredData.map((block, index) => {
              const actualIndex = historyData.indexOf(block);
              return (
                <div key={actualIndex} className="group relative transition-all">
                  <div
                    className={`relative mb-1 border border-[rgba(255,255,255,0.15)] p-4 rounded-lg shadow-sm transition-all duration-300 ease-in-out ${
                      editingBlockIndex === actualIndex
                        ? 'bg-[rgba(239,246,255,0.1)] border-[rgba(255,255,255,0.3)]'
                        : 'bg-[rgba(255,255,255,0.02)]'
                    }`}
                  >
                    <div className="max-w-[480px] content-center">
                      {editingBlockIndex === actualIndex ? (
                        <div>
                          <p className="text-xs text-[rgba(37,99,235,0.8)] mb-2 font-medium">
                            Editing Block #{actualIndex + 1}
                          </p>
                          <BlocksEditor
                            block={block}
                            onSave={(updatedBlock) =>
                              handleUpdateBlock(actualIndex, updatedBlock)
                            }
                            onCancel={() => setEditingBlockIndex(null)}
                            locale={activeLanguage}
                          />
                        </div>
                      ) : (
                        <BlocksRenderer block={block} locale={activeLanguage} />
                      )}
                    </div>

                    {/* 우측 상단 버튼들 */}
                    {editingBlockIndex !== actualIndex && (
                      <div className="absolute top-2 right-2 space-x-2 flex">
                        <button
                          onClick={() => moveBlockUp(actualIndex)}
                          className="text-[rgba(107,114,128,1)] hover:text-[rgba(255,255,255,0.8)] disabled:opacity-50 disabled:cursor-not-allowed transition"
                          disabled={actualIndex === 0}
                          title="Move Up"
                        >
                          <FaArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => moveBlockDown(actualIndex)}
                          className="text-[rgba(107,114,128,1)] hover:text-[rgba(255,255,255,0.8)] disabled:opacity-50 disabled:cursor-not-allowed transition"
                          disabled={actualIndex === historyData.length - 1}
                          title="Move Down"
                        >
                          <FaArrowDown size={16} />
                        </button>
                        <button
                          onClick={() => setEditingBlockIndex(actualIndex)}
                          className="text-[rgba(59,130,246,1)] hover:text-[rgba(29,78,216,1)] transition"
                          title="Edit Block"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteBlockRequest(actualIndex)}
                          className="text-[rgba(239,68,68,1)] hover:text-[rgba(185,28,28,1)] transition"
                          title="Delete Block"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 블록 아래 Add Block 버튼 */}
                  {editingBlockIndex === null && insertionIndex === null && (
                    <div className="text-center h-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out transform group-hover:opacity-100 group-hover:h-auto group-hover:translate-y-2">
                      <button
                        onClick={() => setInsertionIndex(actualIndex)}
                        className="px-2 py-1 bg-[rgba(209,250,229,1)] text-[rgba(21,128,61,1)] rounded hover:bg-[rgba(187,247,208,1)] text-sm shadow hover:shadow-md transition"
                      >
                        <FaPlus className="inline mr-1" />
                        Add Block Here
                      </button>
                    </div>
                  )}

                  {/* 인서션 인덱스가 실제 인덱스일 때 에디터 표시 */}
                  {editingBlockIndex === null && insertionIndex === actualIndex && (
                    <div className="mt-4 border border-[rgba(255,255,255,0.2)] p-4 rounded bg-[rgba(255,255,255,0.05)]">
                      <p className="text-sm text-[rgba(255,255,255,0.6)] mb-2">
                        Inserting block at position {insertionIndex + 1}
                      </p>
                      <BlocksEditor
                        onSave={handleAddBlock}
                        onCancel={() => setInsertionIndex(null)}
                        locale={activeLanguage}
                      />
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* 마지막에 삽입하는 경우 */}
        {filteredData.length > 0 &&
          insertionIndex === historyData.length &&
          editingBlockIndex === null && (
            <div className="mt-4 border border-[rgba(255,255,255,0.2)] p-4 rounded bg-[rgba(255,255,255,0.05)]">
              <p className="text-sm text-[rgba(255,255,255,0.6)] mb-2">
                Inserting block at position {insertionIndex + 1}
              </p>
              <BlocksEditor
                onSave={handleAddBlock}
                onCancel={() => setInsertionIndex(null)}
                locale={activeLanguage}
              />
            </div>
        )}


        {/* 삭제 확인 모달 */}
        <Modal
            isOpen={deleteIndex !== null}
            onRequestClose={handleDeleteBlockCancel}
            ariaHideApp={false}
            className="bg-[rgba(35,35,40,1)] p-6 rounded-2xl shadow-xl max-w-md mx-auto my-40 relative focus:outline-none"
            overlayClassName="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center"
          >
            <h2 className="text-xl font-semibold mb-4">Delete Confirmation</h2>
            <p className="mb-6">
              Are you sure you want to delete block #
              {deleteIndex !== null ? deleteIndex + 1 : ''}?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteBlockCancel}
                className="px-4 py-2 bg-[rgba(109,113,119,1)] rounded hover:bg-[rgba(156,163,175,1)] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBlockConfirm}
                className="px-4 py-2 bg-[rgba(239,68,68,1)] text-[rgba(255,255,255,1)] rounded hover:bg-[rgba(220,38,38,1)] transition"
              >
                Delete
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default HistoryManager;