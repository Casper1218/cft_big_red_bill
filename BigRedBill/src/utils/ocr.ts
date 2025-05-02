import axios from 'axios';
import { BillItem } from '../context/BillSplitContext';

interface OCRResult {
  text: string;
  confidence: number;
  boundingBox: {
    vertices: Array<{ x: number; y: number }>;
  };
}

export const performOCR = async (imageUri: string): Promise<ProcessedBill> => {
  try {
    // Convert image to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Remove the data URL prefix
    const base64Data = (base64Image as string).split(',')[1];

    // Get API key from environment variables
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      throw new Error('Google Vision API key not found. Please set EXPO_PUBLIC_GOOGLE_VISION_API_KEY in your environment variables.');
    }

    // Call Google Cloud Vision API
    const visionResponse = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        requests: [
          {
            image: {
              content: base64Data,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 50,
              },
            ],
          },
        ],
      }
    );

    // Process the response
    const textAnnotations = visionResponse.data.responses[0].textAnnotations;
    if (!textAnnotations || textAnnotations.length === 0) {
      return {
        date: '',
        time: '',
        items: [],
        total: 0,
      };
    }

    // Get the OCR results
    const ocrResults = textAnnotations.map((annotation: any) => ({
      text: annotation.description,
      confidence: annotation.confidence || 0,
      boundingBox: annotation.boundingPoly,
    }));

    // Process and display bill data
    const texts = ocrResults.map(result => result.text);
    const processedBill = processBillText(texts);

    return processedBill;
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
};


export interface ProcessedBill {
  date: string;
  time: string;
  items: BillItem[];
  total: number;
}

export const processBillText = (ocrResults: string[]): ProcessedBill => {
  const result: ProcessedBill = {
    date: '',
    time: '',
    items: [],
    total: 0
  };

  // Find date and time
  const dateIndex = ocrResults.findIndex(text => text.match(/\d{2}\/\d{2}\/\d{4}/));
  if (dateIndex !== -1) {
    result.date = ocrResults[dateIndex];
    result.time = `${ocrResults[dateIndex + 1]} ${ocrResults[dateIndex + 2]}`;
  }

  // Process items
  let finishedItems = false;
  const items: BillItem[] = [];
  let total = 0;

  for (let i = 0; i < ocrResults.length; i++) {
    const text = ocrResults[i].trim();
    if (text.match(/\d+\.\d{2}/)) {
      const price = parseFloat(text);
      // Go backwards to find quantity and name
      let quantity = 1;
      let name = '';
      let j = i - 1;

      while (j >= 0) {
        const prevText = ocrResults[j].trim();

        // Check if previous text is a number (quantity)
        if (prevText.match(/\d+/)) {
          quantity = parseInt(prevText);
          break;
        }
        if (prevText.match(/total|tax|gratuity/i)) {
          finishedItems = true;
        }
        // Add to item name if not empty
        if (prevText) {
          name = prevText + ' ' + name;
        }

        j--;
      }

      // Add item to list
      if (!finishedItems && !isNaN(price) && !isNaN(quantity)
        && (name.trim() !== '' || (price > 0 && quantity > 0))) {
        items.push({
          name: name.trim(),
          price,
          quantity,
          payers: []
        });
        console.log('price', price);
        console.log('quantity', quantity);
        total += price * quantity;
        console.log('total', total);
      }

    }
  }

  result.items = items;
  result.total = total;
  console.log('total', total);

  return result;
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Helper function to get item total
export const getItemTotal = (item: BillItem): number => {
  return item.quantity * item.price;
};

