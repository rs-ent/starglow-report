// src/app/[artist_id]/history-manager/BlocksInputs.jsx
import React from 'react';
import { uploadFiles } from '../../firebase/fetch';

const BlocksInputs = ({ type, data, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  switch (type) {
    case 'SectionTitle':
      return (
        <div>
          <label className="block mb-2 font-semibold">Section Title Text</label>
          <input
            type="text"
            name="text"
            value={data.text || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full mb-4"
          />

          <label className="block mb-2 font-semibold">Image URL</label>
          <input
            type="text"
            name="src"
            value={data.src || ''}
            onChange={handleChange}
            placeholder="Enter image URL or upload below"
            className="p-2 border rounded w-full mb-4"
          />

          <label className="block mb-2 font-semibold">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const files = Array.from(e.target.files);
              if (files.length > 0) {
                try {
                  // 이미지 업로드 처리
                  const uploadResult = await uploadFiles(files, 'uploads/', (index, progress) => {
                    console.log(`File ${index + 1} progress: ${progress}%`);
                  });
                  const uploadedFile = uploadResult[0]; // 첫 번째 파일만 사용
                  onChange({ src: uploadedFile.downloadURL });
                } catch (error) {
                  console.error('Image upload failed:', error);
                  alert('Failed to upload image. Please try again.');
                }
              }
            }}
            className="p-2 border rounded w-full"
          />

          <label className="block mt-4 mb-2 font-semibold">Alt Text</label>
          <input
            type="text"
            name="alt"
            value={data.alt || ''}
            onChange={handleChange}
            placeholder="Enter alt text for the image"
            className="p-2 border rounded w-full"
          />

          {/* Full Size Button Checkbox */}
          <div className="mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="fullSize"
                checked={data.fullSize || false}
                onChange={(e) => onChange({ fullSize: e.target.checked })}
                className="mr-2"
              />
              Full Size Button
            </label>
          </div>
        </div>
      );
    case 'Title':
    case 'Subtitle':
      return (
        <div>
          <label className="block mb-2 font-semibold">{type} Text</label>
          <input
            type="text"
            name="text"
            value={data.text || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
        </div>
      );
    case 'Text':
      return (
        <div>
          <label className="block mb-2 font-semibold">Content</label>
          <textarea
            name="content"
            value={data.content || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            rows="4"
          ></textarea>
        </div>
      );
      case 'Image':
        return (
          <div>
            <label className="block mb-2 font-semibold">Image URL</label>
            <input
              type="text"
              name="src"
              value={data.src || ''}
              onChange={handleChange}
              placeholder="Enter image URL or upload below"
              className="p-2 border rounded w-full mb-4"
            />
            
            <label className="block mb-2 font-semibold">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const files = Array.from(e.target.files);
                if (files.length > 0) {
                  try {
                    // 업로드 진행
                    const uploadResult = await uploadFiles(files, 'uploads/', (index, progress) => {
                      console.log(`File ${index + 1} progress: ${progress}%`);
                    });
                    const uploadedFile = uploadResult[0]; // 첫 번째 파일만 처리
                    onChange({ src: uploadedFile.downloadURL });
                  } catch (error) {
                    console.error("Image upload failed:", error);
                    alert("Failed to upload image. Please try again.");
                  }
                }
              }}
              className="p-2 border rounded w-full"
            />
            
            <label className="block mt-4 mb-2 font-semibold">Alt Text</label>
            <input
              type="text"
              name="alt"
              value={data.alt || ''}
              onChange={handleChange}
              placeholder="Enter alt text for the image"
              className="p-2 border rounded w-full"
            />
          </div>
        );
    case 'Video':
      return (
        <div>
          <label className="block mb-2 font-semibold">Video URL</label>
          <input
            type="text"
            name="src"
            value={data.src || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
        </div>
      );
    case 'List':
      return (
        <div>
          <label className="block mb-2 font-semibold">Items (separate by newline)</label>
          <textarea
            name="items"
            value={data.items ? data.items.join('\n') : ''}
            onChange={(e) => onChange({ items: e.target.value.split('\n') })}
            className="p-2 border rounded w-full mb-4"
            rows="4"
          ></textarea>
          <label className="block mb-2 font-semibold">Ordered</label>
          <select
            name="ordered"
            value={data.ordered || 'false'}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          >
            <option value="false">Unordered</option>
            <option value="true">Ordered</option>
          </select>
        </div>
      );
    case 'Blockquote':
      return (
        <div>
          <label className="block mb-2 font-semibold">Quote Text</label>
          <textarea
            name="text"
            value={data.text || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full mb-4"
            rows="3"
          ></textarea>
          <label className="block mb-2 font-semibold">Citation</label>
          <input
            type="text"
            name="cite"
            value={data.cite || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
        </div>
      );
    case 'Code':
      return (
        <div>
          <label className="block mb-2 font-semibold">Code</label>
          <textarea
            name="code"
            value={data.code || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full mb-4"
            rows="4"
          ></textarea>
          <label className="block mb-2 font-semibold">Language</label>
          <input
            type="text"
            name="language"
            value={data.language || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
        </div>
      );
      case 'Table':
        return (
          <div>
            <label className="block mb-2 font-semibold">Table Dimensions</label>
            <div className="flex space-x-4 mb-4">
              <div>
                <label className="block text-sm">Rows</label>
                <input
                  type="number"
                  name="rows"
                  min="1"
                  value={data.rows || 1}
                  onChange={(e) => {
                    const rows = parseInt(e.target.value, 10) || 1;
                    const newTableData = Array(rows)
                      .fill('')
                      .map((_, i) => (data.tableData && data.tableData[i]) || ''); // 기존 데이터 유지
                    onChange({ rows, tableData: newTableData });
                  }}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm">Columns</label>
                <input
                  type="number"
                  name="columns"
                  min="1"
                  value={data.columns || 1}
                  onChange={(e) => {
                    const columns = parseInt(e.target.value, 10) || 1;
                    const newTableData = (data.tableData || []).map((row) => {
                      const cells = row.split('@@');
                      const updatedRow = Array(columns)
                        .fill('')
                        .map((_, i) => cells[i] || ''); // 기존 열 데이터 유지
                      return updatedRow.join('@@');
                    });
                    onChange({ columns, tableData: newTableData });
                  }}
                  className="p-2 border rounded w-full"
                />
              </div>
            </div>

            <label className="block mb-2 font-semibold">Table Data</label>
            {data.tableData && (
              <div className="overflow-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <tbody>
                    {data.tableData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Array.from({ length: data.columns || 1 }).map((_, colIndex) => {
                          const cells = row.split('@@');
                          return (
                            <td key={colIndex} className="border border-gray-300 p-2">
                              <input
                                type="text"
                                value={cells[colIndex] || ''}
                                onChange={(e) => {
                                  const updatedRow = [...cells];
                                  updatedRow[colIndex] = e.target.value;
                                  const newTableData = [...data.tableData];
                                  newTableData[rowIndex] = updatedRow.join('@@');
                                  onChange({ tableData: newTableData });
                                }}
                                className="w-full border border-gray-200 p-1"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
    case 'Chart':
      return (
        <div>
          <label className="block mb-2 font-semibold">Chart Title</label>
          <input
            type="text"
            name="title"
            value={data.title || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full mb-4"
          />
          <label className="block mb-2 font-semibold">Chart Type</label>
          <select
            name="chartType"
            value={data.chartType || 'BarChart'}
            onChange={handleChange}
            className="p-2 border rounded w-full mb-4"
          >
            <option value="BarChart">Bar Chart</option>
            <option value="LineChart">Line Chart</option>
            <option value="PieChart">Pie Chart</option>
          </select>
          <label className="block mb-2 font-semibold">Data Points (format: name,value per line)</label>
          <textarea
            name="data"
            value={data.data ? data.data.map(dp => `${dp.name},${dp.value}`).join('\n') : ''}
            onChange={(e) => {
              const dataPoints = e.target.value.split('\n').map(line => {
                const [name, value] = line.split(',');
                return { name, value: parseFloat(value) };
              });
              onChange({ data: dataPoints });
            }}
            className="p-2 border rounded w-full"
            rows="4"
          ></textarea>
          <label className="block mb-2 font-semibold">Data Key</label>
          <input
            type="text"
            name="dataKey"
            value={data.dataKey || 'value'}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
        </div>
      );
    case 'Link':
      return (
        <div>
          <label className="block mb-2 font-semibold">Link URL</label>
          <input
            type="text"
            name="href"
            value={data.href || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full mb-4"
          />
          <label className="block mb-2 font-semibold">Link Text</label>
          <input
            type="text"
            name="text"
            value={data.text || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
        </div>
      );
    case 'File':
      return (
        <div>
          <label className="block mb-2 font-semibold">File URL</label>
          <input
            type="text"
            name="href"
            value={data.href || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full mb-4"
          />
          <label className="block mb-2 font-semibold">File Name</label>
          <input
            type="text"
            name="filename"
            value={data.filename || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
        </div>
      );
    case 'Countdown':
      return (
        <div>
          <label className="block mb-2 font-semibold">Countdown Title</label>
          <input
            type="text"
            name="title"
            value={data.title || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full mb-4"
          />
          <label className="block mb-2 font-semibold">Target Date</label>
          <input
            type="date"
            name="targetDate"
            value={data.targetDate || ''}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
        </div>
      );
      case 'Gallery':
        return (
          <div>
            <label className="block mb-2 font-semibold">Image URLs (one per line)</label>
            <textarea
              name="images"
              value={data.images ? data.images.map(img => img.src).join('\n') : ''}
              onChange={(e) => {
                const images = e.target.value.split('\n').map(src => ({ src, alt: '' }));
                onChange({ images });
              }}
              className="p-2 border rounded w-full mb-4"
              rows="4"
              placeholder="Enter one image URL per line"
            ></textarea>
      
            <label className="block mb-2 font-semibold">Upload Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files);
                if (files.length > 0) {
                  try {
                    const uploadResults = await uploadFiles(files, 'uploads/', (index, progress) => {
                      console.log(`File ${index + 1} progress: ${progress}%`);
                    });
                    const uploadedImages = uploadResults.map(file => ({
                      src: file.downloadURL,
                      alt: '',
                    }));
                    onChange({ images: [...(data.images || []), ...uploadedImages] });
                  } catch (error) {
                    console.error('Gallery upload failed:', error);
                    alert('Failed to upload images. Please try again.');
                  }
                }
              }}
              className="p-2 border rounded w-full"
            />
      
            {data.images && data.images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {data.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.src}
                      alt={img.alt || 'Uploaded image'}
                      className="w-full h-auto rounded border"
                    />
                    <button
                      onClick={() => {
                        const updatedImages = data.images.filter((_, i) => i !== index);
                        onChange({ images: updatedImages });
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Remove Image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
    default:
      return null;
  }
};

export default BlocksInputs;