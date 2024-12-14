// src/app/[artist_id]/HistoryManager.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { fetchData, saveData } from '../../firebase/fetch';
import BlocksRenderer from './BlocksRenderer';
import BlocksEditor from './BlocksEditor';
import Modal from 'react-modal';
import { FaPlus, FaArrowUp, FaArrowDown, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';

const HistoryManager = ({ artist_id }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBlockIndex, setEditingBlockIndex] = useState(null);
  const [insertionIndex, setInsertionIndex] = useState(null); 
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');

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
      console.error('Error saving history:', error);
      alert('Error saving data. Please try again.');
    }
  };

  // 블록 추가
  const handleAddBlock = (newBlock) => {
    let updatedHistory = [...historyData];
    if (insertionIndex !== null) {
      updatedHistory.splice(insertionIndex, 0, newBlock); 
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
    return <div className="p-6 text-gray-700 animate-pulse">Loading analysis...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Analysis Manager</h1>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search blocks..."
            className="w-full border pl-8 pr-8 py-2 rounded"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Clear Filter"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {filterQuery && (
        <p className="text-sm text-gray-600">
          Showing filtered results for <strong>"{filterQuery}"</strong>
        </p>
      )}

      {/* 블록이 하나도 없을 때만 상단에 add 버튼 표시 */}
      {filteredData.length === 0 && editingBlockIndex === null && insertionIndex === null && (
        <div className="text-center text-gray-500 mt-4">
          No blocks to display.
          <div className="mt-4">
            <button
              onClick={addInitialBlock}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center space-x-1 mx-auto"
            >
              <FaPlus />
              <span>Add Block</span>
            </button>
          </div>
        </div>
      )}

      {/* 블록이 없고 insertionIndex가 설정되었을 때(즉, 초기 블록 추가 상황) */}
      {filteredData.length === 0 && insertionIndex !== null && editingBlockIndex === null && (
        <div className="mt-4 border p-4 rounded bg-gray-50">
          <p className="text-sm text-gray-500 mb-2">Inserting block at position {insertionIndex + 1}</p>
          <BlocksEditor onSave={handleAddBlock} onCancel={() => setInsertionIndex(null)} />
        </div>
      )}

      {/* 가장 상단에 블록이 있을 경우 맨 위 삽입 지원 */}
      {filteredData.length > 0 && (
        <div className="relative mt-4 group transition-all duration-300 ease-in-out">
          {editingBlockIndex === null && insertionIndex === null && (
            <div className="text-center mb-1 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out transform group-hover:translate-y-2">
              <button
                onClick={() => setInsertionIndex(0)}
                className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
              >
                <FaPlus className="inline mr-1" />
                Add Block at top
              </button>
            </div>
          )}
          {editingBlockIndex === null && insertionIndex !== null && insertionIndex === 0 && (
            <div className="mt-4 border p-4 rounded bg-gray-50">
              <p className="text-sm text-gray-500 mb-2">Inserting block at position {insertionIndex + 1}</p>
              <BlocksEditor onSave={handleAddBlock} onCancel={() => setInsertionIndex(null)} />
            </div>
          )}
        </div>
      )}

      {filteredData.map((block, index) => {
        const actualIndex = historyData.indexOf(block);
        return (
          <React.Fragment key={actualIndex}>
            <div className="group relative transition-all duration-300 ease-in-out">
              <div className={`relative mb-1 border p-2 rounded ${editingBlockIndex === actualIndex ? 'bg-blue-50' : ''} transition-all duration-300 ease-in-out`}>
                <div className="max-w-[480px] content-center">
                  {editingBlockIndex === actualIndex ? (
                    <div>
                      <p className="text-xs text-blue-600 mb-2">Editing Block #{actualIndex + 1}</p>
                      <BlocksEditor
                        block={block}
                        onSave={(updatedBlock) => handleUpdateBlock(actualIndex, updatedBlock)}
                        onCancel={() => setEditingBlockIndex(null)}
                      />
                    </div>
                  ) : (
                    <BlocksRenderer block={block} />
                  )}
                </div>
                {editingBlockIndex !== actualIndex && (
                  <div className="absolute top-2 right-2 space-x-2 flex">
                    <button
                      onClick={() => moveBlockUp(actualIndex)}
                      className="text-gray-500 hover:text-black"
                      disabled={actualIndex === 0}
                      title="Move Up"
                    >
                      <FaArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => moveBlockDown(actualIndex)}
                      className="text-gray-500 hover:text-black"
                      disabled={actualIndex === historyData.length - 1}
                      title="Move Down"
                    >
                      <FaArrowDown size={16} />
                    </button>
                    <button
                      onClick={() => setEditingBlockIndex(actualIndex)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit Block"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBlockRequest(actualIndex)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete Block"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* 블록 아래 Add Block 버튼 */}
              {editingBlockIndex === null && insertionIndex === null && (
                <div 
                  className="text-center h-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out transform group-hover:opacity-100 group-hover:h-auto group-hover:translate-y-2"
                >
                  <button
                    onClick={() => setInsertionIndex(actualIndex)}
                    className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                  >
                    <FaPlus className="inline mr-1" />
                    Add Block Here
                  </button>
                </div>
              )}

              {/* 인서션 인덱스가 실제 인덱스일 때 에디터 표시 */}
              {editingBlockIndex === null && insertionIndex === actualIndex && (
                <div className="mt-4 border p-4 rounded bg-gray-50">
                  <p className="text-sm text-gray-500 mb-2">Inserting block at position {insertionIndex + 1}</p>
                  <BlocksEditor onSave={handleAddBlock} onCancel={() => setInsertionIndex(null)} />
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}

      {/* 마지막에 삽입하는 경우 */}
      {filteredData.length > 0 && insertionIndex === historyData.length && editingBlockIndex === null && (
        <div className="mt-4 border p-4 rounded bg-gray-50">
          <p className="text-sm text-gray-500 mb-2">Inserting block at position {insertionIndex + 1}</p>
          <BlocksEditor onSave={handleAddBlock} onCancel={() => setInsertionIndex(null)} />
        </div>
      )}

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={deleteIndex !== null}
        onRequestClose={handleDeleteBlockCancel}
        ariaHideApp={false}
        className="bg-white p-6 rounded shadow-xl max-w-md mx-auto my-40 relative"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-semibold mb-4">Delete Confirmation</h2>
        <p className="mb-6">Are you sure you want to delete block #{deleteIndex !== null ? deleteIndex + 1 : ''}?</p>
        <div className="flex justify-end space-x-2">
          <button onClick={handleDeleteBlockCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button onClick={handleDeleteBlockConfirm} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default HistoryManager;