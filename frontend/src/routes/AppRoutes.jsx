import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { CycloneDetail } from '../pages/CycloneDetail';
import { HistoricalExplorer } from '../pages/HistoricalExplorer';
import { CyclogenesisWatch } from '../pages/CyclogenesisWatch';
import { ChatbotPage } from '../pages/ChatbotPage';
import { About } from '../pages/About';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/cyclone/:cycloneId" element={<CycloneDetail />} />
      <Route path="/historical" element={<HistoricalExplorer />} />
      <Route path="/cyclogenesis" element={<CyclogenesisWatch />} />
      <Route path="/chat" element={<ChatbotPage />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
