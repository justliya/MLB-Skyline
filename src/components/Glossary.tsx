
import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native';


interface GlossaryProps {
  gameId: string;
}

const Glossary: React.FC<GlossaryProps> = ({ gameId }) => {
  // GUMBO API Data
  const { glossary, loading, error } = useGumboAPI(gameId);

  // ML Model Integration
  const { fetchDefinitions } = useMLModels();
  const [mlDefinition, setMLDefinition] = useState<string | null>(null);
  const [loadingML, setLoadingML] = useState(false);

  // Component State
  const [selectedTerm, setSelectedTerm] = useState<{ term: string; definition: string } | null>(
    null
  );
  const [learningMode, setLearningMode] = useState(false);

  // Fetch AI Definitions for the Selected Term
  const handleFetchMLDefinition = async (term: string) => {
    setLoadingML(true);
    const result = await fetchDefinitions(term);
    if (result.data) {
      setMLDefinition(result.data.definition);
    } else {
      Alert.alert('Error', result.error || 'Failed to fetch AI definition.');
    }
    setLoadingML(false);
  };

  // Handle Loading/Error States
  if (loading) return <Text>Loading glossary...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View style={styles.container}>
      {/* Learning Mode Toggle */}
      <View style={styles.settings}>
        <Text>Turn On Learning Mode:</Text>
        <Switch value={learningMode} onValueChange={setLearningMode} />
      </View>

      {/* Glossary List */}
      <FlatList
        data={glossary}
        keyExtractor={(item) => item.term}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedTerm(item); // Show GUMBO definition
              handleFetchMLDefinition(item.term); // Fetch AI-enhanced definition
            }}
            style={styles.termContainer}
          >
            <Text>{item.term}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal for Selected Term */}
      {selectedTerm && (
        <Modal visible={true} transparent>
          <View style={styles.modal}>
            <Text style={styles.termTitle}>{selectedTerm.term}</Text>
            <Text style={styles.definitionTitle}>GUMBO Definition:</Text>
            <Text style={styles.definitionText}>{selectedTerm.definition}</Text>

            <Text style={styles.definitionTitle}>AI Definition:</Text>
            {loadingML ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.definitionText}>
                {mlDefinition || 'No AI definition available.'}
              </Text>
            )}

            <Button title="Close" onPress={() => setSelectedTerm(null)} />
          </View>
        </Modal>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { padding: 10 },
  settings: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  termContainer: { padding: 10, borderBottomWidth: 1 },
  modal: { padding: 20, backgroundColor: 'white', margin: 20, borderRadius: 10 },
  termTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  definitionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  definitionText: { fontSize: 14, marginTop: 5 },
});

export default Glossary;

function useMLModels(): { fetchDefinitions: any; } {
  throw new Error('Function not implemented.');
}
function useGumboAPI(gameId: string): { glossary: any; loading: any; error: any; } {
  throw new Error('Function not implemented.');
}

