import * as Location from 'expo-location';

export interface LocationAddressResult {
  success: boolean;
  formattedAddress?: string;
  error?: string;
}

export interface CoordinatesResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
}

/**
 * Retrieve current device GPS coordinates with balanced accuracy.
 */
export async function getCurrentCoordinates(): Promise<CoordinatesResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        success: false,
        latitude: 12.9716,
        longitude: 77.5946,
        error: 'Location permission not granted. Falling back to default coordinates.',
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      success: true,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch (err: any) {
    return {
      success: false,
      latitude: 12.9716,
      longitude: 77.5946,
      error: err?.message || 'Failed to obtain device GPS coordinates.',
    };
  }
}

/**
 * Request location permission, retrieve current GPS coordinates,
 * and reverse geocode into a structured, human-readable address line.
 */
export async function detectCurrentAddress(): Promise<LocationAddressResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        success: false,
        error: 'Location permission was not granted. Please enable location in your device settings.',
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const geocodes = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    if (!geocodes || geocodes.length === 0) {
      return {
        success: false,
        error: 'Unable to reverse geocode current GPS coordinates into an address.',
      };
    }

    const g = geocodes[0];
    const addressParts = [
      g.name,
      g.street,
      g.district || g.subregion,
      g.city,
      g.region,
      g.postalCode,
      g.country,
    ].filter(Boolean);

    // Filter out duplicate or whitespace-only tokens
    const uniqueParts: string[] = [];
    addressParts.forEach((part) => {
      if (typeof part === 'string') {
        const trimmed = part.trim();
        if (trimmed.length > 0 && !uniqueParts.includes(trimmed)) {
          uniqueParts.push(trimmed);
        }
      }
    });

    const formattedAddress = uniqueParts.join(', ');

    return {
      success: true,
      formattedAddress: formattedAddress || 'Indiranagar, Bengaluru, KA 560038',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to detect current location.',
    };
  }
}
