# Chauffit Premium Mobile Components Specification

## Design System Overview

### Color Tokens
```typescript
// Light Mode
const lightColors = {
  primary: '#D9D1C6',        // Pastel Gray - premium feel
  secondary: '#BD8C5E',      // Deer - warm accent
  burgundy: '#720C17',       // Icons and app bar
  success: '#10B981',        // Green confirmations
  danger: '#EF4444',         // Red SOS/emergency
  textPrimary: '#000000',    // Black primary text
  textSecondary: '#314B4C',  // Dark slate gray
  background: '#FFFFFF',     // Pure white
  surface: '#F9F9F9',        // Light gray surface
  border: '#E5E5E5',         // Light border
}

// Dark Mode
const darkColors = {
  primary: '#D9D1C6',        // Maintained for contrast
  secondary: '#BD8C5E',      // Maintained for warmth
  burgundy: '#720C17',       // Maintained brand color
  success: '#10B981',        // Green confirmations
  danger: '#EF4444',         // Red SOS/emergency
  textPrimary: '#D9D1C6',    // Pastel gray text
  textSecondary: '#999999',  // Mid-gray secondary
  background: '#1A1A1A',     // Deep near-black
  surface: '#2C2C2C',        // Lighter dark gray
  border: '#4A4A4A',         // Darker gray borders
}
```

### Typography Scale
```typescript
const typography = {
  display: 'text-4xl font-bold',    // 36px - Hero headlines
  h1: 'text-3xl font-bold',         // 30px - Page titles
  h2: 'text-2xl font-semibold',     // 24px - Section headers
  h3: 'text-xl font-semibold',      // 20px - Card titles
  body: 'text-base font-normal',    // 16px - Default text
  small: 'text-sm font-normal',     // 14px - Secondary text
  tiny: 'text-xs font-normal',      // 12px - Captions
}
```

### Spacing System
```typescript
const spacing = {
  xs: 'p-1',      // 4px
  sm: 'p-2',      // 8px
  md: 'p-4',      // 16px
  lg: 'p-6',      // 24px
  xl: 'p-8',      // 32px
  xxl: 'p-12',    // 48px
}
```

## Customer App Components

### 1. BookingCard Component

```typescript
interface BookingCardProps {
  onBook?: () => void;
  onSchedule?: () => void;
  isDarkMode?: boolean;
}
```

#### Structure & Styling
```jsx
<View className={`
  bg-white dark:bg-gray-800 
  rounded-2xl 
  p-6 
  mx-4 
  shadow-lg 
  shadow-black/10 
  dark:shadow-black/30
  border 
  border-gray-100 
  dark:border-gray-700
