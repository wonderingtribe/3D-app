/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WorkspaceProvider } from './WorkspaceContext';
import Shell from './components/Shell';

export default function App() {
  return (
    <WorkspaceProvider>
      <div className="h-screen w-screen bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden selection:bg-cyan-500/30">
        <Shell />
      </div>
    </WorkspaceProvider>
  );
}
