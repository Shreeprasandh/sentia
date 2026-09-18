/**
 * Sentia 3D Model Asset Registry
 * Mapped to physical hardware digital twins.
 */
export interface Bag3DModelMeta {
  id: string;
  name: string;
  modelCode: string;
  asset: any;
  webUrl: string;
  cameraOrbit: string;
  fieldOfView: string;
}

export const CDN_BASE_URL = 'https://web-replica-three.vercel.app';

export const BAG_3D_MODELS: Record<string, Bag3DModelMeta> = {
  'bag-01': {
    id: 'bag-01',
    name: 'Executive Smart Pack',
    modelCode: 'Model EXP-01 • Carbon Weave',
    asset: require('../../assets/models/sentia_exp01.glb'),
    webUrl: `${CDN_BASE_URL}/models/sentia_exp01.glb`,
    cameraOrbit: '0deg 75deg 105%',
    fieldOfView: '30deg',
  },
  'bag-02': {
    id: 'bag-02',
    name: 'Weekender Travel Duffel',
    modelCode: 'Model WKD-02 • Ballistic Canvas',
    asset: require('../../assets/models/sentia_wkd02.glb'),
    webUrl: `${CDN_BASE_URL}/models/sentia_wkd02.glb`,
    cameraOrbit: '0deg 75deg 105%',
    fieldOfView: '30deg',
  },
  'bag-03': {
    id: 'bag-03',
    name: 'Leather Crossbody Purse',
    modelCode: 'Model CRB-03 • Saddle Tan',
    asset: require('../../assets/models/sentia_crb03.glb'),
    webUrl: `${CDN_BASE_URL}/models/sentia_crb03.glb`,
    cameraOrbit: '0deg 75deg 105%',
    fieldOfView: '30deg',
  },
  'bag-04': {
    id: 'bag-04',
    name: 'Smart Commuter Sling',
    modelCode: 'Model SLG-04 • Aerodynamic Carbon',
    asset: require('../../assets/models/sentia_slg04.glb'),
    webUrl: `${CDN_BASE_URL}/models/sentia_slg04.glb`,
    cameraOrbit: '0deg 75deg 105%',
    fieldOfView: '30deg',
  },
};

export const get3DModelForBag = (bagId: string): Bag3DModelMeta => {
  return BAG_3D_MODELS[bagId] || BAG_3D_MODELS['bag-01'];
};

/**
 * Flagship 3D digital twins are exclusively available for
 * Executive Smart Pack (bag-01) and Leather Crossbody Purse (bag-03).
 */
export const is3DSupportedForBag = (bagId?: string): boolean => {
  return bagId === 'bag-01' || bagId === 'bag-03';
};
