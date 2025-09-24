import { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Type, 
  Square, 
  Image, 
  Minus, 
  CheckSquare,
  MousePointer,
  Layout,
  Grid3X3,
  Layers,
  AlignLeft
} from 'lucide-react';

const componentCategories = [
  {
    name: 'Basic',
    components: [
      {
        type: 'text',
        label: 'Text',
        icon: Type,
        defaultProps: { content: 'Sample Text', className: 'text-base' }
      },
      {
        type: 'button',
        label: 'Button',
        icon: MousePointer,
        defaultProps: { content: 'Click me', variant: 'default' }
      },
      {
        type: 'image',
        label: 'Image',
        icon: Image,
        defaultProps: { src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400', alt: 'Placeholder', className: 'w-32 h-32 object-cover rounded' }
      },
      {
        type: 'separator',
        label: 'Separator',
        icon: Minus,
        defaultProps: { orientation: 'horizontal' }
      }
    ]
  },
  {
    name: 'Layout',
    components: [
      {
        type: 'container',
        label: 'Container',
        icon: Square,
        defaultProps: { className: 'p-4 border-2 border-dashed border-gray-300 rounded min-h-24' }
      },
      {
        type: 'card',
        label: 'Card',
        icon: Layout,
        defaultProps: { title: 'Card Title', content: 'Card content goes here.' }
      },
      {
        type: 'grid',
        label: 'Grid',
        icon: Grid3X3,
        defaultProps: { columns: 2, gap: 4, className: 'grid grid-cols-2 gap-4 p-4 border border-dashed rounded' }
      },
      {
        type: 'stack',
        label: 'Stack',
        icon: Layers,
        defaultProps: { direction: 'vertical', gap: 2, className: 'flex flex-col gap-2 p-4 border border-dashed rounded' }
      }
    ]
  },
  {
    name: 'Forms',
    components: [
      {
        type: 'input',
        label: 'Input',
        icon: AlignLeft,
        defaultProps: { placeholder: 'Enter text...', type: 'text' }
      },
      {
        type: 'checkbox',
        label: 'Checkbox',
        icon: CheckSquare,
        defaultProps: { label: 'Check me', checked: false }
      }
    ]
  }
];

export function ComponentLibrary() {
  const { dispatch } = useBuilder();
  const [draggedComponent, setDraggedComponent] = useState<any>(null);

  const handleDragStart = (component: any) => {
    setDraggedComponent(component);
    const element = {
      id: `${component.type}_${Date.now()}`,
      type: component.type,
      props: component.defaultProps
    };
    dispatch({ type: 'SET_DRAGGED_ELEMENT', element });
  };

  const handleDragEnd = () => {
    setDraggedComponent(null);
    dispatch({ type: 'SET_DRAGGED_ELEMENT', element: null });
  };

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Components</h2>
        <p className="text-sm text-sidebar-foreground/70">Drag components to the canvas</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {componentCategories.map((category) => (
            <div key={category.name}>
              <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
                {category.name}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {category.components.map((component) => {
                  const IconComponent = component.icon;
                  return (
                    <Card
                      key={component.type}
                      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={() => handleDragStart(component)}
                      onDragEnd={handleDragEnd}
                    >
                      <CardContent className="p-3 text-center">
                        <IconComponent className="w-6 h-6 mx-auto mb-2 text-sidebar-foreground" />
                        <span className="text-xs font-medium text-sidebar-foreground">
                          {component.label}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {category !== componentCategories[componentCategories.length - 1] && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}