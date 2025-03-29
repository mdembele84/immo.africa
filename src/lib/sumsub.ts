import { supabase } from './supabase';

// SumSub Sandbox API credentials
const SUMSUB_APP_TOKEN = 'sbx:uBWgyNwGKqE1WE5PhwXvGneM.0CL2GhEQz1dQNcrWkrQTGYhI96x9U';
const SUMSUB_BASE_URL = 'https://api.sumsub.com';

// This would typically be implemented on your backend
async function createAccessToken(userId: string): Promise<string> {
  try {
    // In production, this should be a call to your backend
    // which will generate the token securely using the SumSub SDK
    const response = await fetch(`${SUMSUB_BASE_URL}/resources/accessTokens`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUMSUB_APP_TOKEN}`,
      },
      body: JSON.stringify({
        userId,
        levelName: 'basic-kyc-level',
        ttlInSecs: 3600,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create access token');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error creating SumSub access token:', error);
    throw error;
  }
}

export const sumsubConfig = {
  getAccessToken: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return createAccessToken(user.id);
  },
  
  // Sandbox configuration
  config: {
    lang: 'fr',
    email: '',
    phone: '',
    i18n: {
      document: {
        subTitles: {
          IDENTITY: "Pièce d'identité",
          SELFIE: 'Photo de vous',
          PROOF_OF_RESIDENCE: 'Justificatif de domicile'
        }
      }
    },
    onMessage: (type: string, payload: any) => {
      console.log('SumSub message:', type, payload);
    },
    onError: (error: Error) => {
      console.error('SumSub error:', error);
    },
    uiConf: {
      customCssStr: `
        .sumsub-logo { display: none; }
        .title-text { color: #1e40af; }
      `
    }
  }
};