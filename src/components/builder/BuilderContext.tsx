import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface BuilderElement {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: BuilderElement[];
  parent?: string;
}

interface BuilderState {
  elements: BuilderElement[];
  selectedElement: string | null;
  draggedElement: BuilderElement | null;
  hoveredElement: string | null;
  previewMode: boolean;
}

type BuilderAction =
  | { type: 'ADD_ELEMENT'; element: BuilderElement; parentId?: string }
  | { type: 'REMOVE_ELEMENT'; elementId: string }
  | { type: 'UPDATE_ELEMENT'; elementId: string; props: Record<string, any> }
  | { type: 'SELECT_ELEMENT'; elementId: string | null }
  | { type: 'SET_DRAGGED_ELEMENT'; element: BuilderElement | null }
  | { type: 'SET_HOVERED_ELEMENT'; elementId: string | null }
  | { type: 'MOVE_ELEMENT'; elementId: string; newParentId?: string; index?: number }
  | { type: 'TOGGLE_PREVIEW_MODE' }
  | { type: 'CLEAR_CANVAS' };

const initialState: BuilderState = {
  elements: [],
  selectedElement: null,
  draggedElement: null,
  hoveredElement: null,
  previewMode: false,
};

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      const newElement = { ...action.element };
      if (action.parentId) {
        newElement.parent = action.parentId;
      }
      return {
        ...state,
        elements: [...state.elements, newElement],
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
    
    case 'SET_DRAGGED_ELEMENT':
      return {
        ...state,
        draggedElement: action.element,
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
            ? { ...el, parent: action.newParentId }
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
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
}