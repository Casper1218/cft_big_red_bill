import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBillSplit } from '../context/BillSplitContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'venmo', name: 'Venmo', icon: '💸' },
  { id: 'paypal', name: 'PayPal', icon: '💰' },
  { id: 'cash', name: 'Cash', icon: '💵' },
  { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
];

const FinalSplitScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { receiver, items, payers } = useBillSplit();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showMethodModal, setShowMethodModal] = useState(false);

  // Calculate total amount for each payer
  const payerTotals = payers.reduce((acc, payer) => {
    const total = items.reduce((sum, item) => {
      if (item.payers.includes(payer)) {
        return sum + item.price;
      }
      return sum;
    }, 0);
    acc[payer] = total;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total amount for receiver
  const receiverTotal = Object.values(payerTotals).reduce((sum, amount) => sum + amount, 0);

  const handleConfirmPayment = () => {
    // TODO: Implement payment confirmation logic
    navigation.navigate('Landing');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Receiver</Text>
        <View style={styles.receiverContainer}>
          <Text style={styles.receiverName}>{receiver}</Text>
          <Text style={styles.receiverAmount}>Total: ${receiverTotal.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity
          style={styles.methodButton}
          onPress={() => setShowMethodModal(true)}
        >
          <Text style={styles.methodButtonText}>
            {selectedMethod ? `${selectedMethod.icon} ${selectedMethod.name}` : 'Select Payment Method'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payments Due</Text>
        {payers.map((payer, index) => (
          <View key={index} style={styles.payerContainer}>
            <View style={styles.payerHeader}>
              <Text style={styles.payerName}>{payer}</Text>
              <Text style={styles.payerAmount}>${payerTotals[payer].toFixed(2)}</Text>
            </View>
            <View style={styles.itemsContainer}>
              {items
                .filter(item => item.payers.includes(payer))
                .map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  </View>
                ))}
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.confirmButton, !selectedMethod && styles.disabledButton]}
        onPress={handleConfirmPayment}
        disabled={!selectedMethod}
      >
        <Text style={styles.confirmButtonText}>Confirm Payment Request</Text>
      </TouchableOpacity>

      <Modal
        visible={showMethodModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMethodModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodOption,
                  selectedMethod?.id === method.id && styles.selectedMethod
                ]}
                onPress={() => {
                  setSelectedMethod(method);
                  setShowMethodModal(false);
                }}
              >
                <Text style={styles.methodText}>
                  {method.icon} {method.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMethodModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  receiverContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  receiverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  receiverAmount: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  methodButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  methodButtonText: {
    fontSize: 16,
    color: '#333',
  },
  payerContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  payerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  payerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  payerAmount: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  methodOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedMethod: {
    backgroundColor: '#f0f0f0',
  },
  methodText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FinalSplitScreen; 