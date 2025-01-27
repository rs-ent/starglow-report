'use client';

import React, { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Mark } from '@tiptap/core';

// Mentions
import Mention from '@tiptap/extension-mention';

// Icons
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaLink,
  FaUnlink,
  FaHeading,
  FaAlignCenter,
  FaAlignLeft,
  FaAlignRight,
  FaImage,
  FaPaintBrush,
  FaHighlighter,
} from 'react-icons/fa';

import { uploadFiles } from '../../firebase/fetch';

// ========== Mentions (예시) ==========
const mentionSuggestion = {
  char: '@',
  startOfLine: false,
  items: ({ query }) => {
    // 하드코딩 예시: 실제 데이터는 서버/API에서 가져와야 함
    const all = [
      { id: '1', username: 'Alice' },
      { id: '2', username: 'Bob' },
      { id: '3', username: 'Charlie' },
    ];
    return all
      .filter((item) =>
        item.username.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 5);
  },
  render: () => {
    let component;
    return {
      onStart: (props) => {
        component = document.createElement('div');
        component.classList.add('mention-dropdown');
        update(props);
        document.body.appendChild(component);
      },
      onUpdate: (props) => {
        update(props);
      },
      onKeyDown: (props) => {
        // arrow key control, etc. if needed
        return false;
      },
      onExit: () => {
        component?.remove();
      },
    };

    function update(props) {
      if (!component) return;
      component.innerHTML = '';

      props.items.forEach((item) => {
        const el = document.createElement('div');
        el.className = 'mention-item px-2 py-1 hover:bg-gray-100 cursor-pointer';
        el.textContent = item.username;
        el.onclick = () => {
          props.command({ id: item.id, label: item.username });
        };
        component.appendChild(el);
      });

      Object.assign(component.style, {
        position: 'absolute',
        top: `${props.clientRect?.top ?? 0}px`,
        left: `${props.clientRect?.left ?? 0}px`,
        background: 'white',
        border: '1px solid #ccc',
        padding: '4px',
        zIndex: 9999,
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      });
    }
  },
};

export default function TiptapEditor({ value = '', onChange }) {
  const [editorValue, setEditorValue] = useState(value);

  // 컬러 피커
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorValue, setColorValue] = useState('#000000');

  // 이미지 업로드 input
  const fileInputRef = useRef(null);

  // ========== TipTap Editor ==========
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Mention.configure({
        HTMLAttributes: { class: 'mention text-blue-600 font-semibold' },
        suggestion: mentionSuggestion,
      }),
    ],
    content: editorValue,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setEditorValue(html);
      onChange?.(html);
    },
  });

  // (A) 이미지 URL
  const addImageByURL = () => {
    const url = window.prompt('Image URL');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  // (B) 로컬 이미지 업로드
  const handleLocalImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const results = await uploadFiles(
        Array.from(files),
        'images/',
        (idx, progress) => {
          console.log(`File #${idx} progress: ${progress}%`);
        },
      );
      results.forEach(({ downloadURL }) => {
        editor?.chain().focus().setImage({ src: downloadURL }).run();
      });
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Upload failed.');
    } finally {
      e.target.value = '';
    }
  };

  // (C) 링크
  const addLink = () => {
    const url = window.prompt('Link URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };
  const unsetLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  // (D) Text Color
  const applyTextColor = () => {
    editor?.chain().focus().setColor(colorValue).run();
    setShowColorPicker(false);
  };

  // (E) Highlight
  const toggleHighlight = () => {
    editor?.chain().focus().toggleHighlight().run();
  };

  if (!editor) {
    return <div className="text-gray-500">Loading Editor...</div>;
  }

  return (
    <div className="relative p-4 space-y-2 border border-[rgba(255,255,255,0.2)] rounded bg-[rgba(255,255,255,0.05)]">
      <div className="flex flex-wrap items-center gap-2">
        {/* 1) Bold / Italic / Underline */}
        <ToolbarButton
          icon={<FaBold />}
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        />
        <ToolbarButton
          icon={<FaItalic />}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        />
        <ToolbarButton
          icon={<FaUnderline />}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
        />

        {/* 2) Heading */}
        <ToolbarButton
          icon={<FaHeading />}
          label="H1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
        />
        <ToolbarButton
          icon={<FaHeading />}
          label="H2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        />
        <ToolbarButton
          icon={<FaHeading />}
          label="H3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
        />

        {/* 3) Text Align */}
        <ToolbarButton
          icon={<FaAlignLeft />}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
        />
        <ToolbarButton
          icon={<FaAlignCenter />}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
        />
        <ToolbarButton
          icon={<FaAlignRight />}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
        />

        {/* 4) Link */}
        <ToolbarButton icon={<FaLink />} onClick={addLink} />
        <ToolbarButton icon={<FaUnlink />} onClick={unsetLink} />

        {/* 5) Image: URL / Local */}
        <ToolbarButton
          icon={<FaImage />}
          label="URL"
          onClick={addImageByURL}
        />
        <ToolbarButton
          icon={<FaImage />}
          label="Local"
          onClick={() => fileInputRef.current?.click()}
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleLocalImageUpload}
        />

        {/* 6) Color / Highlight */}
        <ToolbarButton
          icon={<FaPaintBrush />}
          onClick={() => setShowColorPicker(!showColorPicker)}
        />
        <ToolbarButton
          icon={<FaHighlighter />}
          onClick={toggleHighlight}
          active={editor.isActive('highlight')}
        />
      </div>

      {/* ========== Color Picker ========== */}
      {showColorPicker && (
        <div className="absolute top-16 left-4 z-50 flex items-center space-x-2 bg-white border border-gray-300 p-2 rounded shadow-lg">
          <input
            type="color"
            value={colorValue}
            onChange={(e) => setColorValue(e.target.value)}
            className="w-10 h-10 border-none outline-none"
          />
          <button
            className="px-3 py-1 text-white rounded bg-[rgba(59,130,246,1)] hover:bg-[rgba(49,120,236,1)] transition"
            onClick={applyTextColor}
          >
            Apply
          </button>
        </div>
      )}

      {/* 에디터 본문 */}
      <EditorContent editor={editor} />
    </div>
  );
}

/**
 * ToolbarButton
 * 아이콘 + 라벨 + active 표시, 디자인 약간 강화
 */
function ToolbarButton({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-1 px-2 py-1 border rounded
        transition-colors
        hover:bg-[rgba(255,255,255,0.15)]
        ${active ? 'bg-[rgba(59,130,246,0.2)] border-[rgba(59,130,246,0.3)]' : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]'}
      `}
    >
      {icon && <span>{icon}</span>}
      {label && <span>{label}</span>}
    </button>
  );
}