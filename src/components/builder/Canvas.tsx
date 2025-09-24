import { useBuilder } from './BuilderContext';
import { ElementRenderer } from './ElementRenderer';
import { DragPreview } from './DragPreview';
import { useRef, useState } from 'react';

export function Canvas() {
  const { state, dispatch } = useBuilder();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (state.dragState.draggedElement) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        let element = { ...state.dragState.draggedElement };
        
        // If dropping from library, position absolutely
        if (state.dragState.draggedFromLibrary) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          element = {
            ...element,
            props: {
              ...element.props,
              style: {
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                ...element.props.style
              }
            }
          };
        }
        
        // Determine drop target and position
        const dropTarget = state.dragState.dropTarget;
        const dropPosition = state.dragState.dropPosition;
        
        if (dropTarget && dropPosition === 'inside') {
          // Drop inside a container
          dispatch({ 
            type: 'ADD_ELEMENT', 
            element, 
            parentId: dropTarget 
          });
        } else if (dropTarget && (dropPosition === 'before' || dropPosition === 'after')) {
          // Drop before/after an element
          const targetElement = state.elements.find(el => el.id === dropTarget);
          if (targetElement) {
            const siblings = state.elements.filter(el => el.parent === targetElement.parent);
            const targetIndex = siblings.findIndex(el => el.id === dropTarget);
            const newIndex = dropPosition === 'before' ? targetIndex : targetIndex + 1;
            
            dispatch({ 
              type: 'ADD_ELEMENT', 
              element, 
              parentId: targetElement.parent,
              index: newIndex
            });
          }
        } else {
          // Drop on canvas root
          dispatch({ type: 'ADD_ELEMENT', element });
        }
        
        dispatch({ type: 'END_DRAG' });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
    
    // Update drag preview position
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      dispatch({
        type: 'UPDATE_DRAG_PREVIEW',
        position: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      });
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set isDragOver to false if we're leaving the canvas entirely
    if (!canvasRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      dispatch({ type: 'SET_DROP_TARGET', targetId: null, position: null });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      dispatch({ type: 'SELECT_ELEMENT', elementId: null });
    }
  };

  const rootElements = state.elements
    .filter(el => !el.parent)
    .sort((a, b) => (a.index || 0) - (b.index || 0));

  return (
    <div className="flex-1 relative">
      <div
        ref={canvasRef}
        className={`w-full h-full builder-canvas relative overflow-auto transition-all duration-200 ${
          state.previewMode ? '' : 'p-4'
        } ${isDragOver ? 'bg-blue-50/50' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleCanvasClick}
      >
        {/* Drop zone indicator */}
        {isDragOver && state.dragState.isDragging && (
          <div className="absolute inset-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50/20 pointer-events-none z-10 flex items-center justify-center">
            <div className="text-blue-600 text-lg font-medium">
              Drop component here
            </div>
          </div>
        )}

        {rootElements.length === 0 && !state.previewMode ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Start Building</h3>
              <p className="text-sm">Drag components from the library to get started</p>
            </div>
          </div>
        ) : (
          <div className={state.previewMode ? 'h-full' : 'relative min-h-full'}>
            {rootElements.map((element) => (
              <ElementRenderer key={element.id} element={element} />
            ))}
          </div>
        )}

        {/* Drag preview */}
        {state.dragState.isDragging && state.dragState.dragPreview && (
          <DragPreview
            element={state.dragState.draggedElement!}
            position={state.dragState.dragPreview}
          />
        )}
      </div>
    </div>
  );
}