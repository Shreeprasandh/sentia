import { LogBox } from 'react-native';

// Intercept and permanently silence transient CLI/HMR connection warnings
const _originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = args[0];
  if (
    typeof msg === 'string' &&
    (msg.includes('Cannot connect to Expo CLI') ||
      msg.includes('Expo CLI') ||
      msg.includes('HMR') ||
      msg.includes('Metro'))
  ) {
    return;
  }
  _originalWarn(...args);
};

// Silence LogBox entirely at the root entry point
LogBox.ignoreAllLogs(true);

import App from '../App';

export default function Entry() {
  return <App />;
}
