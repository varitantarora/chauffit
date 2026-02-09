import { useLocalSearchParams } from 'expo-router';
import CarDetailsScreen from '../../components/customer/CarDetailsScreen';

export default function CustomerCarCreate() {
  const params = useLocalSearchParams<{ allowSkip?: string; postSaveRoute?: string }>();
  const allowSkip = params.allowSkip === '1' || params.allowSkip === 'true';
  const postSaveRoute = params.postSaveRoute ? decodeURIComponent(params.postSaveRoute) : undefined;

  return <CarDetailsScreen allowSkip={allowSkip} postSaveRoute={postSaveRoute} />;
}
