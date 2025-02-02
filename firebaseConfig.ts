import firestore from '@react-native-firebase/firestore';

// Get user language preference from Firestore
export const getUserLanguage = async (userId: string): Promise<string> => {
  try {
    const doc = await firestore().collection('users').doc(userId).get();
    return doc.exists ? doc.data()?.language : 'en'; // Default to English
  } catch (error) {
    console.error('Error fetching language:', error);
    return 'en';
  }
};

// Update user language preference in Firestore
export const updateUserLanguage = async (userId: string, language: string) => {
  try {
    await firestore().collection('users').doc(userId).set({ language }, { merge: true });
  } catch (error) {
    console.error('Error updating language:', error);
  }
};
