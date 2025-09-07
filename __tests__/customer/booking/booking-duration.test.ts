import { render, fireEvent, waitFor } from '../../../test-utils/test-utils';
import { DurationSelector } from '../../../components/customer/DurationSelector';
import { bookingStore } from '../../../store/bookingStore';
import { generateBooking } from '../../../test-utils/test-data';

// Mock the booking store
jest.mock('../../../store/bookingStore', () => ({
  bookingStore: {
    setDuration: jest.fn(),
    getDurationPrice: jest.fn(),
    booking: {
      duration_hours: 4,
      base_amount: 2000,
    },
  },
}));

describe('Booking Duration Selection', () => {
  const mockBooking = generateBooking();
  const mockOnDurationChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (bookingStore.getDurationPrice as jest.Mock).mockReturnValue(500);
  });

  describe('Duration Selector Component', () => {
    it('renders duration options correctly', () => {
      const { getByText } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
        />
      );

      expect(getByText('2 Hours')).toBeTruthy();
      expect(getByText('4 Hours')).toBeTruthy();
      expect(getByText('8 Hours')).toBeTruthy();
      expect(getByText('12 Hours')).toBeTruthy();
    });

    it('highlights selected duration', () => {
      const { getByTestId } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
        />
      );

      const fourHourOption = getByTestId('duration-option-4');
      expect(fourHourOption).toHaveStyle({ backgroundColor: expect.any(String) });
    });

    it('calls onDurationChange when duration is selected', () => {
      const { getByText } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
        />
      );

      fireEvent.press(getByText('8 Hours'));
      expect(mockOnDurationChange).toHaveBeenCalledWith(8);
    });

    it('displays correct pricing for each duration', () => {
      (bookingStore.getDurationPrice as jest.Mock)
        .mockReturnValueOnce(400)  // 2 hours
        .mockReturnValueOnce(800)  // 4 hours
        .mockReturnValueOnce(1500) // 8 hours
        .mockReturnValueOnce(2800); // 12 hours

      const { getByText } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
        />
      );

      expect(getByText('₹400')).toBeTruthy();
      expect(getByText('₹800')).toBeTruthy();
      expect(getByText('₹1,500')).toBeTruthy();
      expect(getByText('₹2,800')).toBeTruthy();
    });

    it('shows hourly rate breakdown', () => {
      const { getByText } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
        />
      );

      expect(getByText(/₹200\/hour/)).toBeTruthy(); // Base rate
    });
  });

  describe('Duration Validation', () => {
    it('validates minimum duration of 2 hours', () => {
      const { queryByText } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
        />
      );

      expect(queryByText('1 Hour')).toBeNull();
    });

    it('validates maximum duration of 12 hours', () => {
      const { queryByText } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
        />
      );

      expect(queryByText('24 Hours')).toBeNull();
    });

    it('shows error for invalid custom duration', async () => {
      const { getByTestId, getByText } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
          allowCustomDuration
        />
      );

      const customInput = getByTestId('custom-duration-input');
      fireEvent.changeText(customInput, '1');
      fireEvent.press(getByTestId('custom-duration-submit'));

      await waitFor(() => {
        expect(getByText('Minimum duration is 2 hours')).toBeTruthy();
      });
    });

    it('shows error for duration exceeding maximum', async () => {
      const { getByTestId, getByText } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
          allowCustomDuration
        />
      );

      const customInput = getByTestId('custom-duration-input');
      fireEvent.changeText(customInput, '15');
      fireEvent.press(getByTestId('custom-duration-submit'));

      await waitFor(() => {
        expect(getByText('Maximum duration is 12 hours')).toBeTruthy();
      });
    });
  });

  describe('Pricing Calculations', () => {
    beforeEach(() => {
      (bookingStore.getDurationPrice as jest.Mock).mockImplementation((hours: number) => {
        const baseRate = 200;
        let multiplier = 1;
        
        // Peak hours multiplier
        if (hours >= 8) multiplier = 1.2;
        if (hours >= 12) multiplier = 1.5;
        
        return baseRate * hours * multiplier;
      });
    });

    it('calculates base pricing correctly', () => {
      const { getByTestId } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
        />
      );

      const fourHourPrice = getByTestId('duration-price-4');
      expect(fourHourPrice).toHaveTextContent('₹800');
    });

    it('applies peak hour multiplier for 8+ hours', () => {
      const { getByTestId } = render(
        <DurationSelector 
          selectedDuration={8}
          onDurationChange={mockOnDurationChange}
        />
      );

      const eightHourPrice = getByTestId('duration-price-8');
      expect(eightHourPrice).toHaveTextContent('₹1,920'); // 200 * 8 * 1.2
    });

    it('applies extended duration multiplier for 12+ hours', () => {
      const { getByTestId } = render(
        <DurationSelector 
          selectedDuration={12}
          onDurationChange={mockOnDurationChange}
        />
      );

      const twelveHourPrice = getByTestId('duration-price-12');
      expect(twelveHourPrice).toHaveTextContent('₹3,600'); // 200 * 12 * 1.5
    });

    it('shows pricing breakdown tooltip', async () => {
      const { getByTestId, getByText } = render(
        <DurationSelector 
          selectedDuration={8}
          onDurationChange={mockOnDurationChange}
        />
      );

      const priceInfo = getByTestId('price-info-8');
      fireEvent.press(priceInfo);

      await waitFor(() => {
        expect(getByText('Base Rate: ₹200/hour')).toBeTruthy();
        expect(getByText('Duration: 8 hours')).toBeTruthy();
        expect(getByText('Peak Hour Multiplier: 1.2x')).toBeTruthy();
      });
    });
  });

  describe('Surge Pricing', () => {
    it('displays surge multiplier when active', () => {
      (bookingStore.getDurationPrice as jest.Mock).mockReturnValue(1000);
      const surgeMultiplier = 1.5;

      const { getByText } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
          surgeMultiplier={surgeMultiplier}
        />
      );

      expect(getByText('Surge Pricing Active')).toBeTruthy();
      expect(getByText('1.5x')).toBeTruthy();
    });

    it('calculates surge pricing correctly', () => {
      (bookingStore.getDurationPrice as jest.Mock).mockReturnValue(800);
      const surgeMultiplier = 2.0;

      const { getByTestId } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
          surgeMultiplier={surgeMultiplier}
        />
      );

      const surgePrice = getByTestId('surge-price-4');
      expect(surgePrice).toHaveTextContent('₹1,600'); // 800 * 2.0
    });

    it('shows original price with strikethrough during surge', () => {
      (bookingStore.getDurationPrice as jest.Mock).mockReturnValue(800);

      const { getByTestId } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
          surgeMultiplier={1.5}
        />
      );

      const originalPrice = getByTestId('original-price-4');
      expect(originalPrice).toHaveStyle({ textDecorationLine: 'line-through' });
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByLabelText } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
        />
      );

      expect(getByLabelText('Select 2 hours duration for ₹400')).toBeTruthy();
      expect(getByLabelText('Select 4 hours duration for ₹800')).toBeTruthy();
    });

    it('announces selection changes', async () => {
      const { getByText } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
        />
      );

      fireEvent.press(getByText('8 Hours'));

      // Would need to test with accessibility testing tools
      // This is a placeholder for accessibility announcement testing
      expect(mockOnDurationChange).toHaveBeenCalledWith(8);
    });
  });

  describe('Integration with Booking Store', () => {
    it('updates booking store when duration changes', () => {
      const { getByText } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={(duration) => {
            bookingStore.setDuration(duration);
            mockOnDurationChange(duration);
          }}
        />
      );

      fireEvent.press(getByText('8 Hours'));

      expect(bookingStore.setDuration).toHaveBeenCalledWith(8);
    });

    it('retrieves current pricing from store', () => {
      render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
        />
      );

      expect(bookingStore.getDurationPrice).toHaveBeenCalledWith(2);
      expect(bookingStore.getDurationPrice).toHaveBeenCalledWith(4);
      expect(bookingStore.getDurationPrice).toHaveBeenCalledWith(8);
      expect(bookingStore.getDurationPrice).toHaveBeenCalledWith(12);
    });
  });

  describe('Error Handling', () => {
    it('handles pricing calculation errors gracefully', () => {
      (bookingStore.getDurationPrice as jest.Mock).mockImplementation(() => {
        throw new Error('Pricing service unavailable');
      });

      const { getByText } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
        />
      );

      expect(getByText('Price unavailable')).toBeTruthy();
    });

    it('shows retry option when pricing fails', async () => {
      (bookingStore.getDurationPrice as jest.Mock)
        .mockImplementationOnce(() => {
          throw new Error('Network error');
        })
        .mockReturnValue(800);

      const { getByText, getByTestId } = render(
        <DurationSelector 
          selectedDuration={4}
          onDurationChange={mockOnDurationChange}
        />
      );

      const retryButton = getByTestId('retry-pricing');
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(getByText('₹800')).toBeTruthy();
      });
    });
  });
});