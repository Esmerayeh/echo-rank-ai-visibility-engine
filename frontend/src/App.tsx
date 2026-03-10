import React from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { WebsiteAnalyzer } from './pages/WebsiteAnalyzer';
import { ContentOptimizer } from './pages/ContentOptimizer';
import { AuthorityMap } from './pages/AuthorityMap';
import { ContentGenerator } from './pages/ContentGenerator';
import { AnswerSimulation } from './pages/AnswerSimulation';

function App() {
  return (
    <Layout>
      {(activeTab, setActiveTab) => {
        switch (activeTab) {
          case 'dashboard':
            return <Dashboard onNewAnalysis={() => setActiveTab('analyzer')} />;
          case 'analyzer':
            return <WebsiteAnalyzer />;
          case 'optimizer':
            return <ContentOptimizer />;
          case 'authority':
            return <AuthorityMap />;
          case 'generator':
            return <ContentGenerator />;
          case 'simulation':
            return <AnswerSimulation />;
          default:
            return <Dashboard onNewAnalysis={() => setActiveTab('analyzer')} />;
        }
      }}
    </Layout>
  );
}

export default App;