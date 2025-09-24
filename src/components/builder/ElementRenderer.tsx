import { useBuilder, BuilderElement } from './BuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Move, GripVertical } from 'lucide-react';
import { useState, useRef } from 'react';

interface ElementRendererProps {
  element: BuilderElement;
}

export function ElementRenderer({ element }: ElementRendererProps) {
  const { state, dispatch } = useBuilder();
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

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

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    dispatch({ type: 'START_DRAG', element, fromLibrary: false });
    e.dataTransfer.setData('application/json', JSON.stringify(element));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    dispatch({ type: 'END_DRAG' });
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!state.dragState.isDragging || state.dragState.draggedElement?.id === element.id) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      const y = e.clientY - rect.top;
      const height = rect.height;
      
      // Determine drop position
      let newDropPosition: 'before' | 'after' | 'inside' | null = null;
      
      // Check if element accepts children
      const acceptsChildren = element.props.acceptsChildren || 
        ['container', 'card', 'grid', 'stack'].includes(element.type);
      
      if (acceptsChildren && y > height * 0.25 && y < height * 0.75) {
        newDropPosition = 'inside';
      } else if (y <= height * 0.5) {
        newDropPosition = 'before';
      } else {
        newDropPosition = 'after';
      }
      
      setIsDragOver(true);
      setDropPosition(newDropPosition);
      dispatch({ 
        type: 'SET_DROP_TARGET', 
        targetId: element.id, 
        position: newDropPosition 
      });
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!elementRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragOver(false);
    setDropPosition(null);
    
    if (state.dragState.draggedElement && state.dragState.draggedElement.id !== element.id) {
      const draggedElement = state.dragState.draggedElement;
      
      if (dropPosition === 'inside') {
        // Move into this element
        dispatch({
          type: 'MOVE_ELEMENT',
          elementId: draggedElement.id,
          newParentId: element.id
        });
      } else if (dropPosition === 'before' || dropPosition === 'after') {
        // Move before/after this element
        const siblings = state.elements.filter(el => el.parent === element.parent);
        const currentIndex = siblings.findIndex(el => el.id === element.id);
        const newIndex = dropPosition === 'before' ? currentIndex : currentIndex + 1;
        
        dispatch({
          type: 'MOVE_ELEMENT',
          elementId: draggedElement.id,
          newParentId: element.parent,
          newIndex
        });
      }
    }
    
    dispatch({ type: 'END_DRAG' });
  };

  const isSelected = state.selectedElement === element.id;
  const isHovered = state.hoveredElement === element.id;

  const baseClassName = state.previewMode 
    ? '' 
    : cn(
        'builder-element relative group',
        isSelected && 'selected',
        isHovered && !isSelected && 'hover:border-purple-300'
      );

  const childElements = state.elements
    .filter(el => el.parent === element.id)
    .sort((a, b) => (a.index || 0) - (b.index || 0));

  const renderDropIndicator = () => {
    if (!isDragOver || !dropPosition) return null;
    
    const indicatorClass = cn(
      'absolute z-20 pointer-events-none',
      dropPosition === 'before' && 'top-0 left-0 right-0 h-0.5 bg-blue-500',
      dropPosition === 'after' && 'bottom-0 left-0 right-0 h-0.5 bg-blue-500',
      dropPosition === 'inside' && 'inset-0 border-2 border-dashed border-blue-500 bg-blue-50/20 rounded'
    );
    
    return <div className={indicatorClass} />;
  };

  const renderDragHandle = () => {
    if (state.previewMode || !isSelected) return null;
    
    return (
      <div
        className="absolute -top-2 -left-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center cursor-move z-30 opacity-0 group-hover:opacity-100 transition-opacity"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Move className="w-3 h-3 text-white" />
      </div>
    );
  };

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
            {childElements.length === 0 && !state.previewMode && (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-sm">Drop components here</div>
              </div>
            )}
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
              {childElements.length === 0 && !state.previewMode && (
                <div className="text-center text-muted-foreground py-4 mt-4 border-2 border-dashed border-gray-200 rounded">
                  <div className="text-sm">Drop components here</div>
                </div>
              )}
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
            {childElements.length === 0 && !state.previewMode && (
              <div className="col-span-full text-center text-muted-foreground py-8">
                <div className="text-sm">Drop components here</div>
              </div>
            )}
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
            {childElements.length === 0 && !state.previewMode && (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-sm">Drop components here</div>
              </div>
            )}
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
      ref={elementRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative"
    >
      {renderDragHandle()}
      {renderDropIndicator()}
      {renderElement()}
    </div>
  );
}