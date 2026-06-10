import { useRouter } from 'next/router';
import { Base } from '../templates/Base';

const Index = () => {
  const router = useRouter();
  return <Base showLoginByDefault={router.query.login === '1'} />;
};

export default Index;
