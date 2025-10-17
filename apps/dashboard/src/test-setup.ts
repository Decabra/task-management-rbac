import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock jasmine
global.jasmine = {
  createSpyObj: jest.fn((name, methods) => {
    const obj: any = {};
    methods.forEach((method: string) => {
      obj[method] = jest.fn();
    });
    return obj;
  })
};

// Mock spyOn
global.spyOn = jest.spyOn;
