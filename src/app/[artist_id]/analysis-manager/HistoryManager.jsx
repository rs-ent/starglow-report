// src/app/[artist_id]/HistoryManager.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { fetchData, saveData } from '../../firebase/fetch'; // fetch.js의 경로에 맞게 수정
import BlocksRenderer from './BlocksRenderer';
import BlocksEditor from './BlocksEditor';
import { FaPlus, FaArrowUp, FaArrowDown, FaEdit, FaTrash } from 'react-icons/fa';

const HistoryManager = ({ artist_id }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBlockIndex, setEditingBlockIndex] = useState(null);
  const [insertionIndex, setInsertionIndex] = useState(null); 

  // 데이터 가져오기
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

  // 블록 추가
  const handleAddBlock = (newBlock) => {
    let updatedHistory = [...historyData];
    if (insertionIndex !== null) {
      updatedHistory.splice(insertionIndex, 0, newBlock); // 지정된 위치에 삽입
      setInsertionIndex(null); // 삽입 후 위치 초기화
    } else {
      updatedHistory = [...updatedHistory, newBlock]; // 기본적으로 맨 뒤에 추가
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

  // 블록 삭제
  const handleDeleteBlock = (index) => {
    const updatedHistory = historyData.filter((_, i) => i !== index);
    saveHistoryData(updatedHistory);
  };

  // 순서 변경 - 위로 이동
  const moveBlockUp = (index) => {
    if (index === 0) return; // 첫 번째 아이템은 이동 불가
    const updatedHistory = [...historyData];
    [updatedHistory[index - 1], updatedHistory[index]] = [
      updatedHistory[index],
      updatedHistory[index - 1],
    ];
    saveHistoryData(updatedHistory);
  };

  // 순서 변경 - 아래로 이동
  const moveBlockDown = (index) => {
    if (index === historyData.length - 1) return; // 마지막 아이템은 이동 불가
    const updatedHistory = [...historyData];
    [updatedHistory[index], updatedHistory[index + 1]] = [
      updatedHistory[index + 1],
      updatedHistory[index],
    ];
    saveHistoryData(updatedHistory);
  };

  // 데이터 저장
  const saveHistoryData = async (data) => {
    try {
      await saveData('history', { artist_id, history: data }, artist_id);
      setHistoryData(data);
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  if (loading) {
    return <div>Loading analysis...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Analysis Manager</h1>
      {historyData.map((block, index) => (
        <div key={index} className="relative mb-1 border p-2 rounded">
          <div className="max-w-[480px] content-center">
            {editingBlockIndex === index ? (
              <BlocksEditor
                block={block}
                onSave={(updatedBlock) => handleUpdateBlock(index, updatedBlock)}
                onCancel={() => setEditingBlockIndex(null)}
              />
            ) : (
              <BlocksRenderer block={block} />
            )}
          </div>
          <div className="absolute top-2 right-2 space-x-2 flex">
            <button
              onClick={() => setInsertionIndex(index)}
              className="text-green-500 hover:text-green-700"
              title="Insert Above"
            >
              <FaPlus size={16} />
            </button>
            <button
              onClick={() => moveBlockUp(index)}
              className="text-gray-500 hover:text-black"
              disabled={index === 0}
              title="Move Up"
            >
              <FaArrowUp size={16} />
            </button>
            <button
              onClick={() => moveBlockDown(index)}
              className="text-gray-500 hover:text-black"
              disabled={index === historyData.length - 1}
              title="Move Down"
            >
              <FaArrowDown size={16} />
            </button>
            <button
              onClick={() => setEditingBlockIndex(index)}
              className="text-blue-500 hover:text-blue-700"
              title="Edit Block"
            >
              <FaEdit size={16} />
            </button>
            <button
              onClick={() => handleDeleteBlock(index)}
              className="text-red-500 hover:text-red-700"
              title="Delete Block"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      ))}
      {editingBlockIndex === null && (
        <BlocksEditor onSave={handleAddBlock} />
      )}
      {insertionIndex !== null && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 mb-2">Inserting block at position {insertionIndex + 1}</p>
          <button
            onClick={() => setInsertionIndex(null)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryManager;