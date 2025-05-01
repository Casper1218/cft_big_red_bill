import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Item {
  name: string;
  price: number;
  assignedTo: string[];
}

const SplitResultScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { imageUri } = route.params as { imageUri: string };

  const [items, setItems] = useState<Item[]>([
    { name: 'Item 1', price: 10.99, assignedTo: [] },
    { name: 'Item 2', price: 15.99, assignedTo: [] },
    { name: 'Item 3', price: 8.99, assignedTo: [] },
  ]);

  const [people, setPeople] = useState<string[]>(['Person 1', 'Person 2', 'Person 3']);
  const [selectedPayer, setSelectedPayer] = useState<string>('');

  const handleAssignItem = (itemIndex: number, person: string) => {
    const newItems = [...items];
    const item = newItems[itemIndex];

    if (item.assignedTo.includes(person)) {
      item.assignedTo = item.assignedTo.filter(p => p !== person);
    } else {
      item.assignedTo.push(person);
    }

    setItems(newItems);
  };

  const handleConfirm = () => {
    // TODO: Calculate final split and navigate to results
    navigation.navigate('FinalSplit');
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Payer</Text>
        <View style={styles.peopleContainer}>
          {people.map((person, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.personButton,
                selectedPayer === person && styles.selectedPerson
              ]}
              onPress={() => setSelectedPayer(person)}
            >
              <Text style={styles.personText}>{person}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {items.map((item, itemIndex) => (
          <View key={itemIndex} style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            <View style={styles.assignmentContainer}>
              {people.map((person, personIndex) => (
                <TouchableOpacity
                  key={personIndex}
                  style={[
                    styles.assignmentButton,
                    item.assignedTo.includes(person) && styles.assignedButton
                  ]}
                  onPress={() => handleAssignItem(itemIndex, person)}
                >
                  <Text style={styles.assignmentText}>{person}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm Split</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  peopleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  personButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  selectedPerson: {
    backgroundColor: '#FF0000',
  },
  personText: {
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
    backgroundColor: '#FF0000',
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
  backButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
  },
});

export default SplitResultScreen; 