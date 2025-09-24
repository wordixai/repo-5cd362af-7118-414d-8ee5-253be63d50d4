import { BuilderElement } from './BuilderContext';
import { cn } from '@/lib/utils';

interface DragPreviewProps {
  element: BuilderElement;
  position: { x: number; y: number };
}

export function DragPreview({ element, position }: DragPreviewProps) {
  const renderPreview = () => {
    switch (element.type) {
      case 'text':
        return (
          <div className="p-2 bg-gray-100 border rounded text-sm">
            📝 {element.props.content}
          </div>
        );
      
      case 'button':
        return (
          <div className="px-3 py-1 bg-blue-100 border rounded text-sm">
            🔘 {element.props.content}
          </div>
        );
      
      case 'image':
        return (
          <div className="p-2 bg-purple-100 border rounded text-sm">
            🖼️ Image
          </div>
        );
      
      case 'container':
        return (
          <div className="p-2 bg-green-100 border rounded text-sm">
            📦 Container
          </div>
        );
      
      case 'card':
        return (
          <div className="p-2 bg-yellow-100 border rounded text-sm">
            🃏 Card
          </div>
        );
      
      case 'input':
        return (
          <div className="p-2 bg-indigo-100 border rounded text-sm">
            📝 Input
          </div>
        );
      
      default:
        return (
          <div className="p-2 bg-gray-100 border rounded text-sm">
            ❓ {element.type}
          </div>
        );
    }
  };

  return (
    <div
      className="fixed pointer-events-none z-50 opacity-70"
      style={{
        left: position.x + 10,
        top: position.y + 10,
        transform: 'rotate(5deg)',
      }}
    >
      {renderPreview()}
    </div>
  );
}