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

  const renderPropertyEditor = (key: string, value: any, type: string = 'text') => {
    switch (type) {
      case 'select':
        const options = getSelectOptions(key, selectedElement?.type);
        return (
          <Select value={value} onValueChange={(newValue) => updateProperty(key, newValue)}>
            <SelectTrigger>
              <SelectValue />
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
            value={value}
            onChange={(e) => updateProperty(key, e.target.value)}
            rows={3}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateProperty(key, parseInt(e.target.value) || 0)}
          />
        );

      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={(checked) => updateProperty(key, checked)}
          />
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => updateProperty(key, e.target.value)}
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
              {getPropertyFields().map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="text-xs font-medium">
                    {field.label}
                  </Label>
                  {renderPropertyEditor(
                    field.key,
                    selectedElement.props[field.key],
                    field.type
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}

function getSelectOptions(key: string, elementType?: string) {
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
}