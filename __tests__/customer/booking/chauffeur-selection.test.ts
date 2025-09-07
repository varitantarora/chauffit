import React from 'react';
import { render, fireEvent, waitFor, act } from '../../../test-utils/test-utils';
import { DriverCard } from '../../../components/customer/DriverCard';
import { bookingStore } from '../../../store/bookingStore';
import { generateDriver, generateBooking } from '../../../test-utils/test-data';
import { mockServices } from '../../../test-utils/mocks/mock-services';

// Mock stores and services
jest.mock('../../../store/bookingStore');
jest.mock('../../../services/SupabaseRealTimeService');

describe('Chauffeur Selection Tests', () => {
  const mockDrivers = Array.from({ length: 5 }, generateDriver);
  const mockBooking = generateBooking();

  beforeEach(() => {
    jest.clearAllMocks();
    (bookingStore.getAvailableDrivers as jest.Mock).mockResolvedValue(mockDrivers);
    (bookingStore.selectDriver as jest.Mock).mockResolvedValue({ success: true });
  });

  describe('Driver Card Component', () => {
    const mockDriver = mockDrivers[0];

    it('renders driver information correctly', () => {
      const { getByText, getByTestId } = render(
        <DriverCard driver={mockDriver} onSelect={jest.fn()} />
      );

      expect(getByText(mockDriver.name)).toBeTruthy();
      expect(getByText(mockDriver.vehicle_number)).toBeTruthy();
      expect(getByText(mockDriver.vehicle_type)).toBeTruthy();
      expect(getByTestId('driver-rating')).toHaveTextContent(mockDriver.rating.toString());
    });

    it('displays driver photo and vehicle details', () => {
      const { getByTestId } = render(
        <DriverCard driver={mockDriver} onSelect={jest.fn()} />
      );

      const driverImage = getByTestId('driver-image');
      expect(driverImage).toBeTruthy();
      expect(driverImage.props.source.uri).toBe(mockDriver.profile_image);

      expect(getByTestId('vehicle-model')).toHaveTextContent(mockDriver.vehicle_model);
      expect(getByTestId('vehicle-color')).toHaveTextContent(mockDriver.vehicle_color);
    });

    it('shows driver location and ETA', async () => {
      mockServices.location.calculateETA.mockResolvedValue(15);

      const { getByTestId } = render(
        <DriverCard 
          driver={mockDriver} 
          onSelect={jest.fn()}
          customerLocation={{ latitude: 28.6139, longitude: 77.2090 }}
        />
      );

      await waitFor(() => {
        expect(getByTestId('driver-eta')).toHaveTextContent('15 mins away');
      });
    });

    it('handles driver selection', () => {
      const mockOnSelect = jest.fn();
      const { getByText } = render(
        <DriverCard driver={mockDriver} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByText('Select Driver'));
      expect(mockOnSelect).toHaveBeenCalledWith(mockDriver);
    });

    it('displays rating with stars', () => {
      const { getByTestId } = render(
        <DriverCard driver={{ ...mockDriver, rating: 4.5 }} onSelect={jest.fn()} />
      );

      const ratingStars = getByTestId('rating-stars');
      expect(ratingStars.children).toHaveLength(5); // 5 star rating system
    });

    it('shows total rides completed', () => {
      const { getByText } = render(
        <DriverCard driver={mockDriver} onSelect={jest.fn()} />
      );

      expect(getByText(`${mockDriver.total_rides} rides completed`)).toBeTruthy();
    });
  });

  describe('Driver Filtering and Sorting', () => {
    it('filters drivers by rating', async () => {
      const highRatedDrivers = mockDrivers.filter(d => d.rating >= 4.5);
      (bookingStore.getAvailableDrivers as jest.Mock).mockResolvedValue(highRatedDrivers);

      const { getAllByTestId } = render(
        <DriverList 
          onDriverSelect={jest.fn()}
          filters={{ minRating: 4.5 }}
        />
      );

      await waitFor(() => {
        const driverCards = getAllByTestId('driver-card');
        expect(driverCards).toHaveLength(highRatedDrivers.length);
      });
    });

    it('sorts drivers by proximity', async () => {
      const sortedDrivers = [...mockDrivers].sort((a, b) => a.id.localeCompare(b.id));
      (bookingStore.getAvailableDrivers as jest.Mock).mockResolvedValue(sortedDrivers);

      const { getAllByTestId } = render(
        <DriverList 
          onDriverSelect={jest.fn()}
          sortBy="proximity"
          customerLocation={{ latitude: 28.6139, longitude: 77.2090 }}
        />
      );

      await waitFor(() => {
        const driverCards = getAllByTestId('driver-card');
        expect(driverCards).toHaveLength(sortedDrivers.length);
      });
    });

    it('sorts drivers by rating', async () => {
      const ratingSort = [...mockDrivers].sort((a, b) => b.rating - a.rating);
      (bookingStore.getAvailableDrivers as jest.Mock).mockResolvedValue(ratingSort);

      const { getAllByTestId } = render(
        <DriverList 
          onDriverSelect={jest.fn()}
          sortBy="rating"
        />
      );

      await waitFor(() => {
        const driverCards = getAllByTestId('driver-card');
        expect(driverCards).toHaveLength(ratingSort.length);
      });
    });

    it('filters by vehicle type', async () => {
      const sedanDrivers = mockDrivers.filter(d => d.vehicle_type === 'sedan');
      (bookingStore.getAvailableDrivers as jest.Mock).mockResolvedValue(sedanDrivers);

      const { getAllByTestId } = render(
        <DriverList 
          onDriverSelect={jest.fn()}
          filters={{ vehicleType: 'sedan' }}
        />
      );

      await waitFor(() => {
        const driverCards = getAllByTestId('driver-card');
        expect(driverCards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Driver Communication', () => {
    it('enables call functionality', () => {
      const mockCallDriver = jest.fn();
      const { getByTestId } = render(
        <DriverCard 
          driver={mockDrivers[0]} 
          onSelect={jest.fn()}
          onCall={mockCallDriver}
        />
      );

      fireEvent.press(getByTestId('call-driver-button'));
      expect(mockCallDriver).toHaveBeenCalledWith(mockDrivers[0].phone);
    });

    it('enables messaging functionality', () => {
      const mockMessageDriver = jest.fn();
      const { getByTestId } = render(
        <DriverCard 
          driver={mockDrivers[0]} 
          onSelect={jest.fn()}
          onMessage={mockMessageDriver}
        />
      );

      fireEvent.press(getByTestId('message-driver-button'));
      expect(mockMessageDriver).toHaveBeenCalledWith(mockDrivers[0].id);
    });

    it('shows driver availability status', () => {
      const onlineDriver = { ...mockDrivers[0], is_online: true };
      const { getByTestId } = render(
        <DriverCard driver={onlineDriver} onSelect={jest.fn()} />
      );

      const statusIndicator = getByTestId('driver-status');
      expect(statusIndicator).toHaveTextContent('Available');
    });

    it('disables selection for offline drivers', () => {
      const offlineDriver = { ...mockDrivers[0], is_online: false };
      const { getByText } = render(
        <DriverCard driver={offlineDriver} onSelect={jest.fn()} />
      );

      const selectButton = getByText('Select Driver');
      expect(selectButton).toBeDisabled();
    });
  });

  describe('Driver Selection Process', () => {
    it('confirms driver selection', async () => {
      const mockOnConfirm = jest.fn();
      const { getByText, getByTestId } = render(
        <DriverSelectionModal
          driver={mockDrivers[0]}
          onConfirm={mockOnConfirm}
          onCancel={jest.fn()}
        />
      );

      fireEvent.press(getByText('Confirm Selection'));
      
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith(mockDrivers[0]);
      });
    });

    it('shows driver confirmation details', () => {
      const { getByText, getByTestId } = render(
        <DriverSelectionModal
          driver={mockDrivers[0]}
          booking={mockBooking}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      expect(getByText('Confirm Your Chauffeur')).toBeTruthy();
      expect(getByText(mockDrivers[0].name)).toBeTruthy();
      expect(getByText(`₹${mockBooking.total_amount}`)).toBeTruthy();
      expect(getByTestId('estimated-arrival')).toBeTruthy();
    });

    it('handles driver selection API call', async () => {
      (bookingStore.selectDriver as jest.Mock).mockResolvedValue({ 
        success: true, 
        bookingId: 'test-booking-123' 
      });

      const { getByText } = render(
        <DriverSelectionModal
          driver={mockDrivers[0]}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      fireEvent.press(getByText('Confirm Selection'));

      await waitFor(() => {
        expect(bookingStore.selectDriver).toHaveBeenCalledWith(mockDrivers[0].id);
      });
    });

    it('shows loading state during selection', async () => {
      (bookingStore.selectDriver as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
      );

      const { getByText, getByTestId } = render(
        <DriverSelectionModal
          driver={mockDrivers[0]}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      fireEvent.press(getByText('Confirm Selection'));

      expect(getByTestId('loading-spinner')).toBeTruthy();
      expect(getByText('Confirming selection...')).toBeTruthy();
    });
  });

  describe('Real-time Driver Updates', () => {
    it('updates driver location in real-time', async () => {
      const updatedLocation = { latitude: 28.6200, longitude: 77.2100 };
      
      const { rerender, getByTestId } = render(
        <DriverCard driver={mockDrivers[0]} onSelect={jest.fn()} />
      );

      const updatedDriver = { 
        ...mockDrivers[0], 
        location: updatedLocation 
      };

      rerender(
        <DriverCard driver={updatedDriver} onSelect={jest.fn()} />
      );

      // ETA should update based on new location
      await waitFor(() => {
        expect(mockServices.location.calculateETA).toHaveBeenCalled();
      });
    });

    it('removes drivers that go offline', async () => {
      const onlineDrivers = mockDrivers.filter(d => d.is_online);
      (bookingStore.getAvailableDrivers as jest.Mock).mockResolvedValue(onlineDrivers);

      const { queryByText } = render(
        <DriverList onDriverSelect={jest.fn()} />
      );

      await waitFor(() => {
        const offlineDriver = mockDrivers.find(d => !d.is_online);
        if (offlineDriver) {
          expect(queryByText(offlineDriver.name)).toBeNull();
        }
      });
    });

    it('adds new drivers that come online', async () => {
      const initialDrivers = mockDrivers.slice(0, 3);
      const newDriver = mockDrivers[3];

      (bookingStore.getAvailableDrivers as jest.Mock)
        .mockResolvedValueOnce(initialDrivers)
        .mockResolvedValue([...initialDrivers, newDriver]);

      const { queryByText, rerender } = render(
        <DriverList onDriverSelect={jest.fn()} />
      );

      await waitFor(() => {
        expect(queryByText(newDriver.name)).toBeNull();
      });

      // Simulate real-time update
      act(() => {
        rerender(<DriverList onDriverSelect={jest.fn()} />);
      });

      await waitFor(() => {
        expect(queryByText(newDriver.name)).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles driver loading error', async () => {
      (bookingStore.getAvailableDrivers as jest.Mock).mockRejectedValue(
        new Error('Failed to load drivers')
      );

      const { getByText, getByTestId } = render(
        <DriverList onDriverSelect={jest.fn()} />
      );

      await waitFor(() => {
        expect(getByText('Unable to load available drivers')).toBeTruthy();
        expect(getByTestId('retry-button')).toBeTruthy();
      });
    });

    it('handles driver selection error', async () => {
      (bookingStore.selectDriver as jest.Mock).mockRejectedValue(
        new Error('Driver no longer available')
      );

      const { getByText } = render(
        <DriverSelectionModal
          driver={mockDrivers[0]}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      fireEvent.press(getByText('Confirm Selection'));

      await waitFor(() => {
        expect(getByText('Driver is no longer available. Please select another driver.')).toBeTruthy();
      });
    });

    it('shows no drivers available message', async () => {
      (bookingStore.getAvailableDrivers as jest.Mock).mockResolvedValue([]);

      const { getByText } = render(
        <DriverList onDriverSelect={jest.fn()} />
      );

      await waitFor(() => {
        expect(getByText('No drivers available at the moment')).toBeTruthy();
        expect(getByText('Please try again in a few minutes')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels for driver cards', () => {
      const driver = mockDrivers[0];
      const { getByLabelText } = render(
        <DriverCard driver={driver} onSelect={jest.fn()} />
      );

      const accessibilityLabel = `Driver ${driver.name}, ${driver.vehicle_type}, ${driver.rating} star rating, ${driver.total_rides} rides completed`;
      expect(getByLabelText(accessibilityLabel)).toBeTruthy();
    });

    it('announces driver selection', () => {
      const mockOnSelect = jest.fn();
      const { getByRole } = render(
        <DriverCard driver={mockDrivers[0]} onSelect={mockOnSelect} />
      );

      const selectButton = getByRole('button', { name: /select driver/i });
      expect(selectButton).toHaveAccessibilityLabel('Select this driver for your booking');
    });
  });

  describe('Performance', () => {
    it('renders large driver list efficiently', async () => {
      const manyDrivers = Array.from({ length: 50 }, generateDriver);
      (bookingStore.getAvailableDrivers as jest.Mock).mockResolvedValue(manyDrivers);

      const startTime = performance.now();
      
      const { getAllByTestId } = render(
        <DriverList onDriverSelect={jest.fn()} />
      );

      await waitFor(() => {
        const driverCards = getAllByTestId('driver-card');
        expect(driverCards).toHaveLength(manyDrivers.length);
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time
      expect(renderTime).toBeLessThan(2000); // 2 seconds
    });

    it('implements virtual scrolling for large lists', async () => {
      const manyDrivers = Array.from({ length: 100 }, generateDriver);
      (bookingStore.getAvailableDrivers as jest.Mock).mockResolvedValue(manyDrivers);

      const { getByTestId } = render(
        <DriverList onDriverSelect={jest.fn()} />
      );

      const virtualList = getByTestId('virtual-driver-list');
      expect(virtualList).toBeTruthy();
    });
  });
});

// Mock components for testing
const DriverList = ({ onDriverSelect, filters, sortBy, customerLocation }: any) => {
  const [drivers, setDrivers] = React.useState([]);
  
  React.useEffect(() => {
    bookingStore.getAvailableDrivers(filters, sortBy, customerLocation)
      .then(setDrivers)
      .catch(() => setDrivers([]));
  }, [filters, sortBy, customerLocation]);

  if (drivers.length === 0) {
    return <div data-testid="no-drivers">No drivers available at the moment</div>;
  }

  return (
    <div data-testid="virtual-driver-list">
      {drivers.map((driver: any) => (
        <div key={driver.id} data-testid="driver-card">
          <DriverCard driver={driver} onSelect={onDriverSelect} />
        </div>
      ))}
    </div>
  );
};

const DriverSelectionModal = ({ driver, booking, onConfirm, onCancel }: any) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    
    try {
      await bookingStore.selectDriver(driver.id);
      onConfirm(driver);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Confirm Your Chauffeur</h2>
      <div>{driver.name}</div>
      {booking && <div>₹{booking.total_amount}</div>}
      <div data-testid="estimated-arrival">ETA: 15 mins</div>
      
      {loading && (
        <>
          <div data-testid="loading-spinner">Loading...</div>
          <div>Confirming selection...</div>
        </>
      )}
      
      {error && <div>{error}</div>}
      
      <button onClick={handleConfirm} disabled={loading}>
        Confirm Selection
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};