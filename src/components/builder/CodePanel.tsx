import { useBuilder } from './BuilderContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Download } from 'lucide-react';

export function CodePanel() {
  const { state } = useBuilder();
  const [copied, setCopied] = useState(false);

  const generateReactCode = () => {
    const imports = new Set(['React']);
    const components = new Set();

    // Analyze elements to determine imports
    state.elements.forEach(element => {
      switch (element.type) {
        case 'button':
          imports.add("{ Button }");
          components.add("@/components/ui/button");
          break;
        case 'card':
          imports.add("{ Card, CardContent, CardHeader, CardTitle }");
          components.add("@/components/ui/card");
          break;
        case 'input':
          imports.add("{ Input }");
          components.add("@/components/ui/input");
          break;
        case 'checkbox':
          imports.add("{ Checkbox }");
          components.add("@/components/ui/checkbox");
          break;
        case 'separator':
          imports.add("{ Separator }");
          components.add("@/components/ui/separator");
          break;
      }
    });

    const importStatements = Array.from(components).map(comp => 
      `import ${Array.from(imports).find(imp => imp.includes(comp.split('/').pop()!))} from '${comp}';`
    ).join('\n');

    const renderElement = (element: any, indent = 2): string => {
      const spacing = ' '.repeat(indent);
      const children = state.elements.filter(el => el.parent === element.id);

      switch (element.type) {
        case 'text':
          return `${spacing}<div className="${element.props.className || ''}">\n${spacing}  ${element.props.content}\n${spacing}</div>`;
        
        case 'button':
          return `${spacing}<Button variant="${element.props.variant}">${element.props.content}</Button>`;
        
        case 'image':
          return `${spacing}<img src="${element.props.src}" alt="${element.props.alt}" className="${element.props.className || ''}" />`;
        
        case 'container':
          const containerChildren = children.map(child => renderElement(child, indent + 2)).join('\n');
          return `${spacing}<div className="${element.props.className || ''}">\n${containerChildren}\n${spacing}</div>`;
        
        case 'card':
          const cardChildren = children.map(child => renderElement(child, indent + 4)).join('\n');
          return `${spacing}<Card>\n${spacing}  <CardHeader>\n${spacing}    <CardTitle>${element.props.title}</CardTitle>\n${spacing}  </CardHeader>\n${spacing}  <CardContent>\n${spacing}    <p>${element.props.content}</p>\n${cardChildren ? cardChildren + '\n' : ''}${spacing}  </CardContent>\n${spacing}</Card>`;
        
        case 'input':
          return `${spacing}<Input type="${element.props.type}" placeholder="${element.props.placeholder}" />`;
        
        case 'checkbox':
          return `${spacing}<div className="flex items-center space-x-2">\n${spacing}  <Checkbox ${element.props.checked ? 'checked' : ''} />\n${spacing}  <label>${element.props.label}</label>\n${spacing}</div>`;
        
        case 'separator':
          return `${spacing}<Separator orientation="${element.props.orientation}" />`;
        
        default:
          return `${spacing}<div>Unknown component: ${element.type}</div>`;
      }
    };

    const rootElements = state.elements.filter(el => !el.parent);
    const elementCode = rootElements.map(element => renderElement(element)).join('\n');

    return `import React from 'react';
${importStatements}

export default function GeneratedApp() {
  return (
    <div className="p-4">
${elementCode}
    </div>
  );
}`;
  };

  const generateHTMLCode = () => {
    const renderElement = (element: any, indent = 2): string => {
      const spacing = ' '.repeat(indent);
      const children = state.elements.filter(el => el.parent === element.id);

      switch (element.type) {
        case 'text':
          return `${spacing}<div class="${element.props.className || ''}">${element.props.content}</div>`;
        
        case 'button':
          return `${spacing}<button class="btn btn-${element.props.variant}">${element.props.content}</button>`;
        
        case 'image':
          return `${spacing}<img src="${element.props.src}" alt="${element.props.alt}" class="${element.props.className || ''}" />`;
        
        case 'container':
          const containerChildren = children.map(child => renderElement(child, indent + 2)).join('\n');
          return `${spacing}<div class="${element.props.className || ''}">\n${containerChildren}\n${spacing}</div>`;
        
        case 'input':
          return `${spacing}<input type="${element.props.type}" placeholder="${element.props.placeholder}" />`;
        
        default:
          return `${spacing}<div>Unknown component: ${element.type}</div>`;
      }
    };

    const rootElements = state.elements.filter(el => !el.parent);
    const elementCode = rootElements.map(element => renderElement(element)).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="p-4">
${elementCode}
    </div>
</body>
</html>`;
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reactCode = generateReactCode();
  const htmlCode = generateHTMLCode();

  return (
    <div className="w-96 bg-background border-l border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Generated Code</h2>
        <p className="text-sm text-muted-foreground">Export your design as code</p>
      </div>

      <Tabs defaultValue="react" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 m-2">
          <TabsTrigger value="react">React</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
        </TabsList>

        <TabsContent value="react" className="flex-1 flex flex-col m-0">
          <div className="flex items-center justify-between p-2 border-b border-border">
            <span className="text-sm font-medium">App.tsx</span>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(reactCode)}
              >
                <Copy className="w-3 h-3 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadCode(reactCode, 'App.tsx')}
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <pre className="code-editor text-xs p-4 overflow-auto">
              <code>{reactCode}</code>
            </pre>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="html" className="flex-1 flex flex-col m-0">
          <div className="flex items-center justify-between p-2 border-b border-border">
            <span className="text-sm font-medium">index.html</span>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(htmlCode)}
              >
                <Copy className="w-3 h-3 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadCode(htmlCode, 'index.html')}
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <pre className="code-editor text-xs p-4 overflow-auto">
              <code>{htmlCode}</code>
            </pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}