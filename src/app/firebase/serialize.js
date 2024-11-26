export function serializeFirestoreData(data) {
    // Early return for null or undefined
    if (data == null) return data;

    // Handle Firestore Timestamp
    if (typeof data.toDate === 'function') {
        return data.toDate().toISOString();
    }

    // If data is an array, map over it and serialize each item
    if (Array.isArray(data)) {
        return data.map(serializeFirestoreData);
    }

    // If data is an object, create a new object to hold serialized properties
    if (typeof data === 'object') {
        const serialized = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                // Serialize each property
                serialized[key] = serializeFirestoreData(data[key]);
            }
        }
        return serialized;
    }

    // Return primitive values as is
    return data;
  }