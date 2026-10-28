const memoryMap = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => memoryMap.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      memoryMap.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      memoryMap.delete(key);
    }),
    clear: jest.fn(async () => {
      memoryMap.clear();
    }),
  },
}));
