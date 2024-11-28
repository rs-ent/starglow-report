import { db, storage } from './firebase';
import { 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc,
    deleteDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { serializeFirestoreData } from './serialize';

/**
 * Firestore에서 데이터를 조건(query)에 따라 가져옵니다.
 *
 * @param {string} collectionName - Firestore 컬렉션 이름
 * @param {Object|null} query - 데이터를 필터링할 조건 객체. `null`을 전달하면 모든 데이터를 가져옵니다.
 * @param {string} query.comp - 조건을 적용할 필드 이름
 * @param {string} query.sign - Firestore 비교 연산자 (예: '==', '<', '>', '!=' 등)
 * @param {*} query.val - 비교할 값
 * @param {boolean} [fetchMultiples=false] - 여러 문서를 가져올지 여부. `true`이면 모든 문서를, `false`이면 첫 번째 문서만 반환합니다.
 * @returns {Promise<Object|Object[]>} - 단일 문서 객체(기본값) 또는 문서 배열
 *
 * @example
 * // 조건에 맞는 단일 문서 가져오기
 * const result = await fetchDataWithQuery('artists', {
 *   comparingField: 'genre',
 *   opStr: '==',
 *   targetValue: 'K-pop'
 * });
 * console.log(result);
 *
 * @example
 * // 조건 없이 컬렉션의 모든 문서 가져오기
 * const allData = await fetchDataWithQuery('artists', null, true);
 * console.log(allData);
 */
export async function fetchData(
    collectionName,
    queryObj = { comp: '', sign: '==', val: '' }, // 기본값 설정
    fetchMultiples = false
  ) {
    try {
      // 문서 ID로 직접 조회
      if (queryObj?.comp === 'docId' && queryObj.val) {
        const docId = queryObj.val;
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
  
        if (!docSnap.exists()) {
          console.warn(`Document with ID '${docId}' not found.`);
          return null;
        }
  
        // 단일 문서 데이터 반환
        const data = { id: docSnap.id, ...docSnap.data() };
        return serializeFirestoreData(data); // 데이터 직렬화
      }
  
      // Firestore 컬렉션 참조 생성
      const collectionRef = collection(db, collectionName);
  
      // 쿼리 조건 적용
      let firestoreQuery = collectionRef;
      if (queryObj?.comp && queryObj?.sign && queryObj?.val) {
        firestoreQuery = query(collectionRef, where(queryObj.comp, queryObj.sign, queryObj.val));
      }
  
      // Firestore 쿼리 실행
      const querySnapshot = await getDocs(firestoreQuery);
  
      if (querySnapshot.empty) {
        console.warn('No documents found matching the query.');
        return fetchMultiples ? [] : null;
      }
  
      // 결과 데이터를 매핑
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // 다중/단일 결과 반환 처리
      return fetchMultiples
        ? serializeFirestoreData(data) // 다중 문서 직렬화
        : serializeFirestoreData(data[0]); // 첫 번째 문서만 직렬화
    } catch (error) {
      console.error(
        `Error fetching data from collection '${collectionName}' ${
          queryObj?.comp ? `with query (${queryObj.comp} ${queryObj.sign} ${queryObj.val})` : 'without specific query'
        }:`,
        error
      );
      return fetchMultiples ? [] : null;
    }
}

/**
 * Firestore에서 데이터를 저장하거나 업데이트합니다.
 * 데이터 저장 시 `created_at`과 `updated_at` 필드를 서버 타임스탬프로 자동 추가/업데이트합니다.
 *
 * @param {string} collectionName - Firestore 컬렉션 이름
 * @param {Object} data - 저장하거나 업데이트할 데이터 객체
 * @param {string|null} [docId=null] - 업데이트할 문서 ID. 없으면 새 문서를 생성합니다.
 * @returns {Promise<string>} - 성공 시 문서 ID 반환
 *
 * @example
 * // 새 데이터를 추가
 * const docId = await saveDataWithQuery('artists', { name: 'New Artist', genre: 'Pop' });
 * console.log('Added document ID:', docId);
 *
 * @example
 * // 기존 문서를 업데이트
 * const updatedDocId = await saveDataWithQuery('artists', { genre: 'Rock' }, 'existingDocId');
 * console.log('Updated document ID:', updatedDocId);
 */
export async function saveData(collectionName, data, docId = null) {
    try {
        if (!collectionName || !data) {
            throw new Error('Collection name and data are required.');
        }

        const collectionRef = collection(db, collectionName);

        if (docId) {
            // 기존 문서 업데이트 또는 덮어쓰기
            const docRef = doc(collectionRef, docId);
            await setDoc(docRef, { 
                ...data, 
                updated_at: serverTimestamp() // 업데이트 시간 추가
            }, { merge: true }); // 병합 옵션 사용
            console.log(`Document updated with ID: ${docId}`);
            return docId;
        } else {
            // 새 문서 추가
            const docRef = await addDoc(collectionRef, { 
                ...data, 
                created_at: serverTimestamp(), // 생성 시간 추가
                updated_at: serverTimestamp() // 업데이트 시간 추가
            });
            console.log(`New document added with ID: ${docRef.id}`);
            return docRef.id;
        }
    } catch (error) {
        console.error('Error saving data:', error);
        throw error; // 오류 발생 시 호출한 함수로 다시 던짐
    }
}

/**
 * Firestore에서 조건에 맞는 문서를 삭제합니다.
 *
 * @param {string} collectionName - Firestore 컬렉션 이름
 * @param {Object} query - 삭제 조건 (필드, 연산자, 값)
 * @param {string} query.comparingField - 조건 필드
 * @param {string} query.opStr - 조건 연산자
 * @param {*} query.targetValue - 조건 값
 * @returns {Promise<number>} - 삭제된 문서 수 반환
 *
 * @example
 * // 특정 필드 조건에 맞는 문서 삭제
 * const deletedCount = await deleteDataWithQuery('artists', {
 *   comparingField: 'genre',
 *   opStr: '==',
 *   targetValue: 'K-pop'
 * });
 * console.log(`${deletedCount} documents deleted.`);
 
export async function deleteData(collectionName, queryObj) {
    const { comparingField, opStr, targetValue } = queryObj;
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where(comparingField, opStr, targetValue));

    try {
        const querySnapshot = await getDocs(q); // 조건에 맞는 문서 검색
        const batchDelete = querySnapshot.docs.map(async (docSnapshot) => {
            const docRef = doc(db, collectionName, docSnapshot.id);
            await deleteDoc(docRef); // 문서 삭제
        });

        await Promise.all(batchDelete); // 병렬로 삭제 수행
        console.log(`${querySnapshot.size} documents deleted from ${collectionName}.`);
        return querySnapshot.size; // 삭제된 문서 수 반환
    } catch (error) {
        console.error(`Error deleting documents from ${collectionName}:`, error);
        throw error;
    }
}*/

export async function fetchReports() {
    try {
        // Report 컬렉션의 참조 가져오기
        const collectionRef = collection(db, 'Report');
        
        // 컬렉션의 모든 문서 가져오기
        const querySnapshot = await getDocs(collectionRef);

        // 가져온 문서를 배열로 변환
        const reports = querySnapshot.docs.map(doc => ({
            id: doc.id, // 문서 ID 추가
            ...doc.data() // 문서 데이터 포함
        }));

        return reports; // 결과 반환
    } catch (error) {
        console.error('Error fetching reports:', error);
        return []; // 오류 발생 시 빈 배열 반환
    }
}

export async function fetchArtist(melon_artist_id) {
    const docRef = doc(db, 'artists', melon_artist_id);
    
    try {
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.error('No such document!');
            return null;
        }

        const data = { id: docSnap.id, ...docSnap.data() };
        return serializeFirestoreData(data);
    } catch (error) {
        console.error('Error fetching valuation data:', error);
        return null;
    }
}


export async function fetchValuation(docId = 'knk_20160303') {
    const docRef = doc(db, 'valuation', docId);
    
    try {
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.error('No such document!');
            return null;
        }

        const data = { id: docSnap.id, ...docSnap.data() };
        return serializeFirestoreData(data);
    } catch (error) {
        console.error('Error fetching valuation data:', error);
        return null;
    }
}

export async function fetchInvestmentPoints(artistId, type = 'All') {
    const collectionRef = collection(db, 'InvestmentPoint');
    let q;

    // type에 따라 쿼리 조건 설정
    if (type === 'Investment Point') {
        q = query(collectionRef, where('artist_id', '==', artistId), where('type', '==', 'Investment Point'));
    } else if (type === 'Risk') {
        q = query(collectionRef, where('artist_id', '==', artistId), where('type', '==', 'Risk'));
    } else {
        q = query(collectionRef, where('artist_id', '==', artistId));
    }

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return data;
    } catch (error) {
        console.error('Error fetching InvestmentPoint data:', error);
        return [];
    }
}

export async function addInvestmentPoint(data, artistId = "knk_20160303") {
    try {
        data['artist_id'] = artistId;

        if (data.id) {
            // 이미 존재하는 데이터라면 업데이트
            const docRef = doc(db, 'InvestmentPoint', data.id);
            await setDoc(docRef, { ...data }, { merge: true }); // 병합 업데이트
            console.log('Document updated with ID:', docRef.id);
            return docRef.id;
        } else {
            // 새 데이터를 추가
            const docRef = await addDoc(collection(db, 'InvestmentPoint'), data);
            console.log('Document written with ID:', docRef.id);
            return docRef.id;
        }
    } catch (error) {
        console.error('Error adding/updating document:', error);
        throw error;
    }
}

export async function deleteData(id, collection) {
    try {
        if (!id || !collection) {
            throw new Error('Document ID and collection name are required.');
        }

        const docRef = doc(db, collection, id);
        await deleteDoc(docRef);

        console.log(`Document with ID ${id} successfully deleted from ${collection}.`);
    } catch (error) {
        console.error(`Error deleting document from ${collection}:`, error);
        throw error; // 호출한 코드가 오류를 처리할 수 있도록 다시 던짐
    }
}

export async function updateData(id, collection, data) {
    try {
        console.log(id, collection, data);
        const origin = doc(db, collection, id);
        await updateDoc(origin, data);
        console.log('Document updated successfully');
    } catch (error) {
        console.error('Error updating document:', error);
        throw error; // 필요에 따라 에러를 다시 던질 수도 있음
    }
}

export async function fetchMilestones(docId) {
    const docRef = doc(db, 'Milestones', docId);
    
    try {
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.log('No such document!');
            return null;
        }

        const data = { id: docSnap.id, ...docSnap.data() };
        return serializeFirestoreData(data);
    } catch (error) {
        console.error('Error fetching Milestone data:', error);
        return null;
    }
}

export async function addMilestones(data, artistId = "knk_20160303") {
    try {
        data['artist_id'] = artistId;

        // artistId를 docId로 사용
        const docRef = doc(db, 'Milestones', artistId);
        await setDoc(docRef, { ...data }, { merge: true }); // 병합 업데이트
        console.log('Document updated/added with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error adding/updating milestones:', error);
        throw error;
    }
}

export const uploadFiles = (files, path = "uploads/", onProgress) => {
    if (!Array.isArray(files) || files.length === 0) {
      return Promise.reject(new Error("No files provided for upload."));
    }
  
    const uploadPromises = files.map((file, index) => {
      return new Promise((resolve, reject) => {
        const sanitizedPath = path.endsWith("/") ? path : `${path}/`;
        const uniqueName = `${uuidv4()}_${file.name}`;
        const fileRef = ref(storage, `${sanitizedPath}${uniqueName}`);
        const uploadTask = uploadBytesResumable(fileRef, file);
  
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(index, progress); // 파일별 진행률 콜백 호출
          },
          (error) => {
            console.error("Upload failed for file:", file.name, error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log(`File available at: ${downloadURL}`);
              resolve({ fileName: file.name, downloadURL });
            } catch (error) {
              console.error("Error getting download URL for file:", file.name, error);
              reject(error);
            }
          }
        );
      });
    });
  
    return Promise.all(uploadPromises);
};
  
  // 파일 다운로드 URL 가져오기 함수
  export const getFileDownloadURL = async (filePath) => {
    try {
      const fileRef = ref(storage, filePath);
      const downloadURL = await getDownloadURL(fileRef);
      console.log("Download URL:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error getting file download URL:", error);
      throw error;
    }
  };
  
  // 파일 삭제 함수
  export const deleteFile = async (filePath) => {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      console.log("File deleted successfully.");
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
};