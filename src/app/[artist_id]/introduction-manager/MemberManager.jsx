'use client';

import React, { useState } from 'react';
import { uploadFiles } from '../../firebase/fetch';
import { safeLangValue, updateLangField } from '../../../script/convertLang';

// Drag and Drop 관련
import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';

// 문자열 태그를 { ko, en } 구조로 바꿔주는 헬퍼
function normalizeTag(tag) {
  if (!tag) return { ko: '', en: '' };
  if (typeof tag === 'object') return tag;
  // 문자열이면 ko로 간주
  return { ko: tag, en: '' };
}

const MemberManager = ({
  members,
  onUpdateMembers,
  artist_id,
  activeLanguage = 'ko',
}) => {
  const [newMember, setNewMember] = useState({
    name: { ko: '', en: '' },
    profilePicture: null,
    // tags 배열: 각 요소는 { ko:'...', en:'...' }
    tags: [],
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState('');

  // 새로 추가할 태그 (ko/en 동시 입력)
  const [newTagInput, setNewTagInput] = useState({ ko: '', en: '' });

  // 태그 '수정' 모드를 각 아이템별로 지원하기 위해,
  // editIndex와 editValues를 분리 관리 (간단 예시)
  const [tagEditIndex, setTagEditIndex] = useState(null);
  const [tagEditValues, setTagEditValues] = useState({ ko: '', en: '' });

  // ========== Handlers ==========

  // 멤버 이름(name) 입력
  const handleNameChange = (e) => {
    const { value } = e.target;
    setNewMember((prev) => ({
      ...prev,
      name: updateLangField(prev.name, activeLanguage, value),
    }));
  };

  // 프로필 사진 업로드
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(0);

    try {
      const [uploadedPicture] = await uploadFiles(
        [file],
        `members/${artist_id}/`,
        (index, progress) => setUploadProgress(progress)
      );
      setNewMember((prev) => ({
        ...prev,
        profilePicture: uploadedPicture.downloadURL,
      }));
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  // ================== 태그 추가 ==================
  const handleNewTagChange = (e, lang) => {
    setNewTagInput((prev) => ({
      ...prev,
      [lang]: e.target.value,
    }));
  };

  const handleAddTag = () => {
    // ko, en 둘 다 비어 있으면 추가 불가 (또는 원하는 로직)
    if (!newTagInput.ko.trim() && !newTagInput.en.trim()) {
      alert('적어도 한 언어는 입력해야 합니다.');
      return;
    }
    setNewMember((prev) => ({
      ...prev,
      tags: [...prev.tags, { ...newTagInput }],
    }));
    setNewTagInput({ ko: '', en: '' });
  };

  // ================== 태그 수정 ==================
  const startEditTag = (index) => {
    setTagEditIndex(index);
    // 기존 태그값을 그대로 복사해서 editValues로
    const currentTag = newMember.tags[index];
    const normalized = normalizeTag(currentTag);
    setTagEditValues({ ...normalized });
  };

  const handleTagEditChange = (e, lang) => {
    setTagEditValues((prev) => ({
      ...prev,
      [lang]: e.target.value,
    }));
  };

  const saveTagEdit = (index) => {
    // ko, en 둘 다 비었는지 체크
    if (!tagEditValues.ko.trim() && !tagEditValues.en.trim()) {
      alert('적어도 한 언어는 입력해야 합니다.');
      return;
    }
    setNewMember((prev) => {
      const updated = [...prev.tags];
      updated[index] = { ...tagEditValues };
      return { ...prev, tags: updated };
    });
    setTagEditIndex(null);
  };

  const cancelTagEdit = () => {
    setTagEditIndex(null);
    setTagEditValues({ ko: '', en: '' });
  };

  // ================== 태그 제거 ==================
  const handleRemoveTag = (index) => {
    setNewMember((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
    // 혹시 편집 중이었다면 편집 취소
    if (tagEditIndex === index) {
      cancelTagEdit();
    }
  };

  // ================== 태그 드래그 앤 드롭 ==================
  const handleTagDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;

    setNewMember((prev) => {
      const updated = [...prev.tags];
      const [removed] = updated.splice(source.index, 1);
      updated.splice(destination.index, 0, removed);
      return { ...prev, tags: updated };
    });
  };

  // ================== 멤버 등록 or 수정 ==================
  const handleAddOrUpdateMember = () => {
    // 이름(ko/en) 중 하나라도 값이 있는지 체크
    const hasName =
      safeLangValue(newMember.name, 'ko') ||
      safeLangValue(newMember.name, 'en');

    if (!hasName || !newMember.profilePicture) {
      alert('Please fill out the name and upload a profile picture.');
      return;
    }

    if (isEditing) {
      // 기존 멤버 수정
      const updatedMembers = members.map((member) =>
        member.id === editingMemberId ? { ...member, ...newMember } : member
      );
      onUpdateMembers(updatedMembers);
      setIsEditing(false);
      setEditingMemberId('');
    } else {
      // 새 멤버 추가
      const updatedMembers = [
        ...members,
        { ...newMember, id: Date.now() },
      ];
      onUpdateMembers(updatedMembers);
    }

    // 폼 리셋
    setNewMember({
      name: { ko: '', en: '' },
      profilePicture: null,
      tags: [],
    });
    setTagEditIndex(null);
    setTagEditValues({ ko: '', en: '' });
  };

  // 수정 모드 진입
  const handleEditMember = (member) => {
    setIsEditing(true);
    setEditingMemberId(member.id);

    // 기존 멤버의 태그 배열도 모두 normalize
    const normalizedTags = (member.tags || []).map(normalizeTag);

    setNewMember({
      name: member.name,
      profilePicture: member.profilePicture,
      tags: normalizedTags,
    });
    setTagEditIndex(null);
    setTagEditValues({ ko: '', en: '' });
  };

  // 멤버 삭제
  const handleRemoveMember = (id) => {
    const updatedMembers = members.filter((m) => m.id !== id);
    onUpdateMembers(updatedMembers);
  };

  // ========== Render ==========

  return (
    <section
      className="
        member-manager
        p-4 space-y-6
        bg-[rgba(0,0,0,0.3)]
        rounded
        text-[rgba(255,255,255,0.9)]
      "
    >
      {/* 멤버 리스트 */}
      <div className="member-list-section">
        <h2 className="text-xl font-bold mb-2">
          {activeLanguage === 'ko' ? '멤버 목록' : 'Member List'}
        </h2>

        <div className="member-list grid grid-cols-4 gap-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="
                member-item
                p-3 rounded border
                border-[rgba(255,255,255,0.1)]
                bg-[rgba(255,255,255,0.05)]
                flex flex-col items-center
                gap-2
                hover:bg-[rgba(255,255,255,0.1)]
                transition
              "
            >
              <img
                src={member.profilePicture}
                alt={`${safeLangValue(member.name, activeLanguage)} Profile`}
                className="
                  member-image
                  w-40 h-40 object-cover rounded-full
                  border border-[rgba(255,255,255,0.2)]
                  shadow
                "
              />
              <div className="member-info text-center">
                <h3 className="font-semibold text-lg">
                  {safeLangValue(member.name, activeLanguage)}
                </h3>
                {/* 태그 목록 (ko/en 중 현재 언어만 보이게) */}
                <div className="grid grid-cols-2 mt-1 text-sm text-[rgba(255,255,255,0.8)]">
                  {(member.tags || []).map((tagObj, idx) => (
                    <p
                      key={idx}
                      className="bg-[rgba(155,155,255,0.3)] rounded-full px-2 py-1 m-1 text-xs"
                    >
                      {safeLangValue(normalizeTag(tagObj), activeLanguage)}
                    </p>
                  ))}
                </div>
              </div>
              <div className="member-buttons flex space-x-2 mt-2">
                <button
                  onClick={() => handleEditMember(member)}
                  className="
                    edit-member-button px-3 py-1 rounded
                    bg-[rgba(59,130,246,0.2)]
                    text-[rgba(255,255,255,0.9)]
                    hover:bg-[rgba(59,130,246,0.3)]
                    transition
                  "
                >
                  {activeLanguage === 'ko' ? '수정' : 'Edit'}
                </button>
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="
                    remove-member-button px-3 py-1 rounded
                    bg-[rgba(239,68,68,0.2)]
                    text-[rgba(255,255,255,0.9)]
                    hover:bg-[rgba(239,68,68,0.3)]
                    transition
                  "
                >
                  {activeLanguage === 'ko' ? '삭제' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 멤버 추가/수정 폼 */}
      <div className="member-form-section space-y-6">
        <h2 className="text-lg font-semibold">
          {isEditing
            ? activeLanguage === 'ko'
              ? '멤버 수정'
              : 'Update Member'
            : activeLanguage === 'ko'
            ? '멤버 추가'
            : 'Add Member'}
        </h2>

        <div
          className="
            member-form space-y-3
            p-3
            rounded
            border border-[rgba(255,255,255,0.1)]
            bg-[rgba(255,255,255,0.05)]
          "
        >
          {/* 이름 (다국어) */}
          <div className="mb-6">
            <label className="block text-sm mb-1" htmlFor="memberName">
              {activeLanguage === 'ko' ? '이름' : 'Name'} ({activeLanguage})
            </label>
            <input
              id="memberName"
              type="text"
              name="name"
              value={safeLangValue(newMember.name, activeLanguage)}
              onChange={handleNameChange}
              placeholder={
                activeLanguage === 'ko' ? '한글 이름' : 'English Name'
              }
              className="
                member-input w-full p-2 rounded
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.1)]
                text-[rgba(255,255,255,1)]
                focus:outline-none
                focus:ring-2
                focus:ring-[rgba(255,255,255,0.4)]
              "
            />
          </div>

          {/* 프로필 사진 */}
          <div className="mb-6">
            <label className="block text-sm mb-1">
              {activeLanguage === 'ko' ? '프로필 사진' : 'Profile Picture'}
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleProfilePictureChange}
              className="
                member-upload-input w-full p-1
                bg-[rgba(255,255,255,0.1)]
                text-[rgba(255,255,255,1)]
                file:bg-[rgba(255,255,255,0.2)]
                hover:file:bg-[rgba(255,255,255,0.3)]
                transition
              "
            />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <p className="mt-1 text-sm text-[rgba(255,255,255,0.8)]">
                {activeLanguage === 'ko' ? '업로드 중...' : 'Uploading...'}{' '}
                {uploadProgress.toFixed(2)}%
              </p>
            )}
            {newMember.profilePicture && (
              <img
                src={newMember.profilePicture}
                alt="Profile Preview"
                className="
                  profile-preview mt-2 w-40 h-40
                  object-cover rounded-full
                  border border-[rgba(255,255,255,0.2)]
                  shadow
                "
              />
            )}
          </div>

          {/* 태그 섹션 (드래그 앤 드롭 + 수정) */}
          <div className="mb-6">
            <label className="block text-sm mb-2 font-semibold">
              {activeLanguage === 'ko' ? '태그 관리' : 'Manage Tags'}
            </label>

            {/* 추가될 태그 입력 */}
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <div className="flex-1">
                <label className="text-xs text-gray-300 block mb-1">
                  ko
                </label>
                <input
                  type="text"
                  placeholder="한글 태그"
                  value={newTagInput.ko}
                  onChange={(e) => handleNewTagChange(e, 'ko')}
                  className="
                    w-full p-2 rounded
                    border border-[rgba(255,255,255,0.2)]
                    bg-[rgba(255,255,255,0.1)]
                    text-[rgba(255,255,255,1)]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[rgba(255,255,255,0.4)]
                  "
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-300 block mb-1">
                  en
                </label>
                <input
                  type="text"
                  placeholder="English Tag"
                  value={newTagInput.en}
                  onChange={(e) => handleNewTagChange(e, 'en')}
                  className="
                    w-full p-2 rounded
                    border border-[rgba(255,255,255,0.2)]
                    bg-[rgba(255,255,255,0.1)]
                    text-[rgba(255,255,255,1)]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[rgba(255,255,255,0.4)]
                  "
                />
              </div>
              <button
                onClick={handleAddTag}
                className="
                  px-4 py-2
                  rounded
                  bg-[rgba(34,197,94,0.2)]
                  text-[rgba(255,255,255,0.9)]
                  hover:bg-[rgba(34,197,94,0.3)]
                  transition
                "
              >
                {activeLanguage === 'ko' ? '태그 추가' : 'Add Tag'}
              </button>
            </div>

            {/* 태그 목록 (드래그 앤 드롭) */}
            <DragDropContext onDragEnd={handleTagDragEnd}>
              <Droppable droppableId="tag-list">
                {(provided) => (
                  <div
                    className="tag-list space-y-2"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {newMember.tags.map((tagObj, index) => (
                      <Draggable
                        key={index.toString()}
                        draggableId={String(index)}
                        index={index}
                      >
                        {(draggableProvided) => (
                          <div
                            className="
                              bg-[rgba(255,255,255,0.1)]
                              p-2 rounded flex items-center
                              justify-between
                            "
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            {...draggableProvided.dragHandleProps}
                          >
                            {tagEditIndex === index ? (
                              /* ==== 태그 편집 모드 ==== */
                              <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
                                <div>
                                  <label className="text-xs text-gray-300 block">
                                    ko
                                  </label>
                                  <input
                                    type="text"
                                    value={tagEditValues.ko}
                                    onChange={(e) => handleTagEditChange(e, 'ko')}
                                    className="
                                      w-full md:w-32 p-1 rounded
                                      border border-[rgba(255,255,255,0.2)]
                                      bg-[rgba(255,255,255,0.1)]
                                      text-[rgba(255,255,255,1)]
                                    "
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-300 block">
                                    en
                                  </label>
                                  <input
                                    type="text"
                                    value={tagEditValues.en}
                                    onChange={(e) => handleTagEditChange(e, 'en')}
                                    className="
                                      w-full md:w-32 p-1 rounded
                                      border border-[rgba(255,255,255,0.2)]
                                      bg-[rgba(255,255,255,0.1)]
                                      text-[rgba(255,255,255,1)]
                                    "
                                  />
                                </div>
                                <div className="ml-auto flex space-x-2">
                                  <button
                                    onClick={() => saveTagEdit(index)}
                                    className="
                                      px-2 py-1 rounded
                                      bg-[rgba(34,197,94,0.4)]
                                      text-white
                                      hover:bg-[rgba(34,197,94,0.6)]
                                      transition
                                    "
                                  >
                                    {activeLanguage === 'ko'
                                      ? '저장'
                                      : 'Save'}
                                  </button>
                                  <button
                                    onClick={cancelTagEdit}
                                    className="
                                      px-2 py-1 rounded
                                      bg-[rgba(239,68,68,0.4)]
                                      text-white
                                      hover:bg-[rgba(239,68,68,0.6)]
                                      transition
                                    "
                                  >
                                    {activeLanguage === 'ko'
                                      ? '취소'
                                      : 'Cancel'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* ==== 태그 일반 모드 ==== */
                              <div className="flex flex-1 items-center gap-2">
                                <span className="text-sm">
                                  {safeLangValue(tagObj, activeLanguage)}
                                </span>
                                <div className="ml-auto flex space-x-2">
                                  <button
                                    onClick={() => startEditTag(index)}
                                    className="
                                      px-2 py-1 rounded
                                      bg-[rgba(59,130,246,0.3)]
                                      text-white
                                      hover:bg-[rgba(59,130,246,0.5)]
                                      transition
                                      text-sm
                                    "
                                  >
                                    {activeLanguage === 'ko' ? '수정' : 'Edit'}
                                  </button>
                                  <button
                                    onClick={() => handleRemoveTag(index)}
                                    className="
                                      px-2 py-1 rounded
                                      bg-[rgba(239,68,68,0.4)]
                                      text-white
                                      hover:bg-[rgba(239,68,68,0.6)]
                                      transition
                                      text-sm
                                    "
                                  >
                                    {activeLanguage === 'ko' ? '삭제' : 'Remove'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* 등록/업데이트 버튼 */}
          <button
            onClick={handleAddOrUpdateMember}
            className="
              add-member-button
              px-4 py-2
              rounded
              bg-[rgba(59,130,246,0.5)]
              text-white
              hover:bg-[rgba(59,130,246,0.7)]
              transition
              w-full
            "
          >
            {isEditing
              ? activeLanguage === 'ko'
                ? '멤버 수정'
                : 'Update Member'
              : activeLanguage === 'ko'
              ? '멤버 추가'
              : 'Add Member'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default MemberManager;