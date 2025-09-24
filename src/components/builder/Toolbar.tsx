import { useBuilder } from './BuilderContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Code, 
  Eye, 
  Trash2, 
  Download,
  Save,
  FolderOpen
} from 'lucide-react';

interface ToolbarProps {
  onToggleCode: () => void;
  showCode: boolean;
}

export function Toolbar({ onToggleCode, showCode }: ToolbarProps) {
  const { state, dispatch } = useBuilder();

  const togglePreview = () => {
    dispatch({ type: 'TOGGLE_PREVIEW_MODE' });
  };

  const clearCanvas = () => {
    if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      dispatch({ type: 'CLEAR_CANVAS' });
    }
  };

  const exportCode = () => {
    // This would generate and download the code
    console.log('Export code functionality would go here');
  };

  const saveProject = () => {
    const projectData = {
      elements: state.elements,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('app-builder-project', JSON.stringify(projectData));
    alert('Project saved successfully!');
  };

  const loadProject = () => {
    const savedProject = localStorage.getItem('app-builder-project');
    if (savedProject) {
      try {
        const projectData = JSON.parse(savedProject);
        // Load project logic would go here
        alert('Project loaded successfully!');
      } catch (error) {
        alert('Error loading project');
      }
    } else {
      alert('No saved project found');
    }
  };

  return (
    <div className="h-14 bg-background border-b border-border flex items-center px-4 space-x-2">
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-semibold">App Builder</h1>
        <Separator orientation="vertical" className="h-6" />
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant={state.previewMode ? "default" : "outline"}
          size="sm"
          onClick={togglePreview}
        >
          {state.previewMode ? <Eye className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {state.previewMode ? 'Design' : 'Preview'}
        </Button>

        <Button
          variant={showCode ? "default" : "outline"}
          size="sm"
          onClick={onToggleCode}
        >
          <Code className="w-4 h-4 mr-2" />
          Code
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="outline" size="sm" onClick={saveProject}>
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>

        <Button variant="outline" size="sm" onClick={loadProject}>
          <FolderOpen className="w-4 h-4 mr-2" />
          Load
        </Button>

        <Button variant="outline" size="sm" onClick={exportCode}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button 
          variant="destructive" 
          size="sm" 
          onClick={clearCanvas}
          disabled={state.elements.length === 0}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      <div className="flex-1" />

      <div className="text-sm text-muted-foreground">
        {state.elements.length} element{state.elements.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}