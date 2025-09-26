import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface BuilderElement {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: BuilderElement[];
  parent?: string;
  index?: number;
}

interface DragState {
  isDragging: boolean;
  draggedElement: BuilderElement | null;
  draggedFromLibrary: boolean;
  dropTarget: string | null;
  dropPosition: 'before' | 'after' | 'inside' | null;
  dragPreview: { x: number; y: number } | null;
}

interface BuilderState {
  elements: BuilderElement[];
  selectedElement: string | null;
  hoveredElement: string | null;
  previewMode: boolean;
  dragState: DragState;
}

type BuilderAction =
  | { type: 'ADD_ELEMENT'; element: BuilderElement; parentId?: string; index?: number }
  | { type: 'REMOVE_ELEMENT'; elementId: string }
  | { type: 'UPDATE_ELEMENT'; elementId: string; props: Record<string, any> }
  | { type: 'SELECT_ELEMENT'; elementId: string | null }
  | { type: 'SET_HOVERED_ELEMENT'; elementId: string | null }
  | { type: 'MOVE_ELEMENT'; elementId: string; newParentId?: string; newIndex?: number }
  | { type: 'TOGGLE_PREVIEW_MODE' }
  | { type: 'CLEAR_CANVAS' }
  | { type: 'START_DRAG'; element: BuilderElement; fromLibrary: boolean }
  | { type: 'END_DRAG' }
  | { type: 'SET_DROP_TARGET'; targetId: string | null; position: 'before' | 'after' | 'inside' | null }
  | { type: 'UPDATE_DRAG_PREVIEW'; position: { x: number; y: number } | null };

const initialState: BuilderState = {
  elements: [],
  selectedElement: null,
  hoveredElement: null,
  previewMode: false,
  dragState: {
    isDragging: false,
    draggedElement: null,
    draggedFromLibrary: false,
    dropTarget: null,
    dropPosition: null,
    dragPreview: null,
  },
};

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      const newElement = { ...action.element };
      if (action.parentId) {
        newElement.parent = action.parentId;
      }
      if (action.index !== undefined) {
        newElement.index = action.index;
      }
      
      // Reorder existing elements if inserting at specific index
      const updatedElements = [...state.elements];
      if (action.parentId && action.index !== undefined) {
        const siblings = updatedElements.filter(el => el.parent === action.parentId);
        siblings.forEach((sibling, idx) => {
          if (idx >= action.index!) {
            const siblingIndex = updatedElements.findIndex(el => el.id === sibling.id);
            if (siblingIndex !== -1) {
              updatedElements[siblingIndex] = { ...sibling, index: (sibling.index || 0) + 1 };
            }
          }
        });
      }
      
      return {
        ...state,
        elements: [...updatedElements, newElement],
        selectedElement: newElement.id,
      };
    }
    
    case 'REMOVE_ELEMENT': {
      const removeElementAndChildren = (elements: BuilderElement[], id: string): BuilderElement[] => {
        return elements.filter(el => {
          if (el.id === id) return false;
          if (el.parent === id) return false;
          return true;
        });
      };
      
      return {
        ...state,
        elements: removeElementAndChildren(state.elements, action.elementId),
        selectedElement: state.selectedElement === action.elementId ? null : state.selectedElement,
      };
    }
    
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map(el =>
          el.id === action.elementId
            ? { ...el, props: { ...el.props, ...action.props } }
            : el
        ),
      };
    
    case 'SELECT_ELEMENT':
      return {
        ...state,
        selectedElement: action.elementId,
      };
    
    case 'SET_HOVERED_ELEMENT':
      return {
        ...state,
        hoveredElement: action.elementId,
      };
    
    case 'MOVE_ELEMENT': {
      return {
        ...state,
        elements: state.elements.map(el =>
          el.id === action.elementId
            ? { 
                ...el, 
                parent: action.newParentId,
                index: action.newIndex 
              }
            : el
        ),
      };
    }
    
    case 'TOGGLE_PREVIEW_MODE':
      return {
        ...state,
        previewMode: !state.previewMode,
        selectedElement: null,
      };
    
    case 'CLEAR_CANVAS':
      return {
        ...state,
        elements: [],
        selectedElement: null,
      };
    
    case 'START_DRAG':
      return {
        ...state,
        dragState: {
          ...state.dragState,
          isDragging: true,
          draggedElement: action.element,
          draggedFromLibrary: action.fromLibrary,
        },
      };
    
    case 'END_DRAG':
      return {
        ...state,
        dragState: {
          ...initialState.dragState,
        },
      };
    
    case 'SET_DROP_TARGET':
      return {
        ...state,
        dragState: {
          ...state.dragState,
          dropTarget: action.targetId,
          dropPosition: action.position,
        },
      };
    
    case 'UPDATE_DRAG_PREVIEW':
      return {
        ...state,
        dragState: {
          ...state.dragState,
          dragPreview: action.position,
        },
      };
    
    default:
      return state;
  }
}

const BuilderContext = createContext<{
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
} | null>(null);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(builderReducer, initialState);

  return (
    <BuilderContext.Provider value={{ state, dispatch }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvi');
  }
  return context;
}
