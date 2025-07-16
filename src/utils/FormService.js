import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export class FormService {
  static async saveForme(userId, formData) {
    try {
      const docRef = await addDoc(collection(db, 'forms'), {
        ...formData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving form:', error);
      throw error;
    }
  }

  static async getUserForms(userId) {
    try {
      const q = query(
        collection(db, 'forms'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting forms:', error);
      throw error;
    }
  }

  static async updateForm(formId, formData) {
    try {
      const formRef = doc(db, 'forms', formId);
      await updateDoc(formRef, {
        ...formData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating form:', error);
      throw error;
    }
  }

  static async deleteForm(formId) {
    try {
      await deleteDoc(doc(db, 'forms', formId));
    } catch (error) {
      console.error('Error deleting form:', error);
      throw error;
    }
  }

  static async saveFormSubmission(formId, submissionData) {
    try {
      const docRef = await addDoc(collection(db, 'submissions'), {
        formId,
        data: submissionData,
        submittedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving submission:', error);
      throw error;
    }
  }

  static async getFormSubmissions(formId) {
    try {
      const q = query(
        collection(db, 'submissions'),
        where('formId', '==', formId),
        orderBy('submittedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting submissions:', error);
      throw error;
    }
  }
}