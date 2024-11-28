'use client';

import React, { useState } from 'react';
import { uploadFiles } from '../../firebase/fetch';
import './MemberManager.css';

const MemberManager = ({ members, onUpdateMembers, artist_id }) => {
    const [newMember, setNewMember] = useState({
      name: '',
      profilePicture: null,
      tags: [],
    });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState('');
    const [currentTag, setCurrentTag] = useState('');

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewMember((prev) => ({ ...prev, [name]: value }));
    };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadProgress(0);

    try {
      const [uploadedPicture] = await uploadFiles([file], `members/${artist_id}/`, (index, progress) => {
        setUploadProgress(progress);
      });

      setNewMember((prev) => ({ ...prev, profilePicture: uploadedPicture.downloadURL }));
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  const handleAddTag = () => {
    if (!currentTag.trim()) {
      alert('Tag is required.');
      return;
    }

    setNewMember((prev) => ({
      ...prev,
      tags: [...prev.tags, currentTag.trim()], // 새로운 태그 추가
    }));

    setCurrentTag(''); // 입력 필드 초기화
  };

  const handleRemoveTag = (tag) => {
    setNewMember((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag), // 해당 태그 제거
    }));
  };

  const handleAddOrUpdateMember = () => {
    if (!newMember.name || !newMember.profilePicture) {
      alert('Please fill out the name and upload a profile picture.');
      return;
    }

    if (isEditing) {
      // 멤버 수정
      const updatedMembers = members.map((member) =>
        member.id === editingMemberId ? { ...member, ...newMember } : member
      );
      onUpdateMembers(updatedMembers);
      setIsEditing(false);
      setEditingMemberId(null);
    } else {
      // 새로운 멤버 추가
      const updatedMembers = [...members, { ...newMember, id: Date.now() }];
      onUpdateMembers(updatedMembers);
    }

    setNewMember({ name: '', profilePicture: null, tags: [] });
  };

  const handleEditMember = (member) => {
    setIsEditing(true);
    setEditingMemberId(member.id);
    setNewMember({
      name: member.name,
      profilePicture: member.profilePicture,
      tags: member.tags,
    });
  };

  const handleRemoveMember = (id) => {
    const updatedMembers = members.filter((member) => member.id !== id);
    onUpdateMembers(updatedMembers); // 상위 컴포넌트에 업데이트 전달
  };

  return (
    <section className="member-manager">
      {/* 멤버 리스트 */}
      <div className="member-list-section">
        <div className="member-list">
          {members.map((member) => (
            <div key={member.id} className="member-item">
              <img
                src={member.profilePicture}
                alt={`${member.name} Profile`}
                className="member-image"
              />
              <div className="member-info">
                <h3>{member.name}</h3>
                <ul>
                  {member.tags.map((tag, index) => (
                    <li key={index}>{tag}</li>
                  ))}
                </ul>
              </div>
              <div className="member-buttons">
                <button
                  onClick={() => handleEditMember(member)}
                  className="edit-member-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="remove-member-button"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 멤버 추가/수정 폼 */}
      <div className="member-form-section">
        <h2>{isEditing ? '멤버 수정' : '멤버 추가'}</h2>
        <div className="member-form">
          <p>이름</p>
          <input
            type="text"
            name="name"
            value={newMember.name}
            onChange={handleInputChange}
            placeholder="Member Name"
            className="member-input"
          />
          <p>프로필 사진</p>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleProfilePictureChange}
            className="member-upload-input"
          />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <p>Uploading... {uploadProgress.toFixed(2)}%</p>
          )}
          {newMember.profilePicture && (
            <img
              src={newMember.profilePicture}
              alt="Profile Preview"
              className="profile-preview"
            />
          )}

          <p>태그 추가</p>
          <div className="attributes-list">
            {newMember.tags.map((tag, index) => (
              <div key={index} className="attribute-item">
                <span>{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="remove-attribute-button"
                >
                  X
                </button>
              </div>
            ))}
          </div>

          <div className="dynamic-fields">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              placeholder="Tag (e.g., Vocalist)"
              className="member-input"
            />
            <button
              onClick={handleAddTag}
              className="add-attribute-button"
            >
              Add Tag
            </button>
          </div>

          <button onClick={handleAddOrUpdateMember} className="add-member-button">
            {isEditing ? 'Update Member' : 'Add Member'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default MemberManager;