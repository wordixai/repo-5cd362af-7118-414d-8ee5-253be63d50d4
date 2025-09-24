import { useBuilder, BuilderElement } from './BuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ElementRendererProps {
  element: BuilderElement;
}

export function ElementRenderer({ element }: ElementRendererProps) {
  const { state, dispatch } = useBuilder();

  const handleClick = (e: React.MouseEvent) => {
    if (!state.previewMode) {
      e.stopPropagation();
      dispatch({ type: 'SELECT_ELEMENT', elementId: element.id });
    }
  };

  const handleMouseEnter = () => {
    if (!state.previewMode) {
      dispatch({ type: 'SET_HOVERED_ELEMENT', elementId: element.id });
    }
  };

  const handleMouseLeave = () => {
    if (!state.previewMode) {
      dispatch({ type: 'SET_HOVERED_ELEMENT', elementId: null });
    }
  };

  const isSelected = state.selectedElement === element.id;
  const isHovered = state.hoveredElement === element.id;

  const baseClassName = state.previewMode 
    ? '' 
    : cn(
        'builder-element',
        isSelected && 'selected',
        isHovered && !isSelected && 'hover:border-purple-300'
      );

  const childElements = state.elements.filter(el => el.parent === element.id);

  const renderElement = () => {
    switch (element.type) {
      case 'text':
        return (
          <div 
            className={cn(baseClassName, element.props.className)}
            style={element.props.style}
          >
            {element.props.content}
          </div>
        );

      case 'button':
        return (
          <Button
            variant={element.props.variant}
            className={cn(baseClassName, element.props.className)}
            style={element.props.style}
            onClick={state.previewMode ? undefined : (e) => e.preventDefault()}
          >
            {element.props.content}
          </Button>
        );

      case 'image':
        return (
          <img
            src={element.props.src}
            alt={element.props.alt}
            className={cn(baseClassName, element.props.className)}
            style={element.props.style}
          />
        );

      case 'separator':
        return (
          <Separator
            orientation={element.props.orientation}
            className={cn(baseClassName, element.props.className)}
            style={element.props.style}
          />
        );

      case 'container':
        return (
          <div
            className={cn(baseClassName, element.props.className)}
            style={element.props.style}
          >
            {childElements.map((child) => (
              <ElementRenderer key={child.id} element={child} />
            ))}
          </div>
        );

      case 'card':
        return (
          <Card 
            className={cn(baseClassName, element.props.className)}
            style={element.props.style}
          >
            <CardHeader>
              <CardTitle>{element.props.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{element.props.content}</p>
              {childElements.map((child) => (
                <ElementRenderer key={child.id} element={child} />
              ))}
            </CardContent>
          </Card>
        );

      case 'grid':
        return (
          <div
            className={cn(baseClassName, element.props.className)}
            style={{
              ...element.props.style,
              gridTemplateColumns: `repeat(${element.props.columns}, 1fr)`,
              gap: `${element.props.gap * 0.25}rem`
            }}
          >
            {childElements.map((child) => (
              <ElementRenderer key={child.id} element={child} />
            ))}
          </div>
        );

      case 'stack':
        return (
          <div
            className={cn(
              baseClassName,
              element.props.direction === 'horizontal' ? 'flex flex-row' : 'flex flex-col',
              element.props.className
            )}
            style={{
              ...element.props.style,
              gap: `${element.props.gap * 0.25}rem`
            }}
          >
            {childElements.map((child) => (
              <ElementRenderer key={child.id} element={child} />
            ))}
          </div>
        );

      case 'input':
        return (
          <Input
            type={element.props.type}
            placeholder={element.props.placeholder}
            className={cn(baseClassName, element.props.className)}
            style={element.props.style}
            readOnly={!state.previewMode}
          />
        );

      case 'checkbox':
        return (
          <div 
            className={cn(baseClassName, 'flex items-center space-x-2')}
            style={element.props.style}
          >
            <Checkbox 
              checked={element.props.checked}
              disabled={!state.previewMode}
            />
            <label className="text-sm">{element.props.label}</label>
          </div>
        );

      default:
        return (
          <div className={cn(baseClassName, 'p-4 border border-dashed border-red-300 text-red-500')}>
            Unknown component: {element.type}
          </div>
        );
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {renderElement()}
    </div>
  );
}