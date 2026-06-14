import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const getAdminDb = () => {
    if (!getApps().length) {
        try {
            const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            const configObj = require('../firebase-applet-config.json');
            
            if (serviceAccountJson) {
                const serviceAccount = JSON.parse(serviceAccountJson);
                initializeApp({
                    credential: cert(serviceAccount),
                    projectId: configObj.projectId,
                });
            } else {
                console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is missing.");
            }
        } catch (error) {
            console.error('Firebase admin initialization error', error);
        }
    }
    
    // Attempt to get the database by ID if provided
    const configObj = require('../firebase-applet-config.json');
    if (configObj.firestoreDatabaseId && configObj.firestoreDatabaseId !== "(default)") {
        try {
            return getFirestore(configObj.firestoreDatabaseId); // V12 supports string ID
        } catch(e) {
            return getFirestore();
        }
    }
    return getFirestore();
};
