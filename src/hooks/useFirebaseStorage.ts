import { useState } from 'react';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata
} from 'firebase/storage';
import { storage } from '../config/firebase';

export const useFirebaseStorage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload file
  const uploadFile = async (file: File, path: string, metadata?: any) => {
    try {
      setError(null);
      setLoading(true);
      setUploadProgress(0);
      
      const storageRef = ref(storage, path);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file, metadata);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setUploadProgress(100);
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Upload multiple files
  const uploadMultipleFiles = async (files: File[], basePath: string, metadata?: any) => {
    try {
      setError(null);
      setLoading(true);
      setUploadProgress(0);
      
      const uploadPromises = files.map(async (file, index) => {
        const filePath = `${basePath}/${Date.now()}_${file.name}`;
        const result = await uploadFile(file, filePath, metadata);
        
        // Update progress
        const progress = ((index + 1) / files.length) * 100;
        setUploadProgress(progress);
        
        return result;
      });
      
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Delete file
  const deleteFile = async (path: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get file metadata
  const getFileMetadata = async (path: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const fileRef = ref(storage, path);
      const metadata = await getMetadata(fileRef);
      
      return metadata;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // List files in a directory
  const listFiles = async (path: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const listRef = ref(storage, path);
      const result = await listAll(listRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const metadata = await getMetadata(itemRef);
          const url = await getDownloadURL(itemRef);
          
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            url,
            size: metadata.size,
            type: metadata.contentType,
            createdAt: metadata.timeCreated,
            updatedAt: metadata.updated
          };
        })
      );
      
      return files;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get download URL
  const getFileURL = async (path: string) => {
    try {
      setError(null);
      
      const fileRef = ref(storage, path);
      const url = await getDownloadURL(fileRef);
      
      return url;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Helper function to generate unique file path
  const generateUniquePath = (fileName: string, basePath: string = 'uploads') => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.replace(`.${extension}`, '');
    
    return `${basePath}/${timestamp}_${randomId}_${nameWithoutExt}.${extension}`;
  };

  return {
    loading,
    error,
    uploadProgress,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    getFileMetadata,
    listFiles,
    getFileURL,
    generateUniquePath
  };
};

