import React from 'react';
import { render, fireEvent, waitFor } from '../../../test-utils/test-utils';
import { authStore } from '../../../store/authStore';
import { generateIndianPhoneNumber } from '../../../test-utils/test-data';
import { mockServices } from '../../../test-utils/mocks/mock-services';

jest.mock('../../../store/authStore');
jest.mock('expo-sms');

describe('Phone Authentication Tests', () => {
  const mockPhoneNumber = generateIndianPhoneNumber();
  const mockOTP = '123456';

  beforeEach(() => {
    jest.clearAllMocks();
    
    (authStore.sendOTP as jest.Mock).mockResolvedValue({ success: true });
    (authStore.verifyOTP as jest.Mock).mockResolvedValue({ 
      success: true, 
      user: { id: 'user-123', phone: mockPhoneNumber }
    });
  });

  describe('Phone Number Input', () => {
    it('validates Indian phone number format', async () => {
      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      const phoneInput = getByTestId('phone-input');
      fireEvent.changeText(phoneInput, '123456789'); // Invalid format

      fireEvent.press(getByText('Send OTP'));

      await waitFor(() => {
        expect(getByText('Please enter a valid Indian mobile number')).toBeTruthy();
      });
    });

    it('accepts valid Indian phone number', async () => {
      const { getByTestId, getByText, queryByText } = render(<PhoneAuthScreen />);

      const phoneInput = getByTestId('phone-input');
      fireEvent.changeText(phoneInput, mockPhoneNumber);

      fireEvent.press(getByText('Send OTP'));

      await waitFor(() => {
        expect(queryByText('Please enter a valid Indian mobile number')).toBeNull();
        expect(authStore.sendOTP).toHaveBeenCalledWith(mockPhoneNumber);
      });
    });

    it('formats phone number with country code', () => {
      const { getByTestId } = render(<PhoneAuthScreen />);

      const phoneInput = getByTestId('phone-input');
      fireEvent.changeText(phoneInput, '9876543210');

      expect(phoneInput.props.value).toBe('+919876543210');
    });

    it('handles international numbers', async () => {
      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      const phoneInput = getByTestId('phone-input');
      fireEvent.changeText(phoneInput, '+1234567890'); // US number

      fireEvent.press(getByText('Send OTP'));

      await waitFor(() => {
        expect(getByText('Only Indian mobile numbers are supported')).toBeTruthy();
      });
    });
  });

  describe('OTP Generation and Sending', () => {
    it('sends OTP successfully', async () => {
      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      const phoneInput = getByTestId('phone-input');
      fireEvent.changeText(phoneInput, mockPhoneNumber);
      fireEvent.press(getByText('Send OTP'));

      await waitFor(() => {
        expect(authStore.sendOTP).toHaveBeenCalledWith(mockPhoneNumber);
        expect(getByText('OTP sent successfully')).toBeTruthy();
        expect(getByTestId('otp-input-section')).toBeTruthy();
      });
    });

    it('handles OTP sending failure', async () => {
      (authStore.sendOTP as jest.Mock).mockRejectedValue(
        new Error('SMS service unavailable')
      );

      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      const phoneInput = getByTestId('phone-input');
      fireEvent.changeText(phoneInput, mockPhoneNumber);
      fireEvent.press(getByText('Send OTP'));

      await waitFor(() => {
        expect(getByText('Failed to send OTP. Please try again.')).toBeTruthy();
        expect(getByText('Retry')).toBeTruthy();
      });
    });

    it('shows loading state during OTP sending', async () => {
      (authStore.sendOTP as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      const phoneInput = getByTestId('phone-input');
      fireEvent.changeText(phoneInput, mockPhoneNumber);
      fireEvent.press(getByText('Send OTP'));

      expect(getByTestId('loading-spinner')).toBeTruthy();
      expect(getByText('Sending OTP...')).toBeTruthy();
    });

    it('starts countdown timer after sending OTP', async () => {
      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      const phoneInput = getByTestId('phone-input');
      fireEvent.changeText(phoneInput, mockPhoneNumber);
      fireEvent.press(getByText('Send OTP'));

      await waitFor(() => {
        expect(getByTestId('resend-timer')).toHaveTextContent('Resend OTP in 60s');
      });
    });
  });

  describe('OTP Verification', () => {
    it('verifies correct OTP', async () => {
      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      // Send OTP first
      const phoneInput = getByTestId('phone-input');
      fireEvent.changeText(phoneInput, mockPhoneNumber);
      fireEvent.press(getByText('Send OTP'));

      await waitFor(() => {
        expect(getByTestId('otp-input')).toBeTruthy();
      });

      // Enter OTP
      const otpInput = getByTestId('otp-input');
      fireEvent.changeText(otpInput, mockOTP);
      fireEvent.press(getByText('Verify OTP'));

      await waitFor(() => {
        expect(authStore.verifyOTP).toHaveBeenCalledWith(mockPhoneNumber, mockOTP);
        expect(getByText('Login successful')).toBeTruthy();
      });
    });

    it('handles incorrect OTP', async () => {
      (authStore.verifyOTP as jest.Mock).mockResolvedValue({ 
        success: false, 
        error: 'Invalid OTP' 
      });

      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      // Complete flow with incorrect OTP
      await completeOTPFlow(getByTestId, getByText, '111111');

      await waitFor(() => {
        expect(getByText('Invalid OTP. Please try again.')).toBeTruthy();
        expect(getByText('Resend OTP')).toBeTruthy();
      });
    });

    it('handles expired OTP', async () => {
      (authStore.verifyOTP as jest.Mock).mockResolvedValue({ 
        success: false, 
        error: 'OTP expired' 
      });

      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      await completeOTPFlow(getByTestId, getByText, mockOTP);

      await waitFor(() => {
        expect(getByText('OTP has expired. Please request a new one.')).toBeTruthy();
        expect(getByText('Send New OTP')).toBeTruthy();
      });
    });

    it('auto-verifies OTP when 6 digits entered', async () => {
      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      // Send OTP first
      const phoneInput = getByTestId('phone-input');
      fireEvent.changeText(phoneInput, mockPhoneNumber);
      fireEvent.press(getByText('Send OTP'));

      await waitFor(() => {
        expect(getByTestId('otp-input')).toBeTruthy();
      });

      // Enter 6-digit OTP
      const otpInput = getByTestId('otp-input');
      fireEvent.changeText(otpInput, mockOTP);

      // Should auto-verify without pressing button
      await waitFor(() => {
        expect(authStore.verifyOTP).toHaveBeenCalledWith(mockPhoneNumber, mockOTP);
      });
    });
  });

  describe('OTP Resend Functionality', () => {
    it('allows OTP resend after timer expires', async () => {
      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      // Send initial OTP
      await completePhoneInput(getByTestId, getByText);

      // Wait for timer to expire (mock timer)
      act(() => {
        jest.advanceTimersByTime(60000); // 60 seconds
      });

      await waitFor(() => {
        const resendButton = getByText('Resend OTP');
        expect(resendButton).not.toBeDisabled();
      });

      fireEvent.press(getByText('Resend OTP'));

      expect(authStore.sendOTP).toHaveBeenCalledTimes(2);
    });

    it('disables resend button during countdown', async () => {
      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      await completePhoneInput(getByTestId, getByText);

      const resendButton = getByText(/Resend OTP in/);
      expect(resendButton).toBeDisabled();
    });

    it('limits resend attempts', async () => {
      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      await completePhoneInput(getByTestId, getByText);

      // Send multiple resend requests
      for (let i = 0; i < 3; i++) {
        act(() => {
          jest.advanceTimersByTime(60000);
        });
        
        await waitFor(() => {
          fireEvent.press(getByText('Resend OTP'));
        });
      }

      // Should show rate limit message
      await waitFor(() => {
        expect(getByText('Too many attempts. Please try again later.')).toBeTruthy();
      });
    });
  });

  describe('Security Features', () => {
    it('masks phone number in UI', () => {
      const { getByTestId } = render(
        <PhoneAuthScreen initialPhone={mockPhoneNumber} />
      );

      const maskedDisplay = getByTestId('masked-phone');
      expect(maskedDisplay).toHaveTextContent('+91****3210');
    });

    it('clears OTP input on multiple failed attempts', async () => {
      (authStore.verifyOTP as jest.Mock).mockResolvedValue({ 
        success: false, 
        error: 'Invalid OTP' 
      });

      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      await completePhoneInput(getByTestId, getByText);

      // Multiple failed attempts
      for (let i = 0; i < 3; i++) {
        const otpInput = getByTestId('otp-input');
        fireEvent.changeText(otpInput, '111111');
        fireEvent.press(getByText('Verify OTP'));
        
        await waitFor(() => {
          expect(getByText('Invalid OTP. Please try again.')).toBeTruthy();
        });
      }

      // Should clear input and require new OTP
      const otpInput = getByTestId('otp-input');
      expect(otpInput.props.value).toBe('');
      expect(getByText('Request new OTP for security')).toBeTruthy();
    });

    it('implements brute force protection', async () => {
      (authStore.verifyOTP as jest.Mock).mockResolvedValue({ 
        success: false, 
        error: 'Too many failed attempts' 
      });

      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      await completeOTPFlow(getByTestId, getByText, '111111');

      await waitFor(() => {
        expect(getByText('Account temporarily locked')).toBeTruthy();
        expect(getByText('Please try again after 15 minutes')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByLabelText } = render(<PhoneAuthScreen />);

      expect(getByLabelText('Enter your mobile number')).toBeTruthy();
      expect(getByLabelText('Send OTP to mobile number')).toBeTruthy();
    });

    it('announces OTP status to screen readers', async () => {
      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      await completePhoneInput(getByTestId, getByText);

      const announcement = getByTestId('otp-announcement');
      expect(announcement).toHaveAccessibilityLiveRegion('polite');
      expect(announcement).toHaveTextContent('OTP sent to your mobile number');
    });

    it('supports voice-over navigation', () => {
      const { getByTestId } = render(<PhoneAuthScreen />);

      const phoneInput = getByTestId('phone-input');
      expect(phoneInput).toHaveAccessibilityHint('Enter 10 digit mobile number starting with 6, 7, 8, or 9');
    });
  });

  describe('Edge Cases', () => {
    it('handles network timeout during OTP send', async () => {
      (authStore.sendOTP as jest.Mock).mockRejectedValue(
        new Error('Request timeout')
      );

      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      await completePhoneInput(getByTestId, getByText);

      await waitFor(() => {
        expect(getByText('Network timeout. Please check your connection.')).toBeTruthy();
        expect(getByText('Try Again')).toBeTruthy();
      });
    });

    it('handles app backgrounding during OTP verification', async () => {
      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      await completePhoneInput(getByTestId, getByText);

      // Simulate app going to background
      act(() => {
        // App state change would typically trigger this
        fireEvent.blur(getByTestId('otp-input'));
      });

      // Simulate returning to foreground
      act(() => {
        fireEvent.focus(getByTestId('otp-input'));
      });

      // Should still work normally
      const otpInput = getByTestId('otp-input');
      fireEvent.changeText(otpInput, mockOTP);

      await waitFor(() => {
        expect(authStore.verifyOTP).toHaveBeenCalled();
      });
    });

    it('handles simultaneous login attempts', async () => {
      const { getByTestId, getByText } = render(<PhoneAuthScreen />);

      await completePhoneInput(getByTestId, getByText);

      const otpInput = getByTestId('otp-input');
      
      // Simulate multiple rapid OTP submissions
      fireEvent.changeText(otpInput, mockOTP);
      fireEvent.press(getByText('Verify OTP'));
      fireEvent.press(getByText('Verify OTP'));
      fireEvent.press(getByText('Verify OTP'));

      // Should only process one verification
      expect(authStore.verifyOTP).toHaveBeenCalledTimes(1);
    });
  });

  // Helper functions
  const completePhoneInput = async (getByTestId: any, getByText: any) => {
    const phoneInput = getByTestId('phone-input');
    fireEvent.changeText(phoneInput, mockPhoneNumber);
    fireEvent.press(getByText('Send OTP'));
    
    await waitFor(() => {
      expect(getByTestId('otp-input')).toBeTruthy();
    });
  };

  const completeOTPFlow = async (getByTestId: any, getByText: any, otp: string) => {
    await completePhoneInput(getByTestId, getByText);
    
    const otpInput = getByTestId('otp-input');
    fireEvent.changeText(otpInput, otp);
    fireEvent.press(getByText('Verify OTP'));
  };
});

// Mock PhoneAuthScreen component
const PhoneAuthScreen = ({ initialPhone }: { initialPhone?: string }) => {
  const [phone, setPhone] = React.useState(initialPhone || '');
  const [otp, setOtp] = React.useState('');
  const [step, setStep] = React.useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [resendTimer, setResendTimer] = React.useState(0);
  const [resendAttempts, setResendAttempts] = React.useState(0);

  const validatePhone = (phoneNumber: string) => {
    const indianMobileRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return indianMobileRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const formatPhone = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      return `+91${cleaned}`;
    }
    return phoneNumber;
  };

  const sendOTP = async () => {
    if (!validatePhone(phone)) {
      setError('Please enter a valid Indian mobile number');
      return;
    }

    if (phone.startsWith('+1') || !phone.startsWith('+91')) {
      setError('Only Indian mobile numbers are supported');
      return;
    }

    if (resendAttempts >= 3) {
      setError('Too many attempts. Please try again later.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authStore.sendOTP(phone);
      setStep('otp');
      setResendTimer(60);
      setResendAttempts(prev => prev + 1);
      
      // Start countdown timer
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await authStore.verifyOTP(phone, otp);
      
      if (result.success) {
        // Handle successful login
      } else {
        setError(result.error === 'Invalid OTP' ? 'Invalid OTP. Please try again.' : 
                 result.error === 'OTP expired' ? 'OTP has expired. Please request a new one.' :
                 result.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Auto-verify when 6 digits entered
    if (otp.length === 6 && step === 'otp') {
      verifyOTP();
    }
  }, [otp, step]);

  if (step === 'phone') {
    return (
      <div>
        <input
          data-testid="phone-input"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          placeholder="Enter mobile number"
          aria-label="Enter your mobile number"
          accessibilityHint="Enter 10 digit mobile number starting with 6, 7, 8, or 9"
        />
        
        {initialPhone && (
          <div data-testid="masked-phone">
            +91****{initialPhone.slice(-4)}
          </div>
        )}

        <button 
          onClick={sendOTP}
          disabled={loading}
          aria-label="Send OTP to mobile number"
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>

        {loading && <div data-testid="loading-spinner">Loading...</div>}
        {error && <div>{error}</div>}
      </div>
    );
  }

  return (
    <div data-testid="otp-input-section">
      <div>OTP sent successfully</div>
      <div 
        data-testid="otp-announcement"
        aria-live="polite"
        style={{ opacity: 0, position: 'absolute' }}
      >
        OTP sent to your mobile number
      </div>
      
      <input
        data-testid="otp-input"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter 6-digit OTP"
        maxLength={6}
      />

      <button onClick={verifyOTP} disabled={loading || otp.length !== 6}>
        Verify OTP
      </button>

      <button 
        data-testid="resend-timer"
        onClick={sendOTP}
        disabled={resendTimer > 0 || resendAttempts >= 3}
      >
        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
      </button>

      {loading && <div data-testid="loading-spinner">Loading...</div>}
      {error && <div>{error}</div>}
    </div>
  );
};