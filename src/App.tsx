import React from 'react';
import './App.css';
import { Router } from './components/Router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <>
      <Router />
      <ToastContainer />
    </>
  );
};

export default App;
