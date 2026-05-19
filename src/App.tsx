import React from 'react';
import { WorkspaceProvider, useWorkspace } from './WorkspaceContext';
import Shell from './components/Shell';
import SetupGate from './components/SetupGate';

function WorkspaceLayout() {
  const { isSetupComplete } = useWorkspace();

  return isSetupComplete ? <Shell /> : <SetupGate />;
}

function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceLayout />
    </WorkspaceProvider>
  );
}

export default App;
