// src/app/[artist_id]/history-manager/BlocksInputs.jsx
import React from 'react';
import { uploadFiles } from '../../firebase/fetch';
import { safeLangValue, updateLangField, safeLangMapper } from '../../../script/convertLang';

const BlocksInputs = ({ type, data, onChange, currentLang = 'ko' }) => {
  /**
   * 언어별 필드 업데이트 핸들러
   * - 예: text, content, alt, etc.가 { ko:'...', en:'...' } 형태일 때 사용
   */
  const handleLangChange = (fieldName, newVal) => {
    const oldValue = data[fieldName];
    const updated = updateLangField(oldValue, currentLang, newVal);
    onChange({ [fieldName]: updated });
  };

  /**
   * 파일 업로드 (이미지/파일) 공통 로직
   */
  const handleFileUpload = async (e, multiple = false) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      try {
        const uploadResult = await uploadFiles(files, 'uploads/', (index, progress) => {
          console.log(`File ${index + 1} progress: ${progress}%`);
        });
        // multiple=true면 배열, false면 첫 번째 파일만
        return multiple ? uploadResult : uploadResult[0];
      } catch (error) {
        console.error('File upload failed:', error);
        alert('Failed to upload file. Please try again.');
      }
    }
    return null;
  };

  /**
   * 일반 (단일값) 필드 변경
   * - 예: src, rows, columns, language, etc.
   */
  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    let val = inputType === 'checkbox' ? checked : value;
    onChange({ [name]: val });
  };

  switch (type) {
    /**
     * SectionTitle
     * text, alt → 언어별
     * src → 단일
     * fullSize (checkbox)
     */
    case 'SectionTitle':
      return (
        <div className="space-y-3">
          <label className="block mb-1 text-[rgba(255,255,255,0.8)] font-medium">
            Section Title Text ({currentLang})
          </label>
          <input
            type="text"
            name="text"
            value={data.text?.[currentLang] || ''}
            onChange={(e) => handleLangChange('text', e.target.value)}
            className="
              w-full p-2 rounded 
              border border-[rgba(255,255,255,0.2)] 
              bg-[rgba(255,255,255,0.05)] 
              text-[rgba(255,255,255,0.9)]
              focus:outline-none 
              focus:ring-2 
              focus:ring-[rgba(255,255,255,0.4)]
              transition
            "
          />

          <label className="block text-[rgba(255,255,255,0.8)] font-medium">
            Image URL
          </label>
          <input
            type="text"
            name="src"
            value={data.src || ''}
            onChange={handleChange}
            placeholder="Enter image URL or upload below"
            className="
              w-full p-2 rounded 
              border border-[rgba(255,255,255,0.2)] 
              bg-[rgba(255,255,255,0.05)] 
              text-[rgba(255,255,255,0.9)]
              focus:outline-none 
              focus:ring-2 
              focus:ring-[rgba(255,255,255,0.4)]
              transition
            "
          />

          <label className="block text-[rgba(255,255,255,0.8)] font-medium">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const uploadedFile = await handleFileUpload(e, false);
              if (uploadedFile) {
                onChange({ src: uploadedFile.downloadURL });
              }
            }}
            className="
              w-full p-2 rounded 
              border border-[rgba(255,255,255,0.2)] 
              bg-[rgba(255,255,255,0.05)] 
              file:text-[rgba(255,255,255,0.7)]
              file:bg-[rgba(255,255,255,0.1)]
              hover:file:bg-[rgba(255,255,255,0.15)]
              text-[rgba(255,255,255,0.9)]
              focus:outline-none 
              focus:ring-2 
              focus:ring-[rgba(255,255,255,0.4)]
              transition
            "
          />

          <label className="block text-[rgba(255,255,255,0.8)] font-medium">
            Alt Text ({currentLang})
          </label>
          <input
            type="text"
            name="alt"
            value={data.alt?.[currentLang] || ''}
            onChange={(e) => handleLangChange('alt', e.target.value)}
            placeholder="Enter alt text for the image"
            className="
              w-full p-2 rounded 
              border border-[rgba(255,255,255,0.2)] 
              bg-[rgba(255,255,255,0.05)] 
              text-[rgba(255,255,255,0.9)]
              focus:outline-none 
              focus:ring-2 
              focus:ring-[rgba(255,255,255,0.4)]
              transition
            "
          />

          {/* Full Size Button Checkbox */}
          <div className="mt-3">
            <label className="inline-flex items-center text-[rgba(255,255,255,0.8)]">
              <input
                type="checkbox"
                name="fullSize"
                checked={data.fullSize || false}
                onChange={handleChange}
                className="
                  mr-2 rounded 
                  border-[rgba(255,255,255,0.2)] 
                  bg-[rgba(255,255,255,0.05)]
                  text-[rgba(255,255,255,0.9)]
                  focus:ring-[rgba(255,255,255,0.3)]
                "
              />
              Full Size Button
            </label>
          </div>
        </div>
      );

    /**
     * Title / Subtitle
     * text → 언어별
     */
    case 'Title':
    case 'Subtitle':
      return (
        <div className="space-y-2">
          <label className="block text-[rgba(255,255,255,0.8)] font-medium">
            {type} Text ({currentLang})
          </label>
          <input
            type="text"
            name="text"
            value={data.text?.[currentLang] || ''}
            onChange={(e) => handleLangChange('text', e.target.value)}
            className="
              w-full p-2 rounded 
              border border-[rgba(255,255,255,0.2)] 
              bg-[rgba(255,255,255,0.05)] 
              text-[rgba(255,255,255,0.9)]
              focus:outline-none 
              focus:ring-2 
              focus:ring-[rgba(255,255,255,0.4)]
              transition
            "
          />
        </div>
      );

    /**
     * Text
     * content → 언어별
     */
    case 'Text':
      return (
        <div className="space-y-2">
          <label className="block text-[rgba(255,255,255,0.8)] font-medium">
            Content
          </label>
          <textarea
            name="content"
            value={data.content?.[currentLang] || ''}
            onChange={(e) => handleLangChange('content', e.target.value)}
            rows="4"
            className="
              w-full p-2 rounded 
              border border-[rgba(255,255,255,0.2)] 
              bg-[rgba(255,255,255,0.05)] 
              text-[rgba(255,255,255,0.9)]
              focus:outline-none 
              focus:ring-2 
              focus:ring-[rgba(255,255,255,0.4)]
              transition
            "
          />
        </div>
      );

    /**
     * Image
     * src → 단일
     * alt → 언어별
     */
    case 'Image':
      return (
        <div className="space-y-3">
          <label className="block text-[rgba(255,255,255,0.8)] font-medium">
            Image URL
          </label>
          <input
            type="text"
            name="src"
            value={data.src || ''}
            onChange={handleChange}
            placeholder="Enter image URL or upload below"
            className="
              w-full p-2 rounded 
              border border-[rgba(255,255,255,0.2)]
              bg-[rgba(255,255,255,0.05)]
              text-[rgba(255,255,255,0.9)]
              focus:outline-none 
              focus:ring-2 
              focus:ring-[rgba(255,255,255,0.4)]
              transition
            "
          />

          <label className="block text-[rgba(255,255,255,0.8)] font-medium">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const uploadedFile = await handleFileUpload(e, false);
              if (uploadedFile) {
                onChange({ src: uploadedFile.downloadURL });
              }
            }}
            className="
              w-full p-2 rounded 
              border border-[rgba(255,255,255,0.2)]
              bg-[rgba(255,255,255,0.05)]
              file:text-[rgba(255,255,255,0.7)]
              file:bg-[rgba(255,255,255,0.1)]
              hover:file:bg-[rgba(255,255,255,0.15)]
              text-[rgba(255,255,255,0.9)]
              focus:outline-none 
              focus:ring-2 
              focus:ring-[rgba(255,255,255,0.4)]
              transition
            "
          />

          <label className="block text-[rgba(255,255,255,0.8)] font-medium">
            Alt Text ({currentLang})
          </label>
          <input
            type="text"
            name="alt"
            value={data.alt?.[currentLang] || ''}
            onChange={(e) => handleLangChange('alt', e.target.value)}
            placeholder="Enter alt text for the image"
            className="
              w-full p-2 rounded
              border border-[rgba(255,255,255,0.2)]
              bg-[rgba(255,255,255,0.05)]
              text-[rgba(255,255,255,0.9)]
              focus:outline-none 
              focus:ring-2 
              focus:ring-[rgba(255,255,255,0.4)]
              transition
            "
          />
        </div>
      );

    /**
     * Video
     * src → 단일
     */
    case 'Video':
      return (
        <div className="space-y-2">
          <label className="block text-[rgba(255,255,255,0.8)] font-medium">
            Video URL
          </label>
          <input
            type="text"
            name="src"
            value={data.src || ''}
            onChange={handleChange}
            className="
              w-full p-2 rounded
              border border-[rgba(255,255,255,0.2)]
              bg-[rgba(255,255,255,0.05)]
              text-[rgba(255,255,255,0.9)]
              focus:outline-none 
              focus:ring-2 
              focus:ring-[rgba(255,255,255,0.4)]
              transition
            "
          />
        </div>
      );

    /**
     * List
     * items → { ko:[], en:[] }
     * ordered → 단일(boolean)
     */
    case 'List':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Items ({currentLang}) - separate by newline
            </label>
            <textarea
              name="items"
              value={data.items?.[currentLang] ? data.items[currentLang].join('\n') : ''}
              onChange={(e) => handleLangChange('items', e.target.value.split('\n'))}
              rows="4"
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Ordered
            </label>
            <select
              name="ordered"
              value={data.ordered || 'false'}
              onChange={handleChange}
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            >
              <option value="false">Unordered</option>
              <option value="true">Ordered</option>
            </select>
          </div>
        </div>
      );

    /**
     * Blockquote
     * text, cite → 언어별
     */
    case 'Blockquote':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Quote Text ({currentLang})
            </label>
            <textarea
              name="text"
              rows="3"
              value={data.text?.[currentLang] || ''}
              onChange={(e) => handleLangChange('text', e.target.value)}
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Citation ({currentLang})
            </label>
            <input
              type="text"
              name="cite"
              value={data.cite?.[currentLang] || ''}
              onChange={(e) => handleLangChange('cite', e.target.value)}
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>
        </div>
      );

    /**
     * Code
     * code, language → 단일(= 굳이 언어별 필요 X)
     */
    case 'Code':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Code
            </label>
            <textarea
              name="code"
              value={data.code || ''}
              onChange={handleChange}
              rows="4"
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Language
            </label>
            <input
              type="text"
              name="language"
              value={data.language || ''}
              onChange={handleChange}
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>
        </div>
      );

    /**
     * Table
     * tableData → { ko:[], en:[] }, rows, columns → 단일
     * row 내용은 @@로 구분
     */
    case 'Table': {
      let normalizedRows = safeLangMapper(data.tableData, currentLang).map((row) => {
        if (Array.isArray(row)) return row;
        if (typeof row === 'string') return row.split('@@');
        return [];
      });
    
      // 데이터가 없으면 기본 Rows/Columns 값으로 초기화
      if (normalizedRows.length === 0) {
        const defaultRows = data.rows || 1;
        const defaultColumns = data.columns || 1;
        normalizedRows = Array.from({ length: defaultRows }, () =>
          Array.from({ length: defaultColumns }, () => '')
        );
      }
    
      // 열에 맞게 행 조정
      const adjustRowColumns = (row, targetCols) => {
        const currentCols = row.length;
        if (currentCols < targetCols) {
          // 부족한 열은 빈 문자열로
          return [...row, ...Array.from({ length: targetCols - currentCols }, () => '')];
        } else if (currentCols > targetCols) {
          // 초과하는 열은 잘라냄
          return row.slice(0, targetCols);
        }
        return row;
      };
    
      // 각 행을 '@@'로 join한 문자열 배열로 변환하는 함수
      const serializeRows = (rows) => rows.map((row) => row.join('@@'));
    
      // 업데이트된 normalizedRows를 저장하기 위해 tableData 객체 갱신
      const updateTableData = (updatedRows) => {
        const serialized = serializeRows(updatedRows);
        const updatedTableData = {
          ...(data.tableData || {}),
          [currentLang]: serialized,
        };
        onChange({ tableData: updatedTableData });
      };
    
      return (
        <div className="space-y-4">
          {/* 테이블 크기 설정 */}
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium">
              Table Dimensions
            </label>
            <div className="flex space-x-4 mt-2">
              {/* 행 입력 */}
              <div className="flex-1">
                <label className="block text-sm text-[rgba(255,255,255,0.6)]">Rows</label>
                <input
                  type="number"
                  name="rows"
                  min="1"
                  value={data.rows || 1}
                  onChange={(e) => {
                    const newRowCount = parseInt(e.target.value, 10) || 1;
                    let updatedRows = [...normalizedRows];
                    if (newRowCount > updatedRows.length) {
                      // 부족한 행을 기본값(각 행은 data.columns 길이의 빈 배열)으로 추가
                      const cols = data.columns || 1;
                      const rowsToAdd = Array.from({ length: newRowCount - updatedRows.length }, () =>
                        Array.from({ length: cols }, () => '')
                      );
                      updatedRows = updatedRows.concat(rowsToAdd);
                    } else if (newRowCount < updatedRows.length) {
                      updatedRows = updatedRows.slice(0, newRowCount);
                    }
                    onChange({
                      rows: newRowCount,
                      tableData: { ...(data.tableData || {}), [currentLang]: serializeRows(updatedRows) },
                    });
                    normalizedRows = updatedRows; // local 값 업데이트
                  }}
                  className="w-full p-2 rounded border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.9)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.4)] transition"
                />
              </div>
              {/* 열 입력 */}
              <div className="flex-1">
                <label className="block text-sm text-[rgba(255,255,255,0.6)]">Columns</label>
                <input
                  type="number"
                  name="columns"
                  min="1"
                  value={data.columns || 1}
                  onChange={(e) => {
                    const newColCount = parseInt(e.target.value, 10) || 1;
                    const updatedRows = normalizedRows.map((row) =>
                      adjustRowColumns(row, newColCount)
                    );
                    onChange({
                      columns: newColCount,
                      tableData: { ...(data.tableData || {}), [currentLang]: serializeRows(updatedRows) },
                    });
                    normalizedRows = updatedRows; // local 값 업데이트
                  }}
                  className="w-full p-2 rounded border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.9)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.4)] transition"
                />
              </div>
            </div>
          </div>
    
          {/* 테이블 데이터 편집 */}
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-2">
              Table Data ({currentLang})
            </label>
            <div className="overflow-auto max-h-64 border border-[rgba(255,255,255,0.2)] rounded p-2">
              <table className="min-w-full border-collapse">
                <tbody>
                  {normalizedRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="border border-[rgba(255,255,255,0.2)] p-2 align-top">
                          <input
                            type="text"
                            value={safeLangValue(cell, currentLang)}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              const updatedRows = normalizedRows.map((r, rIdx) =>
                                rIdx === rowIndex
                                  ? r.map((c, cIdx) => (cIdx === colIndex ? newValue : c))
                                  : r
                              );
                              updateTableData(updatedRows);
                              normalizedRows = updatedRows; // local 값 업데이트
                            }}
                            className="w-full border-[rgba(255,255,255,0.2)] border p-1 rounded bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.9)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.4)] transition"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    /**
     * Chart
     * title → 단일(예시; 필요하다면 ko/en)
     */
    case 'Chart':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Chart Title
            </label>
            <input
              type="text"
              name="title"
              value={data.title || ''}
              onChange={handleChange}
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Chart Type
            </label>
            <select
              name="chartType"
              value={data.chartType || 'BarChart'}
              onChange={handleChange}
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            >
              <option value="BarChart">Bar Chart</option>
              <option value="LineChart">Line Chart</option>
              <option value="PieChart">Pie Chart</option>
            </select>
          </div>
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Data Points (format: name,value per line)
            </label>
            <textarea
              name="data"
              value={data.data ? data.data.map((dp) => `${dp.name},${dp.value}`).join('\n') : ''}
              onChange={(e) => {
                const dataPoints = e.target.value.split('\n').map((line) => {
                  const [name, value] = line.split(',');
                  return { name, value: parseFloat(value) };
                });
                onChange({ data: dataPoints });
              }}
              rows="4"
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Data Key
            </label>
            <input
              type="text"
              name="dataKey"
              value={data.dataKey || 'value'}
              onChange={handleChange}
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>
        </div>
      );

    /**
     * Link
     * href, text → 단일(필요시 text도 ko/en 가능)
     */
    case 'Link':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Link URL
            </label>
            <input
              type="text"
              name="href"
              value={data.href || ''}
              onChange={handleChange}
              className="
                w-full p-2 rounded
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Link Text
            </label>
            <input
              type="text"
              name="text"
              value={data.text || ''}
              onChange={handleChange}
              className="
                w-full p-2 rounded
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>
        </div>
      );

    /**
     * File
     * href, filename → 단일
     */
    case 'File':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              File URL
            </label>
            <input
              type="text"
              name="href"
              value={data.href || ''}
              onChange={handleChange}
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              File Name
            </label>
            <input
              type="text"
              name="filename"
              value={data.filename || ''}
              onChange={handleChange}
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>
        </div>
      );

    /**
     * Countdown
     * title, targetDate → 단일 (필요시 title도 ko/en 가능)
     */
    case 'Countdown':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Countdown Title
            </label>
            <input
              type="text"
              name="title"
              value={data.title || ''}
              onChange={handleChange}
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Target Date
            </label>
            <input
              type="datetime-local"
              name="targetDate"
              value={data.targetDate || ''}
              onChange={handleChange}
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>
        </div>
      );

    /**
     * Gallery
     * images → [{ src, alt }, ... ]
     */
    case 'Gallery':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Image URLs (one per line)
            </label>
            <textarea
              name="images"
              value={data.images ? data.images.map((img) => img.src).join('\n') : ''}
              onChange={(e) => {
                const images = e.target.value.split('\n').map((src) => ({ src, alt: '' }));
                onChange({ images });
              }}
              rows="4"
              placeholder="Enter one image URL per line"
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>

          <div>
            <label className="block text-[rgba(255,255,255,0.8)] font-medium mb-1">
              Upload Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const uploadResults = await handleFileUpload(e, true);
                if (uploadResults) {
                  const uploadedImages = uploadResults.map((file) => ({
                    src: file.downloadURL,
                    alt: '',
                  }));
                  onChange({ images: [...(data.images || []), ...uploadedImages] });
                }
              }}
              className="
                w-full p-2 rounded 
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
                file:text-[rgba(255,255,255,0.7)]
                file:bg-[rgba(255,255,255,0.1)]
                hover:file:bg-[rgba(255,255,255,0.15)]
                text-[rgba(255,255,255,0.9)]
                focus:outline-none 
                focus:ring-2 
                focus:ring-[rgba(255,255,255,0.4)]
                transition
              "
            />
          </div>

          {data.images && data.images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {data.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.src}
                    alt={img.alt || 'Uploaded image'}
                    className="
                      w-full h-auto rounded 
                      border border-[rgba(255,255,255,0.2)]
                      transition
                      hover:opacity-90
                    "
                  />
                  <button
                    onClick={() => {
                      const updatedImages = data.images.filter((_, i) => i !== index);
                      onChange({ images: updatedImages });
                    }}
                    className="
                      absolute top-1 right-1 
                      bg-[rgba(239,68,68,1)] 
                      text-[rgba(255,255,255,1)] 
                      rounded-full 
                      w-6 h-6 
                      flex items-center justify-center 
                      text-xs font-bold
                      hover:bg-[rgba(220,38,38,1)]
                      transition
                      shadow
                    "
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
      // 처리되지 않은 블록 타입
      return null;
  }
};

export default BlocksInputs;