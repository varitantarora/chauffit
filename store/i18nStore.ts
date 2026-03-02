import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'hi';

const LANGUAGE_KEY = '@chauffit_language';

// English translations
const en = {
  // Common
  online: 'Online',
  offline: 'Offline',
  tapToGoOffline: 'Tap to go offline',
  tapToGoOnline: 'Tap to go online',
  earnings: 'Earnings',
  trips: 'Trips',
  rating: 'Rating',
  drivingScore: 'Driving Score',
  todaysPerformance: "Today's Performance",
  weeklyGoals: 'Weekly Goals',
  quickActions: 'Quick Actions',
  recentActivity: 'Recent Activity',
  viewAll: 'View All',
  noRecentActivity: 'No Recent Activity',
  completeFirstRide: 'Complete your first ride to see activity here.',
  youAreOnline: 'You are online and available',
  youAreOffline: 'You are offline',
  viewRequests: 'View Requests',
  vehicle: 'Vehicle',
  navigation: 'Navigation',
  activeRide: 'Active Ride',
  tapToManage: 'Tap to manage',
  newRequests: 'New Requests',
  tapToViewRides: 'Tap to view and accept rides',
  availableBalance: 'Available Balance',
  lastPayout: 'Last Payout',
  processed: 'Processed',
  weeklyEarnings: 'Weekly Earnings',
  totalTrips: 'Total Trips',
  onlineHours: 'Online Hours',
  toGo: 'to go',
  goalAchieved: 'Goal achieved!',
  complete: 'complete',
  // Profile
  profile: 'Profile',
  myProfile: 'My Profile',
  driverProfile: 'Driver Profile',
  darkMode: 'Dark Mode',
  language: 'Language / भाषा',
  bankingDetails: 'Banking Details',
  notifications: 'Notifications',
  helpSupport: 'Help & Support',
  logout: 'Logout',
  accountInfo: 'ACCOUNT INFORMATION',
  memberSince: 'Member Since',
  licenseNumber: 'License Number',
  licenseExpiry: 'License Expiry',
  experience: 'Experience',
  // Requests
  rideRequests: 'Ride Requests',
  pendingRequests: 'pending requests',
  // Earnings page
  trackIncome: 'Track your income and performance',
  // Biker
  hello: 'Hello',
  readyForPickups: 'Ready for driver pickups',
  onShift: 'On Shift',
  offShift: 'Off Shift',
  activePickups: 'Active Pickups',
  todaysEarnings: "Today's Earnings",
  totalEarnings: 'Total Earnings',
  completedTrips: 'Completed Trips',
  driverPickups: 'Driver Pickups',
  noDriverPickups: 'No Driver Pickups Available',
  goOnlineToSee: 'Go Online to See Pickups',
  newPickupsWillAppear: 'New driver pickup requests will appear here',
  turnOnAvailability: 'Turn on your availability to start receiving driver pickups',
  yourActiveTasks: 'Your Active Tasks',
  driverPickupIncome: 'Driver pickup & transport income',
};

// Hindi translations
const hi: typeof en = {
  // Common
  online: 'ऑनलाइन',
  offline: 'ऑफ़लाइन',
  tapToGoOffline: 'ऑफ़लाइन होने के लिए टैप करें',
  tapToGoOnline: 'ऑनलाइन होने के लिए टैप करें',
  earnings: 'कमाई',
  trips: 'यात्राएं',
  rating: 'रेटिंग',
  drivingScore: 'ड्राइविंग स्कोर',
  todaysPerformance: 'आज का प्रदर्शन',
  weeklyGoals: 'साप्ताहिक लक्ष्य',
  quickActions: 'त्वरित कार्य',
  recentActivity: 'हाल की गतिविधि',
  viewAll: 'सभी देखें',
  noRecentActivity: 'कोई हालिया गतिविधि नहीं',
  completeFirstRide: 'गतिविधि देखने के लिए अपनी पहली सवारी पूरी करें।',
  youAreOnline: 'आप ऑनलाइन हैं और उपलब्ध हैं',
  youAreOffline: 'आप ऑफ़लाइन हैं',
  viewRequests: 'अनुरोध देखें',
  vehicle: 'वाहन',
  navigation: 'नेविगेशन',
  activeRide: 'सक्रिय सवारी',
  tapToManage: 'प्रबंधित करने के लिए टैप करें',
  newRequests: 'नए अनुरोध',
  tapToViewRides: 'सवारी देखने और स्वीकार करने के लिए टैप करें',
  availableBalance: 'उपलब्ध शेष',
  lastPayout: 'अंतिम भुगतान',
  processed: 'प्रोसेस्ड',
  weeklyEarnings: 'साप्ताहिक कमाई',
  totalTrips: 'कुल यात्राएं',
  onlineHours: 'ऑनलाइन घंटे',
  toGo: 'बाकी',
  goalAchieved: 'लक्ष्य प्राप्त!',
  complete: 'पूर्ण',
  // Profile
  profile: 'प्रोफ़ाइल',
  myProfile: 'मेरी प्रोफ़ाइल',
  driverProfile: 'ड्राइवर प्रोफ़ाइल',
  darkMode: 'डार्क मोड',
  language: 'Language / भाषा',
  bankingDetails: 'बैंकिंग विवरण',
  notifications: 'सूचनाएं',
  helpSupport: 'सहायता और समर्थन',
  logout: 'लॉगआउट',
  accountInfo: 'खाता जानकारी',
  memberSince: 'सदस्य बने',
  licenseNumber: 'लाइसेंस नंबर',
  licenseExpiry: 'लाइसेंस समाप्ति',
  experience: 'अनुभव',
  // Requests
  rideRequests: 'सवारी अनुरोध',
  pendingRequests: 'लंबित अनुरोध',
  // Earnings page
  trackIncome: 'अपनी आय और प्रदर्शन ट्रैक करें',
  // Biker
  hello: 'नमस्ते',
  readyForPickups: 'ड्राइवर पिकअप के लिए तैयार',
  onShift: 'शिफ्ट पर',
  offShift: 'शिफ्ट ऑफ',
  activePickups: 'सक्रिय पिकअप',
  todaysEarnings: 'आज की कमाई',
  totalEarnings: 'कुल कमाई',
  completedTrips: 'पूर्ण यात्राएं',
  driverPickups: 'ड्राइवर पिकअप',
  noDriverPickups: 'कोई ड्राइवर पिकअप उपलब्ध नहीं',
  goOnlineToSee: 'पिकअप देखने के लिए ऑनलाइन जाएं',
  newPickupsWillAppear: 'नए ड्राइवर पिकअप अनुरोध यहां दिखाई देंगे',
  turnOnAvailability: 'ड्राइवर पिकअप प्राप्त करना शुरू करने के लिए अपनी उपलब्धता चालू करें',
  yourActiveTasks: 'आपके सक्रिय कार्य',
  driverPickupIncome: 'ड्राइवर पिकअप और परिवहन आय',
};

const translations: Record<Language, typeof en> = { en, hi };

interface I18nState {
  language: Language;
  t: (key: keyof typeof en) => string;
  setLanguage: (lang: Language) => Promise<void>;
  initLanguage: () => Promise<void>;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  language: 'en',

  t: (key) => {
    const lang = get().language;
    return translations[lang][key] || translations.en[key] || key;
  },

  setLanguage: async (lang) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    set({ language: lang });
  },

  initLanguage: async () => {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved === 'hi' || saved === 'en') {
      set({ language: saved });
    }
  },
}));
