import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  writeBatch,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Verificar se o Firebase está configurado
console.log('🔥 Firebase configurado:', {
  db: !!db,
  collection: !!collection,
  addDoc: !!addDoc
});

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generic CRUD operations
  const createDocument = async (collectionName: string, data: any) => {
    try {
      console.log('🔥 createDocument chamado!');
      console.log('📁 Collection:', collectionName);
      console.log('📝 Data:', data);
      
      setError(null);
      setLoading(true);
      
      // Add timestamps
      const documentData = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      console.log('📤 Enviando para Firebase...', documentData);
      const docRef = await addDoc(collection(db, collectionName), documentData);
      console.log('✅ Documento criado! ID:', docRef.id);
      
      const result = { id: docRef.id, ...documentData };
      console.log('🔄 Retornando:', result);
      return result;
    } catch (err: any) {
      console.error('❌ Erro no createDocument:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocument = async (collectionName: string, documentId: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (collectionName: string, documentId: string, data: any) => {
    try {
      setError(null);
      setLoading(true);
      
      const docRef = doc(db, collectionName, documentId);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, updateData);
      return { id: documentId, ...updateData };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (collectionName: string, documentId: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocuments = async (collectionName: string, constraints: QueryConstraint[] = []) => {
    try {
      setError(null);
      setLoading(true);
      
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const documents: any[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return documents;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener
  const subscribeToCollection = (collectionName: string, callback: (docs: any[]) => void, constraints: QueryConstraint[] = []) => {
    const q = query(collection(db, collectionName), ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      const documents: any[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      callback(documents);
    });
  };

  // Batch operations
  const batchWrite = async (operations: Array<{ type: 'create' | 'update' | 'delete', collection: string, doc?: string, data?: any }>) => {
    try {
      setError(null);
      setLoading(true);
      
      const batch = writeBatch(db);
      
      operations.forEach((op) => {
        if (op.type === 'create') {
          const docRef = doc(collection(db, op.collection));
          batch.set(docRef, {
            ...op.data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        } else if (op.type === 'update' && op.doc) {
          const docRef = doc(db, op.collection, op.doc);
          batch.update(docRef, {
            ...op.data,
            updatedAt: Timestamp.now()
          });
        } else if (op.type === 'delete' && op.doc) {
          const docRef = doc(db, op.collection, op.doc);
          batch.delete(docRef);
        }
      });
      
      await batch.commit();
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for common queries
  const whereQuery = (field: string, operator: any, value: any) => where(field, operator, value);
  const orderByQuery = (field: string, direction: 'asc' | 'desc' = 'asc') => orderBy(field, direction);
  const limitQuery = (count: number) => limit(count);

  return {
    loading,
    error,
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    getDocuments,
    subscribeToCollection,
    batchWrite,
    whereQuery,
    orderByQuery,
    limitQuery
  };
};
