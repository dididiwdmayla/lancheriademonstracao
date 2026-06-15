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
    
    const configObj = require('../firebase-applet-config.json');
    const app = getApps()[0];
    
    if (configObj.firestoreDatabaseId && configObj.firestoreDatabaseId !== "(default)") {
        try {
            return getFirestore(app, configObj.firestoreDatabaseId);
        } catch(e) {
            console.error('Error getting named firestore, falling back to default', e);
            return getFirestore(app);
        }
    }
    return getFirestore(app);
};
