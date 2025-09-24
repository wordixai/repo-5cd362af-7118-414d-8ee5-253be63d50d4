import { BuilderProvider } from '@/components/builder/BuilderContext';
import { AppBuilder } from '@/components/builder/AppBuilder';

const Index = () => {
  return (
    <BuilderProvider>
      <AppBuilder />
    </BuilderProvider>
  );
};

export default Index;