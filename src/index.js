import React from 'react';

import ReactDOM from 'react-dom/client';
import Checkout from './components/Checkout';
import Return from './components/Return';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Checkout />,
  },
  {
    path: "/return",
    element: <Return />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
