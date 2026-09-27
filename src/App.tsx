/**
 * CYBERA: Predictive Cyber Attack Digital Twin
 * Problem Statement SIH26153: AI-Based Network Attack Forecasting from Network Telemetry Data
 */

import React, { useState, useEffect, useRef } from 'react';
import { CyberService } from './services/api';
import { HeaderBar, NavTab } from './components/HeaderBar';
import { ForecastPanel } from './components/ForecastPanel';
import { DigitalTwinGraph } from './components/DigitalTwinGraph';
import { TimeMachineScrubber } from './components/TimeMachineScrubber';
import { ExplainabilityPanel } from './components/ExplainabilityPanel';
import { CounterfactualPanel } from './components/CounterfactualPanel';
import { BaselineComparisonStrip } from './components/BaselineComparisonStrip';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { EvaluationModal } from './components/EvaluationModal';
import { EvaluationView } from './components/EvaluationView';
import { DemoScriptModal } from './components/DemoScriptModal';
import { HighChanceAlertPopup } from './components/HighChanceAlertPopup';

export default function App() {
  const [activeCampaignId, setActiveCampaignId] = useState<string>(CyberService.getActiveCampaignId());
  const [stepIndex, setStepIndex] = useState<number>(CyberService.getActiveStepIndex());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-ws-101');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<'panoramic' | 'split'>('panoramic');
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Modals state
  const [showEvaluationModal, setShowEvaluationModal] = useState<boolean>(false);
  const [showDemoScript, setShowDemoScript] = useState<boolean>(false);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(false);

  // Playback timer
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch current data
  const campaigns = CyberService.getCampaigns();
  const windows = CyberService.getTimelineWindows();
  const currentState = CyberService.getCurrentState();
  const topology = CyberService.getTopology();
  const counterfactualActions = CyberService.getCounterfactualActions();
  const baselineComparison = CyberService.getBaselineComparison();

  // Handle Play/Pause
  const handleTogglePlay = () => {
    setIsPlaying(prev => {
      // If at end, loop back to start immediately
      if (!prev && stepIndex >= windows.length - 1) {
        CyberService.setStepIndex(0);
        setStepIndex(0);
      }
      return !prev;
    });
  };

  useEffect(() => {
    if (isPlaying) {
      // Advance step every 2.0s with immediate visual response
      playTimerRef.current = setInterval(() => {
        setStepIndex(prev => {
          const next = prev + 1;
          if (next >= windows.length) {
            setIsPlaying(false);
            return prev;
          }
          CyberService.setStepIndex(next);
          return next;
        });
      }, 2000);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, windows.length]);

  const handleSelectCampaign = (id: string) => {
    setIsPlaying(false);
    CyberService.setCampaign(id);
    setActiveCampaignId(id);
    setStepIndex(CyberService.getActiveStepIndex());
    setActiveActionId(null);
    setRefreshTrigger(t => t + 1);
  };

  const handleSelectStep = (step: number) => {
    CyberService.setStepIndex(step);
    setStepIndex(step);
  };

  const handleReset = () => {
    setIsPlaying(false);
    CyberService.resetMitigations();
    CyberService.setStepIndex(0);
    setStepIndex(0);
    setActiveActionId(null);
    setRefreshTrigger(t => t + 1);
  };

  const handleApplyCounterfactual = (actionId: string) => {
    setActiveActionId(actionId);
    CyberService.applyAction(actionId);
    setRefreshTrigger(t => t + 1);
  };

  const handleResetCounterfactual = () => {
    setActiveActionId(null);
    CyberService.resetMitigations();
    setRefreshTrigger(t => t + 1);
  };

  const handleToggleEdgeBlock = (edgeId: string) => {
    CyberService.toggleEdgeBlock(edgeId);
    setRefreshTrigger(t => t + 1);
  };

  const handleToggleNodeQuarantine = (nodeId: string) => {
    CyberService.toggleNodeQuarantine(nodeId);
    setRefreshTrigger(t => t + 1);
  };

  const handleExportReport = () => {
    const report = CyberService.generateIncidentReport();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cybera-incident-forensics-${activeCampaignId}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleToggleTheme = () => {
    setIsHighContrast(prev => !prev);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans relative ${
      isHighContrast ? 'bg-[#04060a] text-slate-50' : 'bg-[#fffaf0] text-slate-800'
    }`}>
      {/* Glassy Background Ambient Optical Refraction Mesh for Floral White Glassmorphism */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Warm Golden-Amber Refraction Sphere */}
        <div className="absolute -top-24 left-[15%] w-[680px] h-[580px] rounded-full bg-gradient-to-br from-amber-400/25 via-amber-300/20 to-orange-400/15 blur-[100px] animate-float-slow" />
        
        {/* Electric Cyan/Cerulean Refraction Sphere */}
        <div className="absolute top-[20%] -right-20 w-[620px] h-[620px] rounded-full bg-gradient-to-tr from-cyan-400/25 via-sky-300/20 to-blue-400/15 blur-[110px] animate-float-reverse" />
        
        {/* Vibrant Rose/Sunset Specular Sphere */}
        <div className="absolute top-[55%] -left-28 w-[580px] h-[580px] rounded-full bg-gradient-to-bl from-rose-400/20 via-pink-300/15 to-amber-200/10 blur-[105px] animate-float-pulse" />
        
        {/* Emerald Sage Cyber Sphere */}
        <div className="absolute -bottom-24 right-[18%] w-[580px] h-[580px] rounded-full bg-gradient-to-tl from-emerald-400/22 via-teal-300/18 to-cyan-300/12 blur-[100px] animate-float-slow" />

        {/* Center Optical Caustic Glow */}
        <div className="absolute top-1/3 left-1/3 w-[450px] h-[450px] rounded-full bg-gradient-to-r from-amber-200/15 to-cyan-200/15 blur-[85px] animate-float-reverse" />
      </div>

      {/* 1. Refined Top Navigation Bar */}
      <HeaderBar
        currentWindow={currentState.window}
        networkRiskScore={currentState.networkRiskScore}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onReset={handleReset}
        activeCampaignId={activeCampaignId}
        campaigns={campaigns}
        onSelectCampaign={handleSelectCampaign}
        onOpenEvaluation={() => setShowEvaluationModal(true)}
        onOpenDemoScript={() => setShowDemoScript(true)}
        onOpenTelemetry={() => setShowTelemetry(true)}
        onExportReport={handleExportReport}
        isHighContrast={isHighContrast}
        onToggleTheme={handleToggleTheme}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main SOC Dashboard Viewport */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 sm:space-y-7">
        
        {/* Top Operational Status Banner (Glassy, uncompressed, spacious) */}
        <div className="glass-panel rounded-2xl px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-slate-500 font-medium">Environment:</span>
            <span className="font-bold text-slate-900">Enterprise Multi-Subnet (DMZ / Corporate LAN / Core Vault)</span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span className="text-slate-500 font-medium">Dataset Source:</span>
            <span className="font-mono text-cyan-800 font-bold px-2.5 py-0.5 rounded-full glass-pill bg-cyan-50/80 border-cyan-300/60 shadow-sm">
              {currentState.window.dataset_source}
            </span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span className="text-slate-500 font-medium">Partition:</span>
            <span className="font-mono text-amber-800 font-bold px-2.5 py-0.5 rounded-full glass-pill bg-amber-50/80 border-amber-300/60 shadow-sm">
              {currentState.window.is_held_out ? 'Held-Out Test (Zero Leakage)' : 'Training Partition'}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-slate-700 flex-wrap justify-between sm:justify-start">
            <span className="flex items-center gap-2 text-emerald-700 font-bold glass-pill px-3 py-1 rounded-full shadow-sm bg-emerald-50/80 border-emerald-300/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span>Digital Twin Engine: Active</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span>Lookahead: <strong className="text-cyan-800">5-Min Multi-Step Horizon</strong></span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW (Unified Executive Cockpit) */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-7 animate-fadeIn">
            {/* Timeline Scrubber */}
            <TimeMachineScrubber
              windows={windows}
              currentIndex={stepIndex}
              onSelectIndex={handleSelectStep}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
            />

            {/* Layout Mode (Panoramic or Split) */}
            {layoutMode === 'panoramic' ? (
              <div className="flex flex-col gap-6 sm:gap-7">
                {/* Full 12-Column Panoramic Digital Twin Topology */}
                <DigitalTwinGraph
                  nodes={topology.nodes}
                  edges={topology.edges}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  currentStage={currentState.window.actual_stage}
                  onToggleEdgeBlock={handleToggleEdgeBlock}
                  onToggleNodeQuarantine={handleToggleNodeQuarantine}
                  layoutMode={layoutMode}
                  onToggleLayoutMode={() => setLayoutMode('split')}
                  isPlaying={isPlaying}
                  currentStep={stepIndex}
                  totalSteps={windows.length}
                  onTogglePlay={handleTogglePlay}
                />

                {/* Uncompressed Side-by-Side Threat Intelligence Duo */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <div className="xl:col-span-6">
                    <ForecastPanel currentWindow={currentState.window} />
                  </div>
                  <div className="xl:col-span-6">
                    <ExplainabilityPanel currentWindow={currentState.window} />
                  </div>
                </div>

                {/* Expansive Full-Width Counterfactual Defense Simulator */}
                <CounterfactualPanel
                  actions={counterfactualActions}
                  onApplyAction={handleApplyCounterfactual}
                  onReset={handleResetCounterfactual}
                  activeActionId={activeActionId}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Split Left: Digital Twin & Defense */}
                <div className="xl:col-span-7 flex flex-col gap-6">
                  <DigitalTwinGraph
                    nodes={topology.nodes}
                    edges={topology.edges}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={setSelectedNodeId}
                    currentStage={currentState.window.actual_stage}
                    onToggleEdgeBlock={handleToggleEdgeBlock}
                    onToggleNodeQuarantine={handleToggleNodeQuarantine}
                    layoutMode={layoutMode}
                    onToggleLayoutMode={() => setLayoutMode('panoramic')}
                    isPlaying={isPlaying}
                    currentStep={stepIndex}
                    totalSteps={windows.length}
                    onTogglePlay={handleTogglePlay}
                  />

                  <CounterfactualPanel
                    actions={counterfactualActions}
                    onApplyAction={handleApplyCounterfactual}
                    onReset={handleResetCounterfactual}
                    activeActionId={activeActionId}
                  />
                </div>

                {/* Split Right: Forecast & Explainability */}
                <div className="xl:col-span-5 flex flex-col gap-6">
                  <ForecastPanel currentWindow={currentState.window} />
                  <ExplainabilityPanel currentWindow={currentState.window} />
                </div>
              </div>
            )}

            {/* Persistent Baseline Comparison Strip */}
            <BaselineComparisonStrip
              baselineData={baselineComparison}
              onOpenEvaluation={() => setActiveTab('evaluation')}
            />
          </div>
        )}

        {/* TAB 2: DIGITAL TWIN (Dedicated Full-Bleed Topology View) */}
        {activeTab === 'twin' && (
          <div className="space-y-6 sm:space-y-7 animate-fadeIn">
            <TimeMachineScrubber
              windows={windows}
              currentIndex={stepIndex}
              onSelectIndex={handleSelectStep}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
            />

            {/* Full-bleed uncompressed Digital Twin */}
            <DigitalTwinGraph
              nodes={topology.nodes}
              edges={topology.edges}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              currentStage={currentState.window.actual_stage}
              onToggleEdgeBlock={handleToggleEdgeBlock}
              onToggleNodeQuarantine={handleToggleNodeQuarantine}
              layoutMode="panoramic"
              isPlaying={isPlaying}
              currentStep={stepIndex}
              totalSteps={windows.length}
              onTogglePlay={handleTogglePlay}
            />

            {/* Quick Action Mitigations */}
            <CounterfactualPanel
              actions={counterfactualActions}
              onApplyAction={handleApplyCounterfactual}
              onReset={handleResetCounterfactual}
              activeActionId={activeActionId}
            />
          </div>
        )}

        {/* TAB 3: THREAT FORECAST (AI World Model Deep Dive) */}
        {activeTab === 'forecast' && (
          <div className="space-y-6 sm:space-y-7 animate-fadeIn">
            <TimeMachineScrubber
              windows={windows}
              currentIndex={stepIndex}
              onSelectIndex={handleSelectStep}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-6">
                <ForecastPanel currentWindow={currentState.window} />
              </div>
              <div className="xl:col-span-6">
                <ExplainabilityPanel currentWindow={currentState.window} />
              </div>
            </div>

            <BaselineComparisonStrip
              baselineData={baselineComparison}
              onOpenEvaluation={() => setActiveTab('evaluation')}
            />
          </div>
        )}

        {/* TAB 4: DEFENSE SANDBOX (Counterfactual Simulator) */}
        {activeTab === 'defense' && (
          <div className="space-y-6 sm:space-y-7 animate-fadeIn">
            <TimeMachineScrubber
              windows={windows}
              currentIndex={stepIndex}
              onSelectIndex={handleSelectStep}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-5 flex flex-col gap-6">
                <CounterfactualPanel
                  actions={counterfactualActions}
                  onApplyAction={handleApplyCounterfactual}
                  onReset={handleResetCounterfactual}
                  activeActionId={activeActionId}
                />
              </div>
              <div className="xl:col-span-7 flex flex-col gap-6">
                <DigitalTwinGraph
                  nodes={topology.nodes}
                  edges={topology.edges}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  currentStage={currentState.window.actual_stage}
                  onToggleEdgeBlock={handleToggleEdgeBlock}
                  onToggleNodeQuarantine={handleToggleNodeQuarantine}
                  layoutMode="split"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BENCHMARKS & EVALUATION */}
        {activeTab === 'evaluation' && (
          <div className="animate-fadeIn">
            <EvaluationView
              baselineData={baselineComparison}
              onExportReport={handleExportReport}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-amber-900/10 bg-[#fffaf0]/80 backdrop-blur-md px-4 sm:px-8 py-4 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">CYBERA Predictive Cyber Attack Digital Twin</span>
          <span>·</span>
          <span>SIH26153: AI-Based Network Attack Forecasting</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px] flex-wrap justify-center">
          <span>CSE-CIC-IDS2018</span>
          <span>·</span>
          <span>CTU-13</span>
          <span>·</span>
          <span>MITRE ATT&CK Matrix</span>
          <span>·</span>
          <span>Zero-Data Leakage Partition</span>
        </div>
      </footer>

      {/* Drawers and Modals */}
      <TelemetryDrawer
        isOpen={showTelemetry}
        onClose={() => setShowTelemetry(false)}
        currentWindow={currentState.window}
      />

      <EvaluationModal
        isOpen={showEvaluationModal}
        onClose={() => setShowEvaluationModal(false)}
        baselineData={baselineComparison}
      />

      <DemoScriptModal
        isOpen={showDemoScript}
        onClose={() => setShowDemoScript(false)}
      />

      {/* High-Chance Threat Warning Alert Popup on Home Page */}
      {activeTab === 'overview' && (
        <HighChanceAlertPopup
          currentWindow={currentState.window}
          networkRiskScore={currentState.networkRiskScore}
          activeActionId={activeActionId}
          onApplyAction={handleApplyCounterfactual}
          onOpenDigitalTwin={() => setActiveTab('twin')}
        />
      )}
    </div>
  );
}
