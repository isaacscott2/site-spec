export interface CCTVStorageInput {
  cameraCount: number;
  resolution: '1080p' | '4K';
  fps: number;
  compression: 'H.264' | 'H.265';
  retentionDays: number;
}

export interface PoEInput {
  deviceCount: number;
  wattsPerDevice: number;
  cableDistanceMeters: number;
  cableCategory: 'Cat5e' | 'Cat6' | 'Cat6A';
}

export interface ConduitFillInput {
  conduitSizeInches: number;
  cableODMm: number;
}

/** 1. NVR Storage & Bandwidth Engine */
export function calculateCCTVStorage(input: CCTVStorageInput) {
  const baseBitrateMbps = input.resolution === '4K' ? 8 : 2;
  const compressionFactor = input.compression === 'H.265' ? 0.5 : 1.0;
  const fpsFactor = input.fps / 30;

  const totalBandwidthMbps = input.cameraCount * baseBitrateMbps * compressionFactor * fpsFactor;
  const totalStorageTB = (totalBandwidthMbps * 86400 * input.retentionDays) / 8000000;

  return {
    bandwidthMbps: Math.round(totalBandwidthMbps * 10) / 10,
    requiredStorageTB: Math.round(totalStorageTB * 100) / 100,
  };
}

/** 2. PoE Power & Voltage Drop Engine */
export function calculatePoEBudget(input: PoEInput) {
  const resistancePer100m = {
    'Cat5e': 17.0,
    'Cat6': 14.5,
    'Cat6A': 12.5,
  }[input.cableCategory];

  const totalRawWatts = input.deviceCount * input.wattsPerDevice;
  const lineLossPercentage = (input.cableDistanceMeters / 100) * (resistancePer100m / 100);
  const totalSwitchPowerRequiredWatts = totalRawWatts * (1 + lineLossPercentage);

  return {
    rawDeviceWatts: Math.round(totalRawWatts),
    recommendedSwitchPoEBudgetWatts: Math.ceil(totalSwitchPowerRequiredWatts * 1.2),
    voltageDropWarning: input.cableDistanceMeters > 90,
  };
}

/** 3. NEC Conduit Cable Fill Engine (40% Max Fill Rule) */
export function calculateConduitFill(input: ConduitFillInput) {
  const conduitRadiusMm = (input.conduitSizeInches * 25.4) / 2;
  const conduitAreaMm2 = Math.PI * Math.pow(conduitRadiusMm, 2);
  const maxUsableAreaMm2 = conduitAreaMm2 * 0.40;

  const cableRadiusMm = input.cableODMm / 2;
  const singleCableAreaMm2 = Math.PI * Math.pow(cableRadiusMm, 2);

  const maxCablesAllowed = Math.floor(maxUsableAreaMm2 / singleCableAreaMm2);

  return {
    maxCablesAllowed,
    fillPercentageCap: 40,
  };
}
