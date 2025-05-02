import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBillSplit } from '../context/BillSplitContext';
import { performOCR } from '../utils/ocr';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Item {
  name: string;
  price: number;
  payers: string[];
}

const SplitResultScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { imageUri } = route.params as { imageUri: string };
  const { setBillSplit } = useBillSplit();
  const [isLoading, setIsLoading] = useState(true);
  const [ocrResults, setOcrResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Mock data for friends
  const allFriends = [
    'John Doe',
    'Jane Smith',
    'Mike Johnson',
    'Sarah Williams',
    'David Brown',
    'Emily Davis',
    'Robert Wilson',
    'Lisa Anderson'
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(true);
  const [receiver, setReceiver] = useState<string>('');
  const [payers, setPayers] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const processImage = async () => {
      try {
        setIsLoading(true);
        const results = await performOCR(imageUri);
        const texts = results.map(result => result.text);
        setOcrResults(texts);

        // Process OCR results to extract items and prices
        const extractedItems = extractItemsFromOCR(texts);
        setItems(extractedItems);
      } catch (err) {
        setError('Failed to process image. Please try again.');
        console.error('OCR Processing Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    processImage();
  }, [imageUri]);

  const extractItemsFromOCR = (texts: string[]): Item[] => {
    // This is a simple implementation - you might want to make it more robust
    const items: Item[] = [];
    const priceRegex = /\$?\d+\.\d{2}/;

    texts.forEach(text => {
      const lines = text.split('\n');
      lines.forEach(line => {
        const priceMatch = line.match(priceRegex);
        if (priceMatch) {
          const price = parseFloat(priceMatch[0].replace('$', ''));
          const name = line.replace(priceMatch[0], '').trim();
          if (name && price) {
            items.push({
              name,
              price,
              payers: []
            });
          }
        }
      });
    });

    return items;
  };

  const filteredFriends = allFriends.filter(friend =>
    friend.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectReceiver = (friend: string) => {
    setReceiver(friend);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleSelectPayer = (friend: string) => {
    if (payers.includes(friend)) {
      setPayers(payers.filter(p => p !== friend));
    } else {
      setPayers([...payers, friend]);
    }
  };

  const handleAssignItem = (itemIndex: number, payer: string) => {
    const newItems = [...items];
    const item = newItems[itemIndex];

    if (item.payers.includes(payer)) {
      item.payers = item.payers.filter(p => p !== payer);
    } else {
      item.payers.push(payer);
    }

    setItems(newItems);
  };

  const handleConfirm = () => {
    setBillSplit(receiver, items, payers);
    navigation.navigate('FinalSplit');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Processing bill image...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Receiver</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
        />
        {isSearchFocused && (
          <ScrollView style={styles.friendsList} nestedScrollEnabled>
            {filteredFriends.map((friend, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.friendButton,
                  receiver === friend && styles.selectedFriend
                ]}
                onPress={() => handleSelectReceiver(friend)}
              >
                <Text style={styles.friendText}>{friend}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {receiver && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedLabel}>Selected Receiver:</Text>
            <View style={styles.selectedItem}>
              <Text style={styles.selectedText}>{receiver}</Text>
              <TouchableOpacity onPress={() => setReceiver('')}>
                <Text style={styles.removeButton}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {receiver && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payers</Text>
          <View style={styles.payersContainer}>
            {allFriends.map((friend, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.payerButton,
                  payers.includes(friend) && styles.selectedPayer
                ]}
                onPress={() => handleSelectPayer(friend)}
              >
                <Text style={styles.payerText}>{friend}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {payers.length > 0 && (
            <View style={styles.selectedContainer}>
              <Text style={styles.selectedLabel}>Selected Payers:</Text>
              <View style={styles.selectedItemsContainer}>
                {payers.map((payer, index) => (
                  <View key={index} style={styles.selectedItem}>
                    <Text style={styles.selectedText}>{payer}</Text>
                    <TouchableOpacity onPress={() => handleSelectPayer(payer)}>
                      <Text style={styles.removeButton}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {payers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.itemContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              <View style={styles.assignmentContainer}>
                {payers.map((payer, payerIndex) => (
                  <TouchableOpacity
                    key={payerIndex}
                    style={[
                      styles.assignmentButton,
                      item.payers.includes(payer) && styles.assignedButton
                    ]}
                    onPress={() => handleAssignItem(itemIndex, payer)}
                  >
                    <Text style={styles.assignmentText}>{payer}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {receiver && payers.length > 0 && (
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm Split</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  friendsList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
  },
  friendButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    marginBottom: 5,
  },
  selectedFriend: {
    backgroundColor: '#FF6B6B',
  },
  friendText: {
    color: '#333',
  },
  selectedContainer: {
    marginTop: 10,
  },
  selectedLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 5,
    marginBottom: 5,
  },
  selectedText: {
    color: '#333',
    marginRight: 8,
  },
  removeButton: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  payersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  payerButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  selectedPayer: {
    backgroundColor: '#FF6B6B',
  },
  payerText: {
    color: '#333',
  },
  itemContainer: {
    marginBottom: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  assignmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  assignmentButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  assignedButton: {
    backgroundColor: '#FF6B6B',
  },
  assignmentText: {
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  confirmButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SplitResultScreen; 