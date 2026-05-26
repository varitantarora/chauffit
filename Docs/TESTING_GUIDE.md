# Chauffit - Testing Guide

---

## Setup

**Test runner:** Jest with `jest-expo` preset
**Test library:** React Testing Library (`@testing-library/react-native`)
**TypeScript:** `ts-jest` transform

### Running Tests

```bash
npx jest                              # Run all tests
npx jest --testPathPattern=auth       # Run tests matching pattern
npx jest --coverage                   # Run with coverage report
npx jest --watch                      # Watch mode
npx jest --testNamePattern="login"    # Run specific test name
```

---

## Configuration

### jest.config.js

| Setting | Value |
|---|---|
| Preset | `jest-expo` |
| Environment | `jsdom` |
| Transform | `ts-jest` for `.ts`/`.tsx` |
| Setup | `@testing-library/jest-native/extend-expect` |
| Timeout | 30 seconds |

### Coverage Thresholds

| Scope | Lines | Branches | Functions | Statements |
|---|---|---|---|---|
| Global | 80% | 80% | 80% | 80% |
| Services (`services/**`) | 90% | 90% | 90% | 90% |
| EmergencyButton | 100% | 100% | 100% | 100% |

### Test File Patterns

```
**/__tests__/**/*.(ts|tsx|js)
**/*.(test|spec).(ts|tsx|js)
```

Coverage output: `text`, `lcov`, `html`, `json-summary`

---

## Test Categories

### 1. Component Tests

Test UI components in isolation with React Testing Library.

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { PrimaryButton } from '@/components/common/PrimaryButton';

describe('PrimaryButton', () => {
  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton title="Submit" onPress={onPress} />
    );
    fireEvent.press(getByText('Submit'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### 2. Store Tests

Test Zustand stores by importing and calling actions directly.

```typescript
import { useAuthStore } from '@/store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
    });
  });

  it('sets user on login', () => {
    const { login } = useAuthStore.getState();
    login(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
```

### 3. API Service Tests

Test API services with mocked fetch/request calls.

```typescript
import { AuthApiService } from '@/services/api/AuthApiService';

describe('AuthApiService', () => {
  it('handles login success', async () => {
    // Mock the base service request method
    jest.spyOn(BaseApiService.prototype, 'request').mockResolvedValue({
      access: 'token',
      refresh: 'refresh-token',
    });

    const result = await AuthApiService.login('email', 'pass');
    expect(result.access).toBeDefined();
  });
});
```

### 4. Critical Safety Tests

EmergencyButton requires **100% coverage**. Tests must cover:
- Countdown activation and cancellation
- Emergency contact SMS alerts
- Location sharing on trigger
- Haptic feedback
- All variants (floating, inline, header)
- All sizes (small, medium, large)
- Network failure during alert

### 5. Integration Tests

End-to-end flow tests for:
- **Authentication** — login → token storage → profile fetch
- **Payment** — create order → Razorpay checkout → verify signature
- **Booking** — select service → choose chauffeur → confirm → track

---

## Mocking Guide

### AsyncStorage

```typescript
jest.mock('react-native/Libraries/Storage/AsyncStorage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));
```

### Navigation

```typescript
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));
```

### API Services

```typescript
jest.mock('@/services/api/BaseApiService');
// or mock specific methods:
jest.spyOn(AuthApiService, 'login').mockResolvedValue(mockResponse);
```

### Native Modules

```typescript
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return { default: View, Marker: View, Polyline: View };
});
```

---

## Test Structure Convention

```
__tests__/
  components/
    EmergencyButton.test.tsx
    PrimaryButton.test.tsx
    MapView.test.tsx
  stores/
    authStore.test.ts
    jobStore.test.ts
  services/
    authApi.test.ts
    razorpay.test.ts
  flows/
    booking-flow.test.ts
    payment-flow.test.ts
    auth-flow.test.ts
```

---

## Writing New Tests

### Checklist

1. Clear `describe` block per feature/component
2. `beforeEach` to reset state between tests
3. Test both success and error paths
4. Mock all external dependencies
5. Use `screen.getBy*` queries — prefer `getByRole`, `getByText`
6. Use `fireEvent` for interactions
7. Assert on visible output, not implementation details
8. For async: use `waitFor`, `findBy*` queries

### Common Patterns

```typescript
// Loading state
it('shows loading spinner', () => {
  const { getByTestId } = render(<Component loading={true} />);
  expect(getByTestId('loading-spinner')).toBeTruthy();
});

// Error state
it('displays error message', () => {
  const { getByText } = render(<Component error="Network failed" />);
  expect(getByText('Network failed')).toBeTruthy();
});

// Async action
it('fetches data on mount', async () => {
  const { findByText } = render(<DataComponent />);
  expect(await findByText('Loaded data')).toBeTruthy();
});
```

---

## CI Integration

Tests should run in CI pipeline before merge:

```bash
npx jest --ci --coverage --coverageThreshold='{\"global\":{\"lines\":80}}'
```

Fails if coverage drops below thresholds.
