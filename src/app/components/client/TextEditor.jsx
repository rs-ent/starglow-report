// src/app/components/client/TextEditor.jsx

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import Quill from 'quill';
import ImageUploader from 'quill-image-uploader';
import { uploadFiles } from '../../firebase/fetch'; // uploadSingleFile 임포트

// Quill 모듈 등록
Quill.register('modules/imageUploader', ImageUploader);

// 링크가 새 탭에서 열리도록 설정
const LinkBlot = Quill.import('formats/link');
LinkBlot.tagName = 'a';
LinkBlot.className = 'external-link';
Quill.register(LinkBlot, true);

const TextEditor = ({
  value,
  onChange,
  placeholder = 'Write something amazing...',
  readOnly = false, // 읽기 전용 모드 지원
}) => {
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      imageUploader: {
        upload: (file) => {
          return uploadFiles(file, 'uploads/', (index, progress) => {
            // 진행률 표시를 원하시면 여기에 로직 추가
            console.log(`Upload progress for file ${index}: ${progress}%`);
          })
            .then((result) => result.downloadURL)
            .catch((error) => {
              console.error('Image upload failed:', error);
              return Promise.reject('Upload failed');
            });
        },
      },
      // 다른 모듈들...
    },
    placeholder,
    readOnly, // 읽기 전용 모드 설정
  });

  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0); // 문자 수 상태 추가

  // 에디터 내용 초기화 핸들러
  const handleClearContent = () => {
    if (quill) {
      quill.setText('');
      if (onChange) {
        onChange('');
      }
    }
  };

  useEffect(() => {
    if (quill) {
      quill.enable(!readOnly);
    }
  }, [quill, readOnly]);

  useEffect(() => {
    if (quill) {
      // 링크가 새 탭에서 열리도록 설정
      quill.root.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
          e.target.setAttribute('target', '_blank');
        }
      });

      const updateCounts = () => {
        const text = quill.getText().trim();
        setWordCount(text.length > 0 ? text.split(/\s+/).length : 0);
        setCharCount(text.length);
      };

      quill.on('text-change', () => {
        if (onChange) {
          onChange(quill.root.innerHTML);
        }
        updateCounts();
      });

      // 초기 단어 수 및 문자 수 설정
      updateCounts();
    }
  }, [quill, onChange]);

  useEffect(() => {
    if (quill && value !== quill.root.innerHTML) {
      quill.root.innerHTML = value || '';
    }
  }, [quill, value]);

  return (
    <div>
      <div ref={quillRef} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '5px',
          color: '#555',
        }}
      >
        <span>단어 수: {wordCount}</span>
        <span>문자 수: {charCount}</span>
        <button
          onClick={handleClearContent}
          style={{
            background: '#f44336',
            color: '#fff',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
        >
          내용 초기화
        </button>
      </div>
    </div>
  );
};

export default TextEditor;