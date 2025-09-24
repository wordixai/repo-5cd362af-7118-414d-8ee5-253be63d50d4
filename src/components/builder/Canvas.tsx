import { useBuilder } from './BuilderContext';
import { ElementRenderer } from './ElementRenderer';
import { useRef } from 'react';

export function Canvas() {
  const { state, dispatch } = useBuilder();
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (state.draggedElement) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const newElement = {
          ...state.draggedElement,
          props: {
            ...state.draggedElement.props,
            style: {
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              ...state.draggedElement.props.style
            }
          }
        };
        
        dispatch({ type: 'ADD_ELEMENT', element: newElement });
        dispatch({ type: 'SET_DRAGGED_ELEMENT', element: null });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      dispatch({ type: 'SELECT_ELEMENT', elementId: null });
    }
  };

  const rootElements = state.elements.filter(el => !el.parent);

  return (
    <div className="flex-1 relative">
      <div
        ref={canvasRef}
        className={`w-full h-full builder-canvas relative overflow-auto ${
          state.previewMode ? '' : 'p-4'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleCanvasClick}
      >
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
      </div>
    </div>
  );
}