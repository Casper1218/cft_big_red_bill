import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { formatCurrency } from '../utils/ocr';
import { useBillSplit } from '../context/BillSplitContext';
import { useRawBillData } from '../context/RawBillDataContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PAYMENT_METHODS = [
  { label: 'Select Method', value: '' },
  { label: 'Venmo', value: 'venmo' },
  { label: 'Cash', value: 'cash' },
  { label: 'Zelle', value: 'zelle' },
  { label: 'PayPal', value: 'paypal' }
];

const FinalSplitScreen = () => {
  const { rawBillData } = useRawBillData();
  const { receiver, items, payers } = useBillSplit();
  const [expandedPayers, setExpandedPayers] = useState<{ [key: string]: boolean }>({});
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<{ [key: string]: string }>({});
  const [showPicker, setShowPicker] = useState<string | null>(null);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0, width: 0 });
  const navigation = useNavigation<NavigationProp>();

  if (!receiver || !items || !payers) {
    return (
      <View style={styles.container}>
        <Text>No bill data available</Text>
      </View>
    );
  }

  const calculatePayerTotal = (payer: string) => {
    return items.reduce((total, item) => {
      if (item.payers.includes(payer)) {
        return total + (item.price * item.quantity);
      }
      return total;
    }, 0);
  };

  const togglePayerExpanded = (payer: string) => {
    setExpandedPayers(prev => ({
      ...prev,
      [payer]: !prev[payer]
    }));
  };

  const handlePaymentMethodChange = (payer: string, method: string) => {
    setSelectedPaymentMethods(prev => ({
      ...prev,
      [payer]: method
    }));
    setShowPicker(null);
  };

  const handleConfirmPayment = () => {
    // TODO: Implement payment confirmation logic
    console.log('Payment methods:', selectedPaymentMethods);
    navigation.navigate('RequestConfirmed');
  };

  const handlePaymentMethodPress = (payer: string, event: any) => {
    event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      setPickerPosition({
        top: pageY + height,
        left: pageX,
        width: width
      });
      setShowPicker(showPicker === payer ? null : payer);
    });
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.receiverText}>Receiver: {receiver}</Text>
          <Text style={styles.totalText}>Total Amount: {formatCurrency(rawBillData.total)}</Text>
        </View>

        <View style={styles.payersContainer}>
          {payers.map((payer, index) => {
            const payerTotal = calculatePayerTotal(payer);
            const isExpanded = expandedPayers[payer];

            return (
              <View key={index} style={styles.payerCard}>
                <TouchableOpacity
                  style={styles.payerHeader}
                  onPress={() => togglePayerExpanded(payer)}
                >
                  <View>
                    <Text style={styles.payerName}>{payer}</Text>
                    <Text style={styles.payerTotal}>{formatCurrency(payerTotal)}</Text>
                  </View>
                  <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.itemsList}>
                      {items.map((item, itemIndex) => {
                        if (item.payers.includes(payer)) {
                          return (
                            <View key={itemIndex} style={styles.itemRow}>
                              <Text style={styles.itemName}>
                                {item.quantity}x {item.name}
                              </Text>
                              <Text style={styles.itemPrice}>
                                {formatCurrency(item.price * item.quantity)}
                              </Text>
                            </View>
                          );
                        }
                        return null;
                      })}
                    </View>

                    <View style={styles.paymentMethodContainer}>
                      <Text style={styles.paymentMethodLabel}>Payment Method:</Text>
                      <TouchableOpacity
                        style={styles.paymentMethodButton}
                        onPress={(event) => handlePaymentMethodPress(payer, event)}
                      >
                        <Text style={styles.paymentMethodText}>
                          {PAYMENT_METHODS.find(m => m.value === selectedPaymentMethods[payer])?.label || 'Select Method'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmPayment}
        >
          <Text style={styles.confirmButtonText}>Confirm Payment Request</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showPicker !== null}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowPicker(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(null)}
        >
          <View
            style={[
              styles.pickerContainer,
              {
                position: 'absolute',
                top: pickerPosition.top,
                left: pickerPosition.left,
                width: pickerPosition.width,
              }
            ]}
          >
            {PAYMENT_METHODS.filter(method => method.value !== '').map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.pickerItem,
                  selectedPaymentMethods[showPicker || ''] === method.value && styles.pickerItemSelected
                ]}
                onPress={() => {
                  handlePaymentMethodChange(showPicker || '', method.value);
                  setShowPicker(null);
                }}
              >
                <Text style={[
                  styles.pickerItemText,
                  selectedPaymentMethods[showPicker || ''] === method.value && styles.pickerItemTextSelected
                ]}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  receiverText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalText: {
    fontSize: 18,
    color: '#666',
  },
  payersContainer: {
    marginBottom: 24,
  },
  payerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    zIndex: 1,
  },
  payerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  payerName: {
    fontSize: 18,
    fontWeight: '500',
  },
  payerTotal: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  expandIcon: {
    fontSize: 16,
    color: '#666',
  },
  expandedContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'relative',
    zIndex: 2,
  },
  itemsList: {
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  paymentMethodContainer: {
    marginTop: 16,
    position: 'relative',
    zIndex: 3,
  },
  paymentMethodLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  paymentMethodButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 4,
  },
  paymentMethodText: {
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#E85555',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerItemText: {
    fontSize: 16,
  },
  pickerItemSelected: {
    backgroundColor: '#f0f0f0',
  },
  pickerItemTextSelected: {
    fontWeight: 'bold',
  },
});

export default FinalSplitScreen;