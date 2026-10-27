import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Lead } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with configured databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Test Connection on Boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch {
    return false;
  }
}

// Sign in with Google Popup
export async function signInWithGoogle(): Promise<User | null> {
  try {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      // Sync user profile
      const userRef = doc(db, 'users', result.user.uid);
      try {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || 'VIP Client',
          photoURL: result.user.photoURL || '',
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${result.user.uid}`);
      }
    }
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

// Sign out
export async function logOut(): Promise<void> {
  await signOut(auth);
}

// Save or sync Lead to Firestore
export async function syncLeadToFirestore(lead: Lead): Promise<void> {
  const path = `leads/${lead.id}`;
  try {
    const leadRef = doc(db, 'leads', lead.id);
    await setDoc(leadRef, {
      id: lead.id,
      clientName: lead.clientName || 'Valued Client',
      clientPhone: lead.clientPhone || '',
      carModel: `${lead.carBrand || ''} ${lead.carModel || ''}`.trim() || 'Custom Vehicle',
      carYear: lead.carYear || '2024+',
      carColor: lead.carColor || 'Factory Finish',
      damageSeverity: lead.requestType || 'DIAGNOSIS',
      selectedCarParts: lead.selectedCarParts || [],
      estimatedCostRange: lead.estimatedQuote || '',
      servicePillar: lead.requestType,
      notes: lead.notes || '',
      timeSlot: lead.timeSlot || 'Early Bird Studio Slot',
      status: lead.status || 'NEW LIVE',
      userId: auth.currentUser?.uid || null,
      userEmail: auth.currentUser?.email || null,
      createdAt: new Date(lead.createdAt || Date.now()).toISOString(),
      updatedServerAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch leads from Firestore
export async function fetchFirestoreLeads(): Promise<Lead[]> {
  const currentUser = auth.currentUser;
  // If not signed in, rely on local storage to prevent permission errors
  if (!currentUser) {
    return [];
  }

  const path = 'leads';
  try {
    const isAdmin = currentUser.email === 'mr.alfyz@gmail.com';
    let q;
    if (isAdmin) {
      q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(50));
    } else {
      q = query(collection(db, path), where('userId', '==', currentUser.uid), limit(50));
    }

    const snapshot = await getDocs(q);
    const leads: Lead[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      leads.push({
        id: data.id || d.id,
        requestType: data.servicePillar || 'SCRATCH_DIAGNOSIS',
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        carBrand: data.carModel?.split(' ')?.[0] || 'Vehicle',
        carModel: data.carModel,
        carColor: data.carColor,
        carYear: data.carYear,
        selectedCarParts: data.selectedCarParts || [],
        zone: 'Dr. Care Centre Studio Bay',
        estimatedQuote: data.estimatedCostRange,
        notes: data.notes,
        media: [],
        status: data.status || 'NEW LIVE',
        timeSlot: data.timeSlot,
        createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
      });
    });
    return leads;
  } catch (error) {
    console.warn('Silent fallback for Firestore query:', error);
    return [];
  }
}