`}>
  {/* Car Details Section */}
  <View className="mb-6">
    <Text className="text-xl font-semibold text-black dark:text-gray-100 mb-4">
      Vehicle Details
    </Text>
    
    <View className="space-y-3">
      <TextInput
        placeholder="Car Make (e.g., BMW)"
        className={`
          bg-gray-50 dark:bg-gray-700
          border border-gray-200 dark:border-gray-600
          rounded-xl
          px-4 py-3
          text-base
          text-black dark:text-white
          placeholder:text-gray-500 dark:placeholder:text-gray-400
        `}
      />
      
      <TextInput
        placeholder="Model (e.g., X5)"
        className={`
          bg-gray-50 dark:bg-gray-700
          border border-gray-200 dark:border-gray-600
          rounded-xl
          px-4 py-3
          text-base
          text-black dark:text-white
          placeholder:text-gray-500 dark:placeholder:text-gray-400
        `}
      />
      
      <TextInput
        placeholder="Registration Number"
        className={`
          bg-gray-50 dark:bg-gray-700
          border border-gray-200 dark:border-gray-600
          rounded-xl
          px-4 py-3
          text-base
          text-black dark:text-white
          placeholder:text-gray-500 dark:placeholder:text-gray-400
        `}
      />
    </View>
  </View>

  {/* Duration Selector */}
  <View className="mb-6">
    <Text className="text-xl font-semibold text-black dark:text-gray-100 mb-4">
      Duration
    </Text>
    
    <View className="flex-row space-x-3">
      {['2hr', '4hr', '8hr', 'Custom'].map((duration) => (
        <TouchableOpacity
          key={duration}
          className={`
            flex-1
            py-3
            rounded-xl
            border-2
            ${selected === duration 
              ? 'border-[#BD8C5E] bg-[#BD8C5E]/10' 
              : 'border-gray-200 dark:border-gray-600'
            }
          `}
        >
          <Text className={`
            text-center font-semibold
            ${selected === duration 
              ? 'text-[#BD8C5E]' 
              : 'text-gray-600 dark:text-gray-400'
            }
          `}>
            {duration}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>

  {/* Booking Type Toggle */}
  <View className="mb-6">
    <View className={`
      flex-row
      bg-gray-100 dark:bg-gray-700
      rounded-xl
      p-1
    `}>
      <TouchableOpacity
        className={`
          flex-1
          py-3
          rounded-lg
          ${isImmediate 
            ? 'bg-white dark:bg-gray-600 shadow-sm' 
            : ''
          }
        `}
      >
        <Text className={`
          text-center font-semibold
          ${isImmediate 
            ? 'text-[#720C17]' 
            : 'text-gray-600 dark:text-gray-400'
          }
        `}>
          Book Now
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        className={`
          flex-1
          py-3
          rounded-lg
          ${!isImmediate 
            ? 'bg-white dark:bg-gray-600 shadow-sm' 
            : ''
          }
        `}
      >
        <Text className={`
          text-center font-semibold
          ${!isImmediate 
            ? 'text-[#720C17]' 
            : 'text-gray-600 dark:text-gray-400'
          }
        `}>
          Schedule
        </Text>
      </TouchableOpacity>
    </View>
  </View>

  {/* Action Button */}
  <TouchableOpacity
    className={`
      bg-[#720C17]
      rounded-xl
      py-4
      shadow-lg
      shadow-[#720C17]/20
    `}
    activeOpacity={0.8}
  >
    <Text className="text-white text-lg font-semibold text-center">
      Request Driver
    </Text>
  </TouchableOpacity>
</View>
```

#### Interactive States
- **Default**: Clean, professional appearance
- **Pressed**: Slight scale animation (0.98)
- **Loading**: Spinner with "Searching for drivers..."
- **Disabled**: Reduced opacity (0.6)

### 2. DriverCard Component

```typescript
interface DriverCardProps {
  driver: {
    id: string;
    name: string;
    photo: string;
    rating: number;
    experience: number;
    certifications: string[];
    eta: string;
    phone: string;
  };
  onCall?: () => void;
  onMessage?: () => void;
}
```

#### Structure & Styling
```jsx
<View className={`
  bg-white dark:bg-gray-800
  rounded-2xl
  p-6
  mx-4
  mb-4
  shadow-lg
  shadow-black/10
  dark:shadow-black/30
  border
  border-gray-100
  dark:border-gray-700
`}>
  {/* Driver Header */}
  <View className="flex-row items-center mb-4">
    <View className={`
      w-16 h-16
      rounded-full
      overflow-hidden
      border-3
      border-[#BD8C5E]
      mr-4
    `}>
      <Image
        source={{ uri: driver.photo }}
        className="w-full h-full"
        resizeMode="cover"
      />
    </View>
    
    <View className="flex-1">
      <Text className="text-xl font-bold text-black dark:text-white">
        {driver.name}
      </Text>
      
      <View className="flex-row items-center mt-1">
        <View className="flex-row items-center mr-3">
          {[1,2,3,4,5].map((star) => (
            <Icon
              key={star}
              name="star"
              size={14}
              color={star <= driver.rating ? '#BD8C5E' : '#E5E5E5'}
            />
          ))}
          <Text className="text-sm text-gray-600 dark:text-gray-400 ml-1">
            {driver.rating}
          </Text>
        </View>
        
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          {driver.experience}y exp
        </Text>
      </View>
    </View>
  </View>

  {/* Certifications */}
  <View className="flex-row flex-wrap mb-4">
    {driver.certifications.map((cert) => (
      <View
        key={cert}
        className={`
          bg-[#D9D1C6]/20
          px-3 py-1
          rounded-full
          mr-2 mb-2
        `}
      >
        <Text className="text-xs font-medium text-[#720C17]">
          {cert}
        </Text>
      </View>
    ))}
  </View>

  {/* ETA Display */}
  <View className={`
    bg-[#BD8C5E]/10
    rounded-xl
    p-4
    mb-4
    border
    border-[#BD8C5E]/20
  `}>
    <Text className="text-center text-lg font-semibold text-[#BD8C5E]">
      Arriving in {driver.eta}
    </Text>
  </View>

  {/* Contact Buttons */}
  <View className="flex-row space-x-3">
    <TouchableOpacity
      onPress={onCall}
      className={`
        flex-1
        bg-[#10B981]
        rounded-xl
        py-3
        flex-row
        items-center
        justify-center
      `}
    >
      <Icon name="phone" size={18} color="white" />
      <Text className="text-white font-semibold ml-2">Call</Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      onPress={onMessage}
      className={`
        flex-1
        border-2
        border-[#720C17]
        rounded-xl
        py-3
        flex-row
        items-center
        justify-center
      `}
    >
      <Icon name="message-circle" size={18} color="#720C17" />
      <Text className="text-[#720C17] font-semibold ml-2">Message</Text>
    </TouchableOpacity>
  </View>
</View>
```

### 3. TrackingMap Component

```typescript
interface TrackingMapProps {
  driverLocation: { latitude: number; longitude: number };
  userLocation: { latitude: number; longitude: number };
  eta: string;
  route?: any[];
}
```

#### Structure & Styling
```jsx
<View className="flex-1 relative">
  {/* Map Container */}
  <MapView
    className="flex-1"
    customMapStyle={isDarkMode ? darkMapStyle : lightMapStyle}
    showsUserLocation={true}
    followsUserLocation={false}
  >
    {/* Driver Marker */}
    <Marker coordinate={driverLocation}>
      <View className={`
        w-12 h-12
        bg-[#720C17]
        rounded-full
        items-center
        justify-center
        border-4
        border-white
        shadow-lg
      `}>
        <Icon name="car" size={20} color="white" />
      </View>
    </Marker>
    
    {/* Route Polyline */}
    {route && (
      <Polyline
        coordinates={route}
        strokeColor="#BD8C5E"
        strokeWidth={4}
        strokePattern={[1]}
      />
    )}
  </MapView>

  {/* ETA Overlay */}
  <View className={`
    absolute
    top-12
    left-4
    right-4
    bg-white/95 dark:bg-gray-800/95
    backdrop-blur-md
    rounded-2xl
    p-4
    shadow-lg
    shadow-black/20
  `}>
    <View className="flex-row items-center justify-between">
      <View>
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Driver arriving in
        </Text>
        <Text className="text-2xl font-bold text-[#720C17]">
          {eta}
        </Text>
      </View>
      
      <View className={`
        w-12 h-12
        bg-[#BD8C5E]/20
        rounded-full
        items-center
        justify-center
      `}>
        <Icon name="navigation" size={24} color="#BD8C5E" />
      </View>
    </View>
  </View>

  {/* Current Location Button */}
  <TouchableOpacity
    className={`
      absolute
      bottom-24
      right-4
      w-12 h-12
      bg-white dark:bg-gray-800
      rounded-full
      items-center
      justify-center
      shadow-lg
      shadow-black/20
    `}
  >
    <Icon name="crosshair" size={24} color="#720C17" />
  </TouchableOpacity>
</View>
```

## Driver App Components

### 4. JobCard Component

```typescript
interface JobCardProps {
  job: {
    id: string;
    customerName: string;
    pickupLocation: string;
    carDetails: {
      make: string;
      model: string;
      color: string;
    };
    duration: string;
    earnings: number;
    distance: string;
  };
  onAccept?: () => void;
  onDecline?: () => void;
}
```

#### Structure & Styling
```jsx
<View className={`
  bg-white dark:bg-gray-800
  rounded-2xl
  p-6
  mx-4
  mb-4
  shadow-lg
  shadow-black/10
  dark:shadow-black/30
  border-l-4
  border-l-[#BD8C5E]
`}>
  {/* Job Header */}
  <View className="flex-row items-center justify-between mb-4">
    <View className="flex-1">
      <Text className="text-xl font-bold text-black dark:text-white">
        {job.customerName}
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {job.pickupLocation}
      </Text>
    </View>
    
    <View className={`
      bg-[#10B981]/10
      px-3 py-1
      rounded-full
    `}>
      <Text className="text-[#10B981] font-semibold text-sm">
        {job.distance}
      </Text>
    </View>
  </View>

  {/* Car Details */}
  <View className={`
    bg-gray-50 dark:bg-gray-700
    rounded-xl
    p-4
    mb-4
    flex-row
    items-center
  `}>
    <View className={`
      w-12 h-12
      bg-[#BD8C5E]/20
      rounded-full
      items-center
      justify-center
      mr-4
    `}>
      <Icon name="car" size={24} color="#BD8C5E" />
    </View>
    
    <View className="flex-1">
      <Text className="text-lg font-semibold text-black dark:text-white">
        {job.carDetails.make} {job.carDetails.model}
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400">
        {job.carDetails.color}
      </Text>
    </View>
  </View>

  {/* Job Details */}
  <View className="flex-row justify-between mb-6">
    <View className="flex-1 items-center">
      <Text className="text-sm text-gray-600 dark:text-gray-400">Duration</Text>
      <Text className="text-lg font-bold text-[#720C17] mt-1">
        {job.duration}
      </Text>
    </View>
    
    <View className="w-px bg-gray-200 dark:bg-gray-600 mx-4" />
    
    <View className="flex-1 items-center">
      <Text className="text-sm text-gray-600 dark:text-gray-400">Earnings</Text>
      <Text className="text-lg font-bold text-[#BD8C5E] mt-1">
        ${job.earnings}
      </Text>
    </View>
  </View>

  {/* Action Buttons */}
  <View className="flex-row space-x-3">
    <TouchableOpacity
      onPress={onDecline}
      className={`
        flex-1
        border-2
        border-gray-300 dark:border-gray-600
        rounded-xl
        py-4
      `}
      activeOpacity={0.8}
    >
      <Text className="text-gray-600 dark:text-gray-400 font-semibold text-center">
        Decline
      </Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      onPress={onAccept}
      className={`
        flex-1
        bg-[#720C17]
        rounded-xl
        py-4
        shadow-lg
        shadow-[#720C17]/20
      `}
      activeOpacity={0.8}
    >
      <Text className="text-white font-semibold text-center text-lg">
        Accept Job
      </Text>
    </TouchableOpacity>
  </View>
</View>
```

### 5. OnlineToggle Component

```typescript
interface OnlineToggleProps {
  isOnline: boolean;
  onToggle?: (status: boolean) => void;
  currentLocation?: string;
}
```

#### Structure & Styling
```jsx
<View className={`
  bg-white dark:bg-gray-800
  rounded-2xl
  p-6
  mx-4
  shadow-lg
  shadow-black/10
  dark:shadow-black/30
  border
  border-gray-100
  dark:border-gray-700
`}>
  {/* Status Header */}
  <View className="items-center mb-6">
    <Text className="text-2xl font-bold text-black dark:text-white mb-2">
      Driver Status
    </Text>
    <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
      Toggle your availability to receive job requests
    </Text>
  </View>

  {/* Large Toggle Switch */}
  <View className="items-center mb-6">
    <TouchableOpacity
      onPress={() => onToggle?.(!isOnline)}
      className={`
        w-32 h-16
        rounded-full
        p-2
        ${isOnline 
          ? 'bg-[#10B981]' 
          : 'bg-gray-300 dark:bg-gray-600'
        }
        shadow-lg
      `}
      activeOpacity={0.8}
    >
      <View
        className={`
          w-12 h-12
          bg-white
          rounded-full
          shadow-lg
          items-center
          justify-center
          ${isOnline ? 'ml-auto' : 'ml-0'}
        `}
        style={{
          transform: [{
            translateX: isOnline ? 0 : 0
          }]
        }}
      >
        <Icon
          name={isOnline ? 'check' : 'x'}
          size={20}
          color={isOnline ? '#10B981' : '#EF4444'}
        />
      </View>
    </TouchableOpacity>
  </View>

  {/* Status Text */}
  <View className="items-center mb-6">
    <Text className={`
      text-2xl font-bold mb-2
      ${isOnline 
        ? 'text-[#10B981]' 
        : 'text-gray-500 dark:text-gray-400'
      }
    `}>
      {isOnline ? 'ONLINE' : 'OFFLINE'}
    </Text>
    <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
      {isOnline 
        ? 'You are available for job requests' 
        : 'You will not receive job requests'
      }
    </Text>
  </View>

  {/* Current Location */}
  {currentLocation && isOnline && (
    <View className={`
      bg-[#BD8C5E]/10
      rounded-xl
      p-4
      flex-row
      items-center
    `}>
      <Icon name="map-pin" size={20} color="#BD8C5E" />
      <View className="ml-3 flex-1">
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Current Location
        </Text>
        <Text className="text-base font-semibold text-black dark:text-white">
          {currentLocation}
        </Text>
      </View>
    </View>
  )}
</View>
```

## Biker App Components

### 6. TaskCard Component

```typescript
interface TaskCardProps {
  task: {
    id: string;
    type: 'driver_pickup' | 'emergency';
    pickupLocation: string;
    destination: string;
    distance: string;
    payout: number;
    timeLimit: number;
    urgency: 'low' | 'medium' | 'high';
  };
  onAccept?: () => void;
  timeRemaining?: number;
}
```

#### Structure & Styling
```jsx
<View className={`
  bg-white dark:bg-gray-800
  rounded-2xl
  p-6
  mx-4
  mb-4
  shadow-lg
  shadow-black/10
  dark:shadow-black/30
  ${task.type === 'emergency' 
    ? 'border-l-4 border-l-[#EF4444]' 
    : 'border-l-4 border-l-[#BD8C5E]'
  }
`}>
  {/* Task Header */}
  <View className="flex-row items-center justify-between mb-4">
    <View className="flex-1">
      <View className="flex-row items-center">
        <View className={`
          w-8 h-8
          rounded-full
          items-center
          justify-center
          mr-3
          ${task.type === 'emergency' 
            ? 'bg-[#EF4444]/20' 
            : 'bg-[#BD8C5E]/20'
          }
        `}>
          <Icon
            name={task.type === 'emergency' ? 'alert-triangle' : 'user'}
            size={16}
            color={task.type === 'emergency' ? '#EF4444' : '#BD8C5E'}
          />
        </View>
        <Text className="text-lg font-semibold text-black dark:text-white">
          {task.type === 'emergency' ? 'Emergency Pickup' : 'Driver Pickup'}
        </Text>
      </View>
      
      {task.type === 'emergency' && (
        <Text className="text-sm text-[#EF4444] font-medium mt-1">
          URGENT - Immediate Response Required
        </Text>
      )}
    </View>

    <View className={`
      px-3 py-1
      rounded-full
      ${task.urgency === 'high' 
        ? 'bg-[#EF4444]/20' 
        : task.urgency === 'medium'
        ? 'bg-[#F59E0B]/20'
        : 'bg-[#10B981]/20'
      }
    `}>
      <Text className={`
        text-xs font-bold uppercase
        ${task.urgency === 'high' 
          ? 'text-[#EF4444]' 
          : task.urgency === 'medium'
          ? 'text-[#F59E0B]'
          : 'text-[#10B981]'
        }
      `}>
        {task.urgency}
      </Text>
    </View>
  </View>

  {/* Location Details */}
  <View className="mb-4">
    <View className="flex-row items-start mb-3">
      <View className={`
        w-3 h-3
        bg-[#10B981]
        rounded-full
        mt-2
        mr-3
      `} />
      <View className="flex-1">
        <Text className="text-sm text-gray-600 dark:text-gray-400">From</Text>
        <Text className="text-base font-semibold text-black dark:text-white">
          {task.pickupLocation}
        </Text>
      </View>
    </View>
    
    <View className="w-px h-4 bg-gray-300 dark:bg-gray-600 ml-1.5 mb-3" />
    
    <View className="flex-row items-start">
      <View className={`
        w-3 h-3
        bg-[#EF4444]
        rounded-full
        mt-2
        mr-3
      `} />
      <View className="flex-1">
        <Text className="text-sm text-gray-600 dark:text-gray-400">To</Text>
        <Text className="text-base font-semibold text-black dark:text-white">
          {task.destination}
        </Text>
      </View>
    </View>
  </View>

  {/* Task Metrics */}
  <View className="flex-row justify-between mb-6">
    <View className="flex-1 items-center">
      <Text className="text-sm text-gray-600 dark:text-gray-400">Distance</Text>
      <Text className="text-lg font-bold text-[#720C17] mt-1">
        {task.distance}
      </Text>
    </View>
    
    <View className="w-px bg-gray-200 dark:bg-gray-600 mx-4" />
    
    <View className="flex-1 items-center">
      <Text className="text-sm text-gray-600 dark:text-gray-400">Payout</Text>
      <Text className="text-lg font-bold text-[#BD8C5E] mt-1">
        ${task.payout}
      </Text>
    </View>
    
    <View className="w-px bg-gray-200 dark:bg-gray-600 mx-4" />
    
    <View className="flex-1 items-center">
      <Text className="text-sm text-gray-600 dark:text-gray-400">Time Limit</Text>
      <Text className="text-lg font-bold text-[#720C17] mt-1">
        {task.timeLimit}min
      </Text>
    </View>
  </View>

  {/* Time Progress Bar (if accepted) */}
  {timeRemaining && (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Time Remaining
        </Text>
        <Text className="text-sm font-semibold text-[#720C17]">
          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </Text>
      </View>
      <View className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <View
          className={`
            h-full
            rounded-full
            ${timeRemaining > task.timeLimit * 60 * 0.5 
              ? 'bg-[#10B981]' 
              : timeRemaining > task.timeLimit * 60 * 0.2
              ? 'bg-[#F59E0B]'
              : 'bg-[#EF4444]'
            }
          `}
          style={{
            width: `${(timeRemaining / (task.timeLimit * 60)) * 100}%`
          }}
        />
      </View>
    </View>
  )}

  {/* Accept Button */}
  <TouchableOpacity
    onPress={onAccept}
    className={`
      ${task.type === 'emergency' 
        ? 'bg-[#EF4444]' 
        : 'bg-[#720C17]'
      }
      rounded-xl
      py-4
      shadow-lg
      ${task.type === 'emergency' 
        ? 'shadow-[#EF4444]/20' 
        : 'shadow-[#720C17]/20'
      }
    `}
    activeOpacity={0.8}
  >
    <Text className="text-white font-semibold text-center text-lg">
      {task.type === 'emergency' ? 'Accept Emergency' : 'Accept Task'}
    </Text>
  </TouchableOpacity>
</View>
```

## Shared Components

### Bottom Navigation

```typescript
interface BottomNavigationProps {
  activeTab: string;
  appType: 'customer' | 'driver' | 'biker';
  onTabChange: (tab: string) => void;
}
```

#### Structure & Styling
```jsx
<View className={`
  bg-white dark:bg-gray-800
  border-t
  border-gray-200 dark:border-gray-700
  px-4
  py-2
  pb-8
  shadow-lg
  shadow-black/5
`}>
  <View className="flex-row justify-around">
    {tabs.map((tab) => (
      <TouchableOpacity
        key={tab.name}
        onPress={() => onTabChange(tab.name)}
        className={`
          flex-1
          items-center
          py-2
          px-3
        `}
        activeOpacity={0.7}
      >
        <View className={`
          w-12 h-12
          rounded-full
          items-center
          justify-center
          mb-1
          ${activeTab === tab.name 
            ? 'bg-[#720C17]/10' 
            : ''
          }
        `}>
          <Icon
            name={tab.icon}
            size={22}
            color={activeTab === tab.name ? '#720C17' : '#9CA3AF'}
          />
        </View>
        <Text className={`
          text-xs font-medium
          ${activeTab === tab.name 
            ? 'text-[#720C17]' 
            : 'text-gray-500 dark:text-gray-400'
          }
        `}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>
```

### Customer App Fixed Action Buttons

```jsx
<View className={`
  absolute
  bottom-24
  left-4
  right-4
  flex-row
  space-x-3
`}>
  {/* Book Now Button */}
  <TouchableOpacity
    className={`
      flex-1
      bg-[#720C17]/90
      backdrop-blur-md
      rounded-2xl
      py-4
      px-6
      shadow-lg
      shadow-[#720C17]/20
      border
      border-white/10
    `}
    activeOpacity={0.8}
  >
    <Text className="text-white font-semibold text-center text-lg">
      Book Now
    </Text>
  </TouchableOpacity>

  {/* Schedule Button */}
  <TouchableOpacity
    className={`
      flex-1
      bg-white/90 dark:bg-gray-800/90
      backdrop-blur-md
      rounded-2xl
      py-4
      px-6
      shadow-lg
      shadow-black/10
      border
      border-[#BD8C5E]/20
    `}
    activeOpacity={0.8}
  >
    <Text className="text-[#BD8C5E] font-semibold text-center text-lg">
      Schedule
    </Text>
  </TouchableOpacity>
</View>
```

## Interactive States & Animations

### Component States
```css
/* Default State */
.component-default {
  opacity: 1;
  transform: scale(1);
  transition: all 0.2s ease;
}

/* Pressed State */
.component-pressed {
  opacity: 0.8;
  transform: scale(0.98);
}

/* Loading State */
.component-loading {
  opacity: 0.7;
  pointer-events: none;
}

/* Disabled State */
.component-disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* Hover State (for web) */
.component-hover {
  transform: scale(1.02);
  shadow: 0 8px 25px rgba(0,0,0,0.15);
}
```

### Animation Specifications
- **Button Press**: 150ms scale (0.98) with ease-out
- **Card Hover**: 200ms scale (1.02) with ease-in-out
- **Loading States**: 1s rotate infinite for spinners
- **Slide Transitions**: 300ms with ease-in-out
- **Fade Transitions**: 200ms opacity changes

## Accessibility Guidelines

### Touch Targets
- Minimum 44px x 44px for all interactive elements
- 8px minimum spacing between touch targets
- Clear visual feedback for all interactions

### Color Contrast
- Light mode: 4.5:1 minimum contrast ratio
- Dark mode: 4.5:1 minimum contrast ratio
- Error states: High contrast red (#EF4444)
- Success states: High contrast green (#10B981)

### Screen Reader Support
- Semantic HTML elements
- Proper ARIA labels
- Descriptive alt text for images
- Clear focus indicators

### Typography
- Minimum 16px font size for body text
- Clear font hierarchy
- High contrast text colors
- Readable line heights (1.5x minimum)

## Implementation Notes

### NativeWind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#D9D1C6',
        secondary: '#BD8C5E',
        burgundy: '#720C17',
        success: '#10B981',
        danger: '#EF4444',
      },
      fontFamily: {
        // Premium font stack
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
```

### Performance Optimizations
- Use `React.memo` for component optimization
- Implement lazy loading for heavy components
- Use `FlatList` for large data sets
- Optimize images with proper sizing
- Implement proper key props for lists

### Dark Mode Implementation
```javascript
// Theme context
const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

// Usage in components
const { isDarkMode } = useContext(ThemeContext);
const textColor = isDarkMode ? 'text-white' : 'text-black';
```

## Brand Guidelines

### Logo Usage
- Primary logo on burgundy backgrounds
- White logo on dark backgrounds
- Minimum 24px height for mobile
- Clear space equal to logo height

### Photography Style
- Professional, premium aesthetic
- High-quality vehicle photography
- Professional driver portraits
- Consistent lighting and color grading

### Voice & Tone
- Professional yet approachable
- Confident and reliable
- Premium service language
- Clear, concise communication

This specification provides a comprehensive foundation for implementing the Chauffit premium mobile app components with consistent styling, proper accessibility, and optimized performance for rapid development cycles.