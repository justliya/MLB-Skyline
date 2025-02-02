import translate from 'google-translate-api-x';

// Batch translate multiple messages
export const translateMessages = async (messages: string[], targetLanguage: string): Promise<string[]> => {
  try {
    const translations = await Promise.all(
      messages.map((msg) => translate(msg, { to: targetLanguage }))
    );
    return translations.map((t) => t.text);
  } catch (error) {
    console.error('Batch Translation Error:', error);
    return messages; // Return original messages if translation fails
  }
};
