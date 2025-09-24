import { ComponentLibrary } from './ComponentLibrary';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { Toolbar } from './Toolbar';
import { CodePanel } from './CodePanel';
import { useState } from 'react';

export function AppBuilder() {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toolbar onToggleCode={() => setShowCode(!showCode)} showCode={showCode} />
      <div className="flex-1 flex overflow-hidden">
        <ComponentLibrary />
        <div className="flex-1 flex">
          <Canvas />
          {showCode && <CodePanel />}
        </div>
        <PropertiesPanel />
      </div>
    </div>
  );
}