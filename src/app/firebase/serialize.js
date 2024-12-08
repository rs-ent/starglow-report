export function serializeFirestoreData(data) {
    // Early return for null or undefined
    if (data == null) return data;

    // If data is an array, map over it and serialize each item
    if (Array.isArray(data)) {
        return data.map(serializeFirestoreData);
    }

    // If data is an object
    if (typeof data === 'object') {
        // 먼저 Firestore Timestamp-like 객체인지 확인
        if ('seconds' in data && 'nanoseconds' in data && typeof data.seconds === 'number' && typeof data.nanoseconds === 'number') {
            // {seconds, nanoseconds} 형태를 Date로 변환
            const millis = data.seconds * 1000 + data.nanoseconds / 1000000;
            const date = new Date(millis);
            return date.toISOString();
        }

        const serialized = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];

                // 특정 필드(created_at, updated_at) 처리
                if ((key === 'created_at' || key === 'updated_at') && value && typeof value.toDate === 'function') {
                    // Timestamp → ISO 문자열로 변환
                    serialized[key] = value.toDate().toISOString();
                } else {
                    // 나머지 필드는 재귀적으로 처리
                    serialized[key] = serializeFirestoreData(value);
                }
            }
        }
        return serialized;
    }

    // Primitive values return as is
    return data;
}