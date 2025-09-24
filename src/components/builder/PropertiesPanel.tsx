import { useBuilder } from './BuilderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';

export function PropertiesPanel() {
  const { state, dispatch } = useBuilder();

  const selectedElement = state.elements.find(el => el.id === state.selectedElement);

  const updateProperty = (key: string, value: any) => {
    if (selectedElement) {
      dispatch({
        type: 'UPDATE_ELEMENT',
        elementId: selectedElement.id,
        props: { [key]: value }
      });
    }
  };

  const deleteElement = () => {
    if (selectedElement) {
      dispatch({ type: 'REMOVE_ELEMENT', elementId: selectedElement.id });
    }
  };

  const getSelectOptions = (key: string, elementType?: string) => {
    switch (key) {
      case 'variant':
        if (elementType === 'button') {
          return [
            { value: 'default', label: 'Default' },
            { value: 'destructive', label: 'Destructive' },
            { value: 'outline', label: 'Outline' },
            { value: 'secondary', label: 'Secondary' },
            { value: 'ghost', label: 'Ghost' },
            { value: 'link', label: 'Link' }
          ];
        }
        break;

      case 'direction':
        return [
          { value: 'vertical', label: 'Vertical' },
          { value: 'horizontal', label: 'Horizontal' }
        ];

      case 'type':
        if (elementType === 'input') {
          return [
            { value: 'text', label: 'Text' },
            { value: 'email', label: 'Email' },
            { value: 'password', label: 'Password' },
            { value: 'number', label: 'Number' }
          ];
        }
        break;

      case 'orientation':
        return [
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' }
        ];
    }

    return [];
  };

  const renderPropertyEditor = (key: string, value: any, type: string = 'text') => {
    // Ensure value is not undefined or null
    const safeValue = value ?? '';

    switch (type) {
      case 'select':
        const options = getSelectOptions(key, selectedElement?.type);
        return (
          <Select 
            value={String(safeValue)} 
            onValueChange={(newValue) => updateProperty(key, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select option..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            value={String(safeValue)}
            onChange={(e) => updateProperty(key, e.target.value)}
            rows={3}
            placeholder="Enter text..."
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={safeValue === '' ? '' : Number(safeValue)}
            onChange={(e) => updateProperty(key, parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        );

      case 'boolean':
        return (
          <Switch
            checked={Boolean(safeValue)}
            onCheckedChange={(checked) => updateProperty(key, checked)}
          />
        );

      default:
        return (
          <Input
            value={String(safeValue)}
            onChange={(e) => updateProperty(key, e.target.value)}
            placeholder="Enter value..."
          />
        );
    }
  };

  const getPropertyFields = () => {
    if (!selectedElement) return [];

    const common = [
      { key: 'className', label: 'CSS Classes', type: 'text' }
    ];

    switch (selectedElement.type) {
      case 'text':
        return [
          { key: 'content', label: 'Content', type: 'textarea' },
          ...common
        ];

      case 'button':
        return [
          { key: 'content', label: 'Text', type: 'text' },
          { key: 'variant', label: 'Variant', type: 'select' },
          ...common
        ];

      case 'image':
        return [
          { key: 'src', label: 'Image URL', type: 'text' },
          { key: 'alt', label: 'Alt Text', type: 'text' },
          ...common
        ];

      case 'card':
        return [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'content', label: 'Content', type: 'textarea' },
          ...common
        ];

      case 'grid':
        return [
          { key: 'columns', label: 'Columns', type: 'number' },
          { key: 'gap', label: 'Gap', type: 'number' },
          ...common
        ];

      case 'stack':
        return [
          { key: 'direction', label: 'Direction', type: 'select' },
          { key: 'gap', label: 'Gap', type: 'number' },
          ...common
        ];

      case 'input':
        return [
          { key: 'placeholder', label: 'Placeholder', type: 'text' },
          { key: 'type', label: 'Type', type: 'select' },
          ...common
        ];

      case 'checkbox':
        return [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'checked', label: 'Checked', type: 'boolean' },
          ...common
        ];

      case 'separator':
        return [
          { key: 'orientation', label: 'Orientation', type: 'select' },
          ...common
        ];

      case 'container':
        return common;

      default:
        return common;
    }
  };

  if (!selectedElement) {
    return (
      <div className="w-80 bg-sidebar border-l border-sidebar-border">
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Properties</h2>
          <p className="text-sm text-sidebar-foreground/70">Select an element to edit</p>
        </div>
        <div className="p-4 text-center text-sidebar-foreground/50">
          <div className="text-2xl mb-2">⚙️</div>
          <p>No element selected</p>
        </div>
      </div>
    );
  }

  const propertyFields = getPropertyFields();

  return (
    <div className="w-80 bg-sidebar border-l border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-sidebar-foreground">Properties</h2>
          <p className="text-sm text-sidebar-foreground/70">
            {selectedElement.type} • {selectedElement.id.split('_')[1]}
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={deleteElement}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Element Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {propertyFields.map((field) => {
                const currentValue = selectedElement.props[field.key];
                
                return (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key} className="text-xs font-medium">
                      {field.label}
                    </Label>
                    {renderPropertyEditor(
                      field.key,
                      currentValue,
                      field.type
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Element Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Element Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs">
                <span className="font-medium">ID:</span> {selectedElement.id}
              </div>
              <div className="text-xs">
                <span className="font-medium">Type:</span> {selectedElement.type}
              </div>
              {selectedElement.parent && (
                <div className="text-xs">
                  <span className="font-medium">Parent:</span> {selectedElement.parent}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}