// Jest setup file
// Mock React Native modules that aren't available in Node environment

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
}));

// Mock expo-crypto for UUID generation
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => {
    // Generate a simple UUID-like string for testing
    const chars = '0123456789abcdef';
    let uuid = '';
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid += '-';
      } else {
        uuid += chars[Math.floor(Math.random() * 16)];
      }
    }
    return uuid;
  }),
}));
