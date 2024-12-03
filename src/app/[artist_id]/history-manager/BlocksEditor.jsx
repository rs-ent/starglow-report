// src/app/[artist_id]/history-manager/BlocksEditor.jsx
import React, { useState } from 'react';
import BlocksInputs from './BlocksInputs';

const BLOCK_TYPES = [
    'SectionTitle',
    'Title',
    'Subtitle',
    'Text',
    'Image',
    'Video',
    'List',
    'Blockquote',
    'Code',
    'Table',
    'Chart',
    'Link',
    'File',
    'Countdown',
    'Gallery',
];

const BlocksEditor = ({ block = null, onSave, onCancel }) => {
  const [type, setType] = useState(block ? block.type : BLOCK_TYPES[0]);
  const [formData, setFormData] = useState(block || { type: BLOCK_TYPES[0] });

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setFormData({ type: e.target.value });
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
    <form onSubmit={handleSubmit} className="border p-4 rounded">
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Block Type</label>
        <select value={type} onChange={handleTypeChange} className="p-2 border rounded w-full">
          {BLOCK_TYPES.map((bt) => (
            <option key={bt} value={bt}>
              {bt}
            </option>
          ))}
        </select>
      </div>
      <BlocksInputs type={type} data={formData} onChange={handleInputChange} />
      <div className="mt-4">
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded mr-2">
          Save Block
        </button>
        {onCancel && (
          <button onClick={onCancel} type="button" className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default BlocksEditor;