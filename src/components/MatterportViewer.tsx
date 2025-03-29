import React, { useEffect, useRef } from 'react';
import '@matterport/webcomponent';

interface MatterportViewerProps {
  modelId: string;
  height?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'matterport-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        m: string;
        'application-key': string;
      };
    }
  }
}

export function MatterportViewer({ modelId, height = '400px' }: MatterportViewerProps) {
  const viewerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.addEventListener('load', () => {
        // Matterport viewer loaded successfully
      });

      viewer.addEventListener('error', (error) => {
        // Handle error loading Matterport viewer
      });
    }

    return () => {
      if (viewer) {
        viewer.removeEventListener('load', () => {});
        viewer.removeEventListener('error', () => {});
      }
    };
  }, []);

  return (
    // <matterport-viewer
    //   ref={viewerRef}
    //   m={modelId}
    //   application-key="5bkpq4esaqsgdha3cd358w2ec"
    //   style={{
    //     width: '100%',
    //     height,
    //     border: 'none',
    //     backgroundColor: '#f3f4f6'
    //   }}
    // />
    <iframe
      src="https://my.matterport.com/work?m=o5ca1uuL8v4&cloudEdit=1"
      style={{
        width: '100%',
        height: height,
        border: 'none',
        backgroundColor: '#f3f4f6',
      }}
      allowFullScreen
    />
  );
}
