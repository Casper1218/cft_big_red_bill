import axios from 'axios';

interface OCRResult {
  text: string;
  confidence: number;
  boundingBox: {
    vertices: Array<{ x: number; y: number }>;
  };
}

export const performOCR = async (imageUri: string): Promise<OCRResult[]> => {
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
      return [];
    }

    // Return the full text and individual text elements with their positions
    return textAnnotations.map((annotation: any) => ({
      text: annotation.description,
      confidence: annotation.confidence || 0,
      boundingBox: annotation.boundingPoly,
    }));
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
}; 