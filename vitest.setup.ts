import '@testing-library/jest-dom';
import React from 'react';

// Provide React in global scope for components expecting it in tests
// (helps when TS jsx is preserved and no automatic runtime transform is applied)
(globalThis as any).React = React;
