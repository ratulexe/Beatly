import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver for Framer Motion
class IntersectionObserver {
  observe = () => null
  unobserve = () => null
  disconnect = () => null
}
window.IntersectionObserver = IntersectionObserver;
