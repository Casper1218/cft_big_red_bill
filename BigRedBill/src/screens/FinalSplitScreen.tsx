import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Payment {
  from: string;
  to: string;
  amount: number;
}

const FinalSplitScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  // Mock data - this would come from the previous screen
  const payments: Payment[] = [
    { from: 'Person 1', to: 'Payer', amount: 15.99 },
    { from: 'Person 2', to: 'Payer', amount: 12.50 },
    { from: 'Person 3', to: 'Payer', amount: 8.99 },
  ];

  const handleDone = () => {
    navigation.navigate('Landing');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Split Results</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payments Due</Text>
        {payments.map((payment, index) => (
          <View key={index} style={styles.paymentItem}>
            <Text style={styles.paymentText}>
              {payment.from} owes {payment.to}
            </Text>
            <Text style={styles.amountText}>
              ${payment.amount.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 10,
  },
  paymentText: {
    fontSize: 16,
    color: '#333',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  doneButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  doneButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FinalSplitScreen; 