import { db } from './firebase';
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
    updateDoc
} from 'firebase/firestore';
import { serializeFirestoreData } from './serialize';

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

export async function fetchInvestmentPoints(artistId = 'knk_20160303', type = 'All') {
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
        console.error('Error fetching valuation data:', error);
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