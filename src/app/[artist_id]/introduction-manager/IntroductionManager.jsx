'use client';

import React, { useState, useEffect, useRef } from 'react';
import { uploadFiles, fetchData, saveData, fetchArtist } from '../../firebase/fetch';
import { useReport, useValuation } from '../../../context/GlobalData';
import TiptapEditor from './TipTapEditor'
import MemberManager from './MemberManager';
import Toast from '../../components/client/Toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { safeLangValue, updateLangField, convertKor } from '../../../script/convertLang';

function convertLegacyFields(data) {
  if (!data) return data;
  const newData = { ...data };
  const fieldsToConvert = ['catchPhrase', 'subCatchPhrase', 'introduction'];
  fieldsToConvert.forEach((field) => {
    const val = newData[field];
    if (typeof val === 'string') {
      newData[field] = { ko: val, en: '' };
    }
  });
  return newData;
}

const IntroductionManager = ({ artist_id }) => {
  // (예: melon_artist_id)
  const reportData = useReport();
  // valuationData (앨범 관련)
  const valuationData = useValuation();
  const initialAlbums = valuationData.SV?.sub_data || valuationData.SV?.albums || [];

  // ================== 탭 상태 (Edit / Preview) ==================
  //const [activeTab, setActiveTab] = useState('edit');
  // ================== 언어 상태 (ko / en) ==================
  const [activeLanguage, setActiveLanguage] = useState('ko');

  // ================== 서버에서 불러온 savedData ==================
  const [savedData, setSavedData] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ================== 다국어 필드들 ==================
  const [catchPhrase, setCatchPhrase] = useState({ ko: '', en: '' });
  const [subCatchPhrase, setSubCatchPhrase] = useState({ ko: '', en: '' });
  const [introduction, setIntroduction] = useState({ ko: '', en: '' });

  // ================== 편집 모드 (기존 로직) ==================
  const [isEditing, setIsEditing] = useState(false); // catchphrase 전체
  const [isIntroductionEditing, setIsIntroductionEditing] = useState(false);

  // ================== 이미지 / 파일 업로드 관련 ==================
  const [logo, setLogo] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ================== 갤러리 ==================
  const [galleryImages, setGalleryImages] = useState([]);

  // ================== 앨범 / 멤버 / 팀멤버 ==================
  const [albums, setAlbums] = useState(initialAlbums);
  const [members, setMembers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  // ================== 추가 데이터 (artistData) ==================
  const [artistData, setArtistData] = useState({});
  const [newDataKey, setNewDataKey] = useState('');
  const [newDataValue, setNewDataValue] = useState('');

  // 체크박스 visible
  const [selectedFields, setSelectedFields] = useState({});

  // ================== DB에서 불러오기 ==================
  const loadSavedIntroductionData = async () => {
    try {
      const loadedData = await fetchData('Introduction', {
        comp: 'docId',
        sign: '==',
        val: artist_id,
      }, false);
      setSavedData(loadedData);
    } catch (e) {
      console.error('Fetch Saved Introduction Data Failed', e);
    }
  };

  useEffect(() => {
    loadSavedIntroductionData();
  }, [artist_id]);

  // ================== savedData 반영 (초기 로드 시) ==================
  useEffect(() => {
    if (!savedData) return;
    const converted = convertLegacyFields(savedData);

    // 다국어 필드
    setCatchPhrase(converted.catchPhrase || { ko: '', en: '' });
    setSubCatchPhrase(converted.subCatchPhrase || { ko: '', en: '' });
    setIntroduction(converted.introduction || { ko: '', en: '' });

    // 이미지/파일
    setLogo(converted.logo || null);
    setProfilePicture(converted.profilePicture || null);
    setGalleryImages(converted.galleryImages || []);

    // 앨범, 멤버
    setAlbums(converted.albums || []);
    setMembers(converted.members || []);
    setTeamMembers(converted.teamMembers || []);

    // 추가 데이터
    if (converted.additionalData) {
      setArtistData(converted.additionalData);
    }
  }, [savedData]);

  // ================== 다국어 핸들러 ==================
  const handleCatchPhraseChange = (newVal) => {
    setCatchPhrase((prev) => updateLangField(prev, activeLanguage, newVal));
  };
  const handleSubCatchPhraseChange = (newVal) => {
    setSubCatchPhrase((prev) => updateLangField(prev, activeLanguage, newVal));
  };
  const handleIntroductionChange = (newVal) => {
    setIntroduction((prev) => updateLangField(prev, activeLanguage, newVal));
  };

  // ================== 로고 / 프로필 업로드 ==================
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(0);
    try {
      const [uploaded] = await uploadFiles([file], `logos/${artist_id}/`, (idx, progress) => {
        setUploadProgress(progress);
      });
      setLogo(uploaded.downloadURL);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to upload logo.');
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(0);
    try {
      const [uploaded] = await uploadFiles([file], `profile-pictures/${artist_id}/`, (idx, progress) => {
        setUploadProgress(progress);
      });
      setProfilePicture(uploaded.downloadURL);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to upload profile picture.');
    }
  };

  // ================== 인트로/서브세이브 (예: 임시) ==================
  const handleSave = () => {
    // 기존 isEditing -> catchPhrase 편집모드
    setIsEditing(false);
  };
  const handleSaveIntroduction = () => {
    setIsIntroductionEditing(false);
  };
  const handleCancelIntroduction = () => {
    setIsIntroductionEditing(false);
  };

  // ================== 갤러리 업로드 / 제거 / 드래그 ==================
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'];
    const newImages = [];

    try {
      for (const file of files) {
        const extension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(extension)) {
          alert(`Invalid file type: ${file.name}. Only ${allowedExtensions.join(', ')} are allowed.`);
          continue;
        }
        const [uploadedImage] = await uploadFiles([file], `gallery/${artist_id}/`, (index, progress) => {
          setUploadProgress(progress);
        });
        newImages.push({
          url: uploadedImage.downloadURL,
          name: file.name,
        });
      }
      setGalleryImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error(error);
      alert('Failed to upload images. Please try again.');
    }
  };
  const handleRemoveImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };
  const handleImageDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(galleryImages);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setGalleryImages(items);
  };

  // ================== MemberManager 콜백 ==================
  const handleUpdateMembers = (updatedMembers) => {
    setMembers(updatedMembers);
  };

  // ================== Albums ==================
  const albumFileInputRef = useRef(null);
  const handleAlbumChange = (index, field, value) => {
    setAlbums((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
  const handleRemoveAlbum = (index) => {
    setAlbums((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };
  const handleAlbumDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    setAlbums((prev) => {
      const updated = [...prev];
      const [movedItem] = updated.splice(result.source.index, 1);
      updated.splice(result.destination.index, 0, movedItem);
      return updated;
    });
  };
  const handleToggleAlbumSelection = (index) => {
    setAlbums((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isSelected: !updated[index].isSelected,
      };
      return updated;
    });
  };
  const handleAddAlbum = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'];
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      alert(`Invalid file type: ${file.name}. Only ${allowedExtensions.join(', ')} are allowed.`);
      return;
    }
    setErrorMessage('');
    setUploadProgress(0);
    try {
      const [uploadedImage] = await uploadFiles(
        [file],
        `albums/${artist_id}/`,
        (idx, progress) => setUploadProgress(progress)
      );
      setAlbums((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          album_title: 'New Album',
          img_url: uploadedImage.downloadURL,
          release_date: '',
          isSelected: false,
        },
      ]);
    } catch (error) {
      console.error(error);
      alert('Failed to upload album image. Please try again.');
    }
  };

  // ================== 추가 데이터 로직 ==================
  const loadBasicData = async () => {
    try {
      const artist = await fetchArtist(reportData.melon_artist_id);
      const formattedArtistData = Object.entries(artist).reduce((acc, [key, value]) => {
        acc[key] = {
          value: value !== undefined ? value : '',
          displayKey: key.charAt(0).toUpperCase() + key.slice(1),
          priority: 5,
          visible: true,
        };
        return acc;
      }, {});
      setArtistData(formattedArtistData);
    } catch (error) {
      console.error('Error loading Basic Data: ', error);
    }
  };

  const toggleFieldVisibility = (key) => {
    setArtistData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        visible: !prev[key]?.visible,
      },
    }));
  };

  // ================== 최종 Save ==================
  const handleSaveData = async () => {
    // 한꺼번에 DB 저장
    const dataToSave = {
      catchPhrase,
      subCatchPhrase,
      logo,
      profilePicture,
      introduction,
      galleryImages,
      albums,
      members,
      teamMembers,
      additionalData: artistData,
    };
    console.log('Data to Save: ', dataToSave);
    try {
      await saveData('Introduction', dataToSave, artist_id);
      setToastMessage('Introduction saved successfully!');
    } catch (error) {
      setErrorMessage('Failed to save Introduction. Please try again.');
      console.error(error);
    }
  };

  // ================== 렌더링 ==================
  return (
    <div className="
      introduction-manager
      p-6 space-y-20
      rounded-lg shadow-xl
      text-[rgba(255,255,255,0.9)]
      bg-[rgba(0,0,0,0.6)]
    ">
      {/* 상단 타이틀 + Toast */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Introduction Manager</h1>
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage('')} />
        )}
      </div>

      {/* 에러 메시지 */}
      {errorMessage && (
        <p className="text-[rgba(239,68,68,1)]">
          {errorMessage}
        </p>
      )}

      <div className="sticky top-0 z-10 bg-black border-b border-[rgba(255,255,255,0.2)] flex space-x-2">
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

      <div className="space-y-6 mt-2">
        {/* CatchPhrase / SubCatchPhrase */}
        <section className="p-2 border border-[rgba(255,255,255,0.2)] rounded">
          <h2 className="text-xl font-semibold mb-2">CatchPhrase</h2>
          {isEditing ? (
            <>
              <textarea
                value={catchPhrase[activeLanguage] || ''}
                onChange={(e) => handleCatchPhraseChange(e.target.value)}
                rows={4}
                className="w-full font-main text-4xl text-center text-gradient text-glow p-2 border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] rounded"
                placeholder="Enter a catchy phrase..."
              />
              <div className="mt-2 space-x-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-[rgba(59,130,246,1)] text-[rgba(255,255,255,1)] rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-[rgba(107,114,128,0.4)] text-[rgba(255,255,255,1)] rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div>
              <h1 className="whitespace-pre-wrap text-4xl text-center text-gradient text-glow">
                {safeLangValue(catchPhrase, activeLanguage) || '(No catchphrase)'}
              </h1>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 px-4 py-2 bg-[rgba(107,114,128,0.4)] text-[rgba(255,255,255,1)] rounded"
              >
                Edit
              </button>
            </div>
          )}

          <h3 className="text-lg font-medium mt-4">Sub Catch Phrase</h3>
          <textarea
            value={subCatchPhrase[activeLanguage] || ''}
            onChange={(e) => handleSubCatchPhraseChange(e.target.value)}
            rows={2}
            className="text-center w-full p-2 border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] rounded"
            placeholder="Enter a sub phrase..."
          />
        </section>

        {/* Introduction (TextEditor) */}
        <section className="p-2 border border-[rgba(255,255,255,0.2)] rounded">
          <h2 className="text-xl font-semibold mb-2">Artist Introduction</h2>
          {isIntroductionEditing ? (
            <div>
              <TiptapEditor
                value={introduction[activeLanguage] || ''}
                onChange={(val) => handleIntroductionChange(val)}
              />
              <div className="mt-2 space-x-2">
                <button
                  onClick={handleSaveIntroduction}
                  className="px-4 py-2 bg-[rgba(59,130,246,1)] text-[rgba(255,255,255,1)] rounded"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelIntroduction}
                  className="px-4 py-2 bg-[rgba(107,114,128,0.4)] text-[rgba(255,255,255,1)] rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div
                className="whitespace-pre-wrap mb-2"
                dangerouslySetInnerHTML={{
                  __html: safeLangValue(introduction, activeLanguage) || '(No introduction)',
                }}
              />
              <button
                onClick={() => setIsIntroductionEditing(true)}
                className="px-4 py-2 bg-[rgba(107,114,128,0.4)] text-[rgba(255,255,255,1)] rounded"
              >
                Edit
              </button>
            </div>
          )}
        </section>

        {/* 로고 업로드 */}
        <section className="p-2 border border-[rgba(255,255,255,0.2)] rounded">
          <h2 className="text-lg font-semibold">Upload Logo</h2>
          <input
            type="file"
            accept=".png,.svg,.webp"
            onChange={handleLogoChange}
            className="mt-1"
          />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <p>Uploading... {uploadProgress.toFixed(2)}%</p>
          )}
          {logo && (
            <div className="mt-2">
              <img src={logo} alt="Logo Preview" className="w-32 h-auto" />
            </div>
          )}
        </section>

        {/* 프로필 업로드 */}
        <section className="p-2 border border-[rgba(255,255,255,0.2)] rounded">
          <h2 className="text-lg font-semibold">Upload Profile Picture</h2>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            onChange={handleProfilePictureChange}
            className="mt-1"
          />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <p>Uploading... {uploadProgress.toFixed(2)}%</p>
          )}
          {profilePicture && (
            <div className="mt-2">
              <img 
                src={profilePicture} 
                alt="Profile Preview" 
                className="w-1/2 h-auto" />
            </div>
          )}
        </section>

        {/* 갤러리 */}
        <section className="gallery-section p-2 border border-[rgba(255,255,255,0.2)] rounded">
          <h2 className="text-lg font-semibold">Gallery</h2>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            multiple
            onChange={handleImageUpload}
            className="mt-1"
          />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <p>Uploading... {uploadProgress.toFixed(2)}%</p>
          )}
          <DragDropContext onDragEnd={handleImageDragEnd}>
            <Droppable droppableId="gallery" direction="horizontal">
              {(provided) => (
                <div className="flex space-x-2 mt-2" {...provided.droppableProps} ref={provided.innerRef}>
                  {galleryImages.map((image, index) => (
                    <Draggable key={image.url} draggableId={image.url} index={index}>
                      {(provided) => (
                        <div
                          className="relative"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <img
                            src={image.url}
                            alt={`Gallery ${index + 1}`}
                            className="w-64 h-64 object-cover rounded"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-[rgba(239,68,68,1)] text-white rounded-full w-6 h-6 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </section>

        {/* 멤버 관리 */}
        <section className="member-manager-section p-2 border border-[rgba(255,255,255,0.2)] rounded">
          <h2 className="text-lg font-semibold">Member Management</h2>
          <MemberManager
            members={members}
            onUpdateMembers={handleUpdateMembers}
            artist_id={artist_id}
            activeLanguage={activeLanguage}
          />
        </section>

        {/* 앨범 관리 */}
        <section className="albums-section p-2 border border-[rgba(255,255,255,0.2)] rounded">
          <h2 className="text-lg font-semibold">Albums Management</h2>

          <DragDropContext onDragEnd={handleAlbumDragEnd}>
            <Droppable droppableId="albums-droppable" direction="horizontal">
              {(provided) => (
                <div className="overflow-x-auto mt-2 w-full">
                  {/* 드래그 아이템을 가로로 배치 (flex + space-x-4) */}
                  <div
                    className="flex space-x-4"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {albums.map((album, index) => {
                      const titleObj = convertKor(album.album_title);

                      return (
                        <Draggable
                          key={album.id || index}
                          draggableId={String(album.id || index)}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="
                                border border-[rgba(255,255,255,0.2)]
                                p-2 rounded
                                flex flex-col
                                items-center
                                shrink-0
                                min-w-[160px]
                                bg-[rgba(255,255,255,0.05)]
                              "
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {/* 앨범 이미지 */}
                              {album.img_url ? (
                                <img
                                  src={album.img_url}
                                  alt={
                                    titleObj.ko ||
                                    titleObj.en ||
                                    'New Album'
                                  }
                                  className="w-24 h-24 object-cover rounded"
                                />
                              ) : (
                                <div
                                  className="
                                    w-24 h-24
                                    bg-[rgba(255,255,255,0.1)]
                                    flex items-center justify-center
                                    text-sm text-[rgba(255,255,255,0.7)]
                                    rounded
                                  "
                                >
                                  No Image
                                </div>
                              )}

                              {/* 앨범 기본 정보 */}
                              <h3 className="mt-2 font-semibold text-center text-[rgba(255,255,255,0.9)] text-sm">
                                {titleObj[activeLanguage] || 'New Album'}
                              </h3>
                              <p className="text-xs text-[rgba(255,255,255,0.7)]">
                                {album.release_date || 'Unknown Date'}
                              </p>

                              {/* 편집 영역 (Selected 체크하면 ko/en, date 편집 가능) */}
                              {album.isSelected && (
                                <div className="mt-2 w-full space-y-2 text-sm">
                                  {/* 제목 ko/en */}
                                  <div>
                                    <label className="block text-[rgba(255,255,255,0.8)] text-xs mb-1">
                                      Title (KO):
                                    </label>
                                    <input
                                      type="text"
                                      value={titleObj.ko}
                                      onChange={(e) => {
                                        // setAlbums를 통해 직접 ko/en을 업데이트
                                        const updatedKo = e.target.value;
                                        handleAlbumChange(
                                          index,
                                          'album_title',
                                          {
                                            ...titleObj,
                                            ko: updatedKo,
                                          }
                                        );
                                      }}
                                      className="
                                        block w-full p-1 rounded
                                        border border-[rgba(255,255,255,0.2)]
                                        bg-[rgba(255,255,255,0.05)]
                                        text-[rgba(255,255,255,1)]
                                      "
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[rgba(255,255,255,0.8)] text-xs mb-1">
                                      Title (EN):
                                    </label>
                                    <input
                                      type="text"
                                      value={titleObj.en}
                                      onChange={(e) => {
                                        const updatedEn = e.target.value;
                                        handleAlbumChange(
                                          index,
                                          'album_title',
                                          {
                                            ...titleObj,
                                            en: updatedEn,
                                          }
                                        );
                                      }}
                                      className="
                                        block w-full p-1 rounded
                                        border border-[rgba(255,255,255,0.2)]
                                        bg-[rgba(255,255,255,0.05)]
                                        text-[rgba(255,255,255,1)]
                                      "
                                    />
                                  </div>

                                  {/* 발매일(또는 Date) */}
                                  <div>
                                    <label className="block text-[rgba(255,255,255,0.8)] text-xs mb-1">
                                      Release Date:
                                    </label>
                                    <input
                                      type="text"
                                      value={album.release_date || ''}
                                      onChange={(e) =>
                                        handleAlbumChange(
                                          index,
                                          'release_date',
                                          e.target.value
                                        )
                                      }
                                      className="
                                        block w-full p-1 rounded
                                        border border-[rgba(255,255,255,0.2)]
                                        bg-[rgba(255,255,255,0.05)]
                                        text-[rgba(255,255,255,1)]
                                      "
                                    />
                                  </div>
                                </div>
                              )}

                              {/* 하단 영역: Selected 체크, Remove 버튼 */}
                              <div className="mt-2 flex items-center space-x-2">
                                <label className="flex items-center text-xs">
                                  <input
                                    type="checkbox"
                                    checked={album.isSelected || false}
                                    onChange={() =>
                                      handleToggleAlbumSelection(index)
                                    }
                                    className="mr-1"
                                  />
                                  Selected
                                </label>
                                <button
                                  onClick={() => handleRemoveAlbum(index)}
                                  className="
                                    px-2 py-1
                                    bg-[rgba(239,68,68,1)]
                                    text-white
                                    rounded
                                    text-xs
                                  "
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* 앨범 추가 버튼 */}
          <div className="mt-2">
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleAddAlbum}
              style={{ display: 'none' }}
              ref={albumFileInputRef}
            />
            <button
              onClick={() => albumFileInputRef.current?.click()}
              className="px-4 py-2 bg-[rgba(59,130,246,1)] text-white rounded"
            >
              + Add Album
            </button>
          </div>
        </section>
        
        {/* 팀 멤버 기획사 */}
        <section className="team-members-section p-2 border border-[rgba(255,255,255,0.2)] rounded">
          <h2 className="text-lg font-semibold">
            Company Introduction (Team Member Power)
          </h2>

          {teamMembers.map((member, index) => {
            // 만약 기존에 문자열로 저장돼 있으면 { ko: ..., en: '' }로 변환
            const nameObj = typeof member.name === 'object'
              ? member.name
              : { ko: member.name || '', en: '' };
            const titleObj = typeof member.title === 'object'
              ? member.title
              : { ko: member.title || '', en: '' };
            const expObj = typeof member.experience === 'object'
              ? member.experience
              : { ko: member.experience || '', en: '' };
            const introObj = typeof member.introduction === 'object'
              ? member.introduction
              : { ko: member.introduction || '', en: '' };

            return (
              <div
                key={index}
                className="border border-[rgba(255,255,255,0.2)] p-2 rounded my-2 flex"
              >
                {/* 이미지 업로드 영역 */}
                <div className="mr-4 flex flex-col items-center">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        setUploadProgress(0); // 업로드 진행률도 관리한다면
                        const [uploaded] = await uploadFiles(
                          [file],
                          `team-members/${artist_id}/${index}/`,
                          (idx, progress) => {
                            setUploadProgress(progress);
                          }
                        );
                        // 이미지 URL 갱신
                        const updated = [...teamMembers];
                        updated[index] = {
                          ...updated[index],
                          image: uploaded.downloadURL,
                        };
                        setTeamMembers(updated);
                      } catch (error) {
                        console.error(error);
                        setErrorMessage('Failed to upload team member image.');
                      }
                    }}
                    className="mb-2"
                  />
                  {member.image && (
                    <img
                      src={member.image}
                      alt={`Team Member ${index + 1}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                </div>

                {/* 텍스트 입력 영역 */}
                <div className="flex-1 space-y-2">
                  {/* Name (ko/en) */}
                  <div>
                    <label className="text-sm block mb-1">
                      Name ({activeLanguage})
                    </label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={nameObj[activeLanguage] || ''}
                      onChange={(e) => {
                        const updatedValue = e.target.value;
                        const updated = [...teamMembers];
                        updated[index] = {
                          ...updated[index],
                          name: {
                            ...nameObj,
                            [activeLanguage]: updatedValue,
                          },
                        };
                        setTeamMembers(updated);
                      }}
                      className="w-full p-1 rounded border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)]"
                    />
                  </div>

                  {/* Title (ko/en) */}
                  <div>
                    <label className="text-sm block mb-1">
                      Title ({activeLanguage})
                    </label>
                    <input
                      type="text"
                      placeholder="Title"
                      value={titleObj[activeLanguage] || ''}
                      onChange={(e) => {
                        const updatedValue = e.target.value;
                        const updated = [...teamMembers];
                        updated[index] = {
                          ...updated[index],
                          title: {
                            ...titleObj,
                            [activeLanguage]: updatedValue,
                          },
                        };
                        setTeamMembers(updated);
                      }}
                      className="w-full p-1 rounded border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)]"
                    />
                  </div>

                  {/* Experience (ko/en) - textarea */}
                  <div>
                    <label className="text-sm block mb-1">
                      Experience ({activeLanguage})
                    </label>
                    <textarea
                      placeholder="Experience"
                      value={expObj[activeLanguage] || ''}
                      onChange={(e) => {
                        const updatedValue = e.target.value;
                        const updated = [...teamMembers];
                        updated[index] = {
                          ...updated[index],
                          experience: {
                            ...expObj,
                            [activeLanguage]: updatedValue,
                          },
                        };
                        setTeamMembers(updated);
                      }}
                      rows={3}
                      className="w-full p-1 rounded border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)]"
                    />
                  </div>

                  {/* Introduction (ko/en) - textarea */}
                  <div>
                    <label className="text-sm block mb-1">
                      Introduction ({activeLanguage})
                    </label>
                    <textarea
                      placeholder="Introduction"
                      value={introObj[activeLanguage] || ''}
                      onChange={(e) => {
                        const updatedValue = e.target.value;
                        const updated = [...teamMembers];
                        updated[index] = {
                          ...updated[index],
                          introduction: {
                            ...introObj,
                            [activeLanguage]: updatedValue,
                          },
                        };
                        setTeamMembers(updated);
                      }}
                      rows={4}
                      className="w-full p-1 rounded border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)]"
                    />
                  </div>

                  {/* Remove 버튼 */}
                  <button
                    onClick={() => {
                      const updated = teamMembers.filter((_, i) => i !== index);
                      setTeamMembers(updated);
                    }}
                    className="px-3 py-1 bg-[rgba(239,68,68,1)] text-white rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          {/* 팀 멤버 추가 */}
          <button
            onClick={() => {
              setTeamMembers([
                ...teamMembers,
                {
                  image: null,
                  // 여기서부터 다국어 형태로 초기화
                  name: { ko: '', en: '' },
                  title: { ko: '', en: '' },
                  experience: { ko: '', en: '' },
                  introduction: { ko: '', en: '' },
                },
              ]);
            }}
            className="px-4 py-2 bg-[rgba(59,130,246,1)] text-white rounded"
          >
            Add Team Member
          </button>
        </section>

        {/* ArtistData 공개 필드 설정 */}
        <section className="field-selection p-2 border border-[rgba(255,255,255,0.2)] rounded">
          <h2 className="text-lg font-semibold">공개할 데이터 선택</h2>

          {/*
            1) visible / invisible 배열로 분리
          */}
          {(() => {
            const visibleEntries = [];
            const invisibleEntries = [];

            Object.entries(artistData).forEach(([key, data]) => {
              if (data.visible) {
                visibleEntries.push([key, data]);
              } else {
                invisibleEntries.push([key, data]);
              }
            });

            // 항목 렌더링 함수
            const renderDataItem = (key, data) => {
              // displayKey, value가 문자열이면 { ko:'...', en:'' }로 변환 (convertKor)
              const displayKeyObj = convertKor(data.displayKey);
              const valueObj = convertKor(data.value);

              return (
                <div key={key} className="border-b border-[rgba(255,255,255,0.2)] py-2">
                  {/* visible 체크 */}
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.visible || false}
                      onChange={() => {
                        setArtistData((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            visible: !prev[key].visible,
                          },
                        }));
                      }}
                    />
                    <span className="font-semibold">
                      {displayKeyObj[activeLanguage] ||
                        displayKeyObj.ko ||
                        displayKeyObj.en ||
                        key}
                      :
                    </span>
                  </label>

                  {/* Display Key (다국어) */}
                  <div className="mt-2">
                    <label className="text-sm block mb-1">
                      Display Key ({activeLanguage})
                    </label>
                    <input
                      type="text"
                      placeholder="Enter display key"
                      value={displayKeyObj[activeLanguage] || ''}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        setArtistData((prev) => {
                          const updated = { ...prev };
                          updated[key] = {
                            ...updated[key],
                            displayKey: {
                              ...displayKeyObj,
                              [activeLanguage]: newVal,
                            },
                          };
                          return updated;
                        });
                      }}
                      className="
                        w-full p-1 rounded
                        border border-[rgba(255,255,255,0.2)]
                        bg-[rgba(255,255,255,0.05)]
                      "
                    />
                  </div>

                  {/* Value (다국어) */}
                  <div className="mt-2">
                    <label className="text-sm block mb-1">
                      Value ({activeLanguage})
                    </label>
                    <textarea
                      placeholder="Enter value"
                      value={valueObj[activeLanguage] || ''}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        setArtistData((prev) => {
                          const updated = { ...prev };
                          updated[key] = {
                            ...updated[key],
                            value: {
                              ...valueObj,
                              [activeLanguage]: newVal,
                            },
                          };
                          return updated;
                        });
                      }}
                      className="
                        w-full p-1 rounded
                        border border-[rgba(255,255,255,0.2)]
                        bg-[rgba(255,255,255,0.05)]
                      "
                      rows={3}
                    />
                  </div>

                  {/* Priority */}
                  <div className="mt-2 flex items-center space-x-2 w-20">
                    <label className="text-sm">Priority:</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={data.priority || 5}
                      onChange={(e) =>
                        setArtistData((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            priority: Number(e.target.value),
                          },
                        }))
                      }
                      className="flex-1"
                    />
                    <span>{data.priority || 5}</span>
                  </div>
                </div>
              );
            };

            return (
              <div className="flex space-x-4 mt-4">

                {/* 왼쪽: visible */}
                <div className="w-1/2">
                  <h3 className="font-semibold mb-2 text-[rgba(255,255,255,0.9)]">
                    {activeLanguage === 'ko' ? '공개 항목' : 'Visible Fields'}
                  </h3>
                  {visibleEntries.length === 0 && (
                    <p className="text-xs text-gray-300">(No visible data)</p>
                  )}
                  {visibleEntries
                    .sort((a, b) => b[1].priority - a[1].priority)
                    .map(([key, data]) => renderDataItem(key, data))
                  }
                </div>

                {/* 오른쪽: invisible */}
                <div className="w-1/2">
                  <h3 className="font-semibold mb-2 text-[rgba(255,255,255,0.9)]">
                    {activeLanguage === 'ko' ? '비공개 항목' : 'Invisible Fields'}
                  </h3>
                  {invisibleEntries.length === 0 && (
                    <p className="text-xs text-gray-300">(No hidden data)</p>
                  )}
                  {invisibleEntries
                    .sort((a, b) => b[1].priority - a[1].priority)
                    .map(([key, data]) => renderDataItem(key, data))
                  }
                </div>

                
              </div>
            );
          })()}

          {/* 새 데이터 추가 */}
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold">
              {activeLanguage === 'ko' ? '새 데이터 추가' : 'Add New Data'}
            </h3>
            <input
              type="text"
              placeholder={
                activeLanguage === 'ko' ? 'Key를 입력하세요' : 'Enter key'
              }
              value={newDataKey}
              onChange={(e) => setNewDataKey(e.target.value)}
              className="
                w-full p-1 rounded
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
              "
            />
            <textarea
              placeholder={
                activeLanguage === 'ko'
                  ? 'Value를 입력하세요 (ex. 텍스트, JSON 등)'
                  : 'Enter value (e.g., text, array, or JSON)'
              }
              value={newDataValue}
              onChange={(e) => setNewDataValue(e.target.value)}
              className="
                w-full p-1 rounded
                border border-[rgba(255,255,255,0.2)]
                bg-[rgba(255,255,255,0.05)]
              "
              rows={3}
            />
            <button
              onClick={() => {
                if (!newDataKey.trim()) {
                  alert(
                    activeLanguage === 'ko'
                      ? 'Key를 입력해주세요.'
                      : 'Please enter a key.'
                  );
                  return;
                }
                // 새로 추가할 때부터 다국어 구조
                const newValObj = { ko: newDataValue, en: '' };
                const newDisplayKeyObj = { ko: newDataKey, en: '' };

                setArtistData((prev) => ({
                  ...prev,
                  [newDataKey]: {
                    displayKey: newDisplayKeyObj,
                    value: newValObj,
                    priority: 5,
                    visible: false, // 새로 추가 시 기본값은 비공개 etc.
                  },
                }));
                setNewDataKey('');
                setNewDataValue('');
              }}
              className="px-4 py-2 bg-[rgba(59,130,246,1)] text-white rounded"
            >
              {activeLanguage === 'ko' ? 'Add Data' : 'Add Data'}
            </button>
          </div>
        </section>

        {/* Save All */}
        <div className="fixed bottom-4 right-4 save-all-section mt-6 flex justify-end">
          <button onClick={handleSaveData} className="px-4 py-2 bg-[rgba(59,130,246,1)] text-white rounded">
            {activeLanguage === 'ko' ? 'Firestore에 저장하기' : 'Save to Firestore'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroductionManager;