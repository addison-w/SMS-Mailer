// src/services/sim-info.ts
import { Platform } from 'react-native';
import SimCardsManagerModule from 'react-native-sim-cards-manager';

export interface SimCard {
  phoneNumber: string;
  carrierName: string;
  simSlotIndex: number;
  subscriptionId: number;
}

let cachedSimCards: SimCard[] | null = null;

/**
 * Get all SIM cards in the device
 */
export async function getSimCards(): Promise<SimCard[]> {
  if (cachedSimCards !== null) {
    return cachedSimCards;
  }

  if (Platform.OS !== 'android') {
    return [];
  }

  try {
    const cards = await SimCardsManagerModule.getSimCards({
      title: 'Phone Permission',
      message: 'SMS Mailer needs phone access to identify your SIM card number for forwarded emails.',
      buttonNeutral: 'Not now',
      buttonNegative: 'Deny',
      buttonPositive: 'Allow',
    });

    cachedSimCards = cards.map((card: any) => ({
      phoneNumber: card.phoneNumber || '',
      carrierName: card.carrierName || card.displayName || 'Unknown Carrier',
      simSlotIndex: card.simSlotIndex ?? 0,
      subscriptionId: card.subscriptionId ?? 0,
    }));

    return cachedSimCards;
  } catch (error) {
    console.error('Error getting SIM cards:', error);
    return [];
  }
}

/**
 * Get the receiver phone number for an incoming SMS.
 *
 * Since Android's SMS_RECEIVED broadcast doesn't tell us which SIM received
 * the message, we can only provide the number if there's a single SIM.
 *
 * @returns The phone number if single SIM, or 'Unknown' for dual SIM
 */
export async function getReceiverPhoneNumber(): Promise<string> {
  const simCards = await getSimCards();

  if (simCards.length === 0) {
    return 'Unknown';
  }

  if (simCards.length === 1) {
    // Single SIM - we know which number received it
    const number = simCards[0].phoneNumber;
    return number && number.length > 0 ? number : 'Unknown';
  }

  // Dual SIM - Android doesn't tell us which SIM received the SMS
  // We can't determine the receiver
  return 'Unknown';
}

/**
 * Get the SIM slot label (SIM 1 or SIM 2)
 * Since we can't determine which SIM received the SMS on dual-SIM devices,
 * we return the slot only for single-SIM devices.
 */
export async function getSimSlotLabel(): Promise<string> {
  const simCards = await getSimCards();

  if (simCards.length === 1) {
    return `SIM ${simCards[0].simSlotIndex + 1}`;
  }

  // Dual SIM or no SIM - just show SIM 1 as default
  return 'SIM 1';
}

/**
 * Check if device has multiple SIM cards
 */
export async function isDualSim(): Promise<boolean> {
  const simCards = await getSimCards();
  return simCards.length > 1;
}

/**
 * Clear cached SIM data (call if user changes SIM)
 */
export function clearSimCache(): void {
  cachedSimCards = null;
}
