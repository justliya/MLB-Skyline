import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as use from '@tensorflow-models/universal-sentence-encoder';

export const useMLModels = () => {
  const analyzeQuestion = async (question: string) => {
    try {
      // Ensure TensorFlow.js is ready
      await tf.ready();

      // Load Universal Sentence Encoder Model
      const model = await use.load();

      // Generate embeddings for the given question
      const embeddings = await model.embed([question]);

      // Return embeddings as raw data
      const embeddingArray = embeddings.arraySync(); // Convert to array for easier use
      return { data: embeddingArray };
    } catch (error) {
      console.error('ML Model Error:', error);
      return { error: 'Failed to analyze question.' };
    }
  };

  return { analyzeQuestion };
};