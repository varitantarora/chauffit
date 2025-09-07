import React, { Component, ReactNode } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightColors } from '../../constants/Colors';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: any, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  enableErrorReporting?: boolean;
  showErrorDetails?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report error if enabled
    if (this.props.enableErrorReporting) {
      this.reportError(error, errorInfo);
    }

    // Save error to local storage for debugging
    this.saveErrorToStorage(error, errorInfo);
  }

  private saveErrorToStorage = async (error: Error, errorInfo: any) => {
    try {
      const errorData = {
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: 'React Native App',
      };

      const existingErrors = await AsyncStorage.getItem('app_errors');
      const errors = existingErrors ? JSON.parse(existingErrors) : [];
      errors.push(errorData);

      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }

      await AsyncStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (storageError) {
      console.error('Failed to save error to storage:', storageError);
    }
  };

  private reportError = async (error: Error, errorInfo: any) => {
    try {
      // In a real implementation, you would send this to your error reporting service
      // like Sentry, Bugsnag, or your own backend
      const errorReport = {
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: 'react-native-app',
        userAgent: 'React Native App',
        appVersion: '1.0.0', // Get from app config
        platform: 'mobile',
      };

      console.log('Error report:', errorReport);
      
      // Example API call:
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });
      
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleShareError = async () => {
    try {
      const { error, errorInfo, errorId } = this.state;
      if (!error) return;

      const errorText = `
Error ID: ${errorId}
Time: ${new Date().toLocaleString()}
Message: ${error.message}

Stack Trace:
${error.stack || 'No stack trace available'}

Component Stack:
${errorInfo?.componentStack || 'No component stack available'}
      `.trim();

      await Share.share({
        message: errorText,
        title: 'App Error Report',
      });
    } catch (shareError) {
      console.error('Failed to share error:', shareError);
    }
  };

  private handleReportBug = () => {
    Alert.alert(
      'Report Bug',
      'Would you like to report this bug to help us improve the app?',
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Report', 
          onPress: () => {
            // In a real app, this might open an email client or bug report form
            Alert.alert(
              'Thank You', 
              'Your bug report has been sent. We appreciate your feedback!'
            );
          }
        },
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state;
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(error!, errorInfo, this.handleRetry);
      }

      // Default error UI
      return (
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="bg-red-50 px-4 py-6 border-b border-red-100">
            <View className="items-center">
              <Ionicons name="warning" size={48} color={LightColors.danger} />
              <Text className="text-xl font-bold text-black mt-4">
                Something went wrong
              </Text>
              <Text className="text-sm text-gray-600 mt-2 text-center">
                The app encountered an unexpected error. We apologize for the inconvenience.
              </Text>
              {errorId && (
                <Text className="text-xs text-gray-500 mt-2">
                  Error ID: {errorId}
                </Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="p-4">
            <TouchableOpacity
              className="bg-secondary p-4 rounded-lg flex-row items-center justify-center mb-4"
              style={{ backgroundColor: LightColors.secondary }}
              onPress={this.handleRetry}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Try Again</Text>
            </TouchableOpacity>

            <View className="flex-row space-x-2">
              <TouchableOpacity
                className="flex-1 bg-gray-100 p-3 rounded-lg flex-row items-center justify-center"
                onPress={this.handleReportBug}
              >
                <Ionicons name="bug" size={18} color={LightColors.textSecondary} />
                <Text className="text-gray-700 font-medium ml-2 text-sm">
                  Report Bug
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-gray-100 p-3 rounded-lg flex-row items-center justify-center"
                onPress={this.handleShareError}
              >
                <Ionicons name="share" size={18} color={LightColors.textSecondary} />
                <Text className="text-gray-700 font-medium ml-2 text-sm">
                  Share Error
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Details (if enabled) */}
          {this.props.showErrorDetails && error && (
            <View className="flex-1">
              <TouchableOpacity
                className="px-4 py-2 bg-gray-50 border-t border-gray-200"
                onPress={() => {
                  // Toggle error details visibility
                }}
              >
                <Text className="text-sm font-medium text-gray-700">
                  Show Error Details
                </Text>
              </TouchableOpacity>
              
              <ScrollView className="flex-1 bg-gray-50 p-4">
                <Text className="text-xs font-mono text-gray-600 leading-4">
                  <Text className="font-bold">Error Message:</Text>{'\n'}
                  {error.message}
                  {'\n\n'}
                  <Text className="font-bold">Stack Trace:</Text>{'\n'}
                  {error.stack}
                  {'\n\n'}
                  {errorInfo?.componentStack && (
                    <>
                      <Text className="font-bold">Component Stack:</Text>{'\n'}
                      {errorInfo.componentStack}
                    </>
                  )}
                </Text>
              </ScrollView>
            </View>
          )}

          {/* Footer */}
          <View className="p-4 bg-gray-50 border-t border-gray-200">
            <Text className="text-xs text-gray-500 text-center">
              If this problem persists, please contact support or try restarting the app.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: any) => {
    console.error('Error caught by error handler:', error, errorInfo);
    
    // You can trigger error reporting here
    // reportErrorToService(error, errorInfo);
    
    Alert.alert(
      'Error',
      'An error occurred. Please try again or contact support if the problem persists.',
      [{ text: 'OK' }]
    );
  }, []);

  return { handleError };
};

// HOC to wrap components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Utility function to get stored errors for debugging
export const getStoredErrors = async (): Promise<any[]> => {
  try {
    const errors = await AsyncStorage.getItem('app_errors');
    return errors ? JSON.parse(errors) : [];
  } catch (error) {
    console.error('Failed to get stored errors:', error);
    return [];
  }
};

// Utility function to clear stored errors
export const clearStoredErrors = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('app_errors');
  } catch (error) {
    console.error('Failed to clear stored errors:', error);
  }
};

export default ErrorBoundary;