import React from 'react';
import { WorkspaceProvider } from './WorkspaceContext';
import Shell from './components/Shell';

function App() {
  return (
    <WorkspaceProvider>
      <Shell />
    </WorkspaceProvider>
  );
}

export default App;
