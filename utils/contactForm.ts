// Contact Form Firebase Integration
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export interface ContactFormData {
  name: string;
  email: string;
  inquiryType: string;
  message: string;
}

/**
 * Save contact form submission to Firestore
 * @param formData - The contact form data
 * @returns Promise that resolves with the document ID on success
 */
export const saveContactMessage = async (formData: ContactFormData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "contactMessages"), {
      ...formData,
      timestamp: serverTimestamp(),
      status: "new", // Can be: new, read, replied
      createdAt: new Date().toISOString(),
    });
    
    console.log("Contact message saved with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving contact message: ", error);
    throw error;
  }
};
