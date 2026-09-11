import React, { useState, useEffect } from 'react';
import { ApiService } from './services/apiService';
import { 
  RiskZone, 
  LiveAlert, 
  FieldReport, 
  RoadCondition, 
  ResponsePriority, 
  SupportedLanguage, 
  NetworkStatus 
} from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { OfflineBanner } from './components/common/OfflineBanner';
import { ToastNotification } from './components/common/ToastNotification';
import { KpiCards } from './components/KpiCards';
import { GISMap } from './components/GISMap';
import { LiveAlertsPanel } from './components/LiveAlertsPanel';
import { EnvironmentalIndicators } from './components/EnvironmentalIndicators';
import { AiPredictionCard } from './components/AiPredictionCard';
import { AiExplainabilityCard } from './components/AiExplainabilityCard';
import { EmergencyPrioritySection } from './components/EmergencyPrioritySection';
import { HighestRiskLocationsTable } from './components/HighestRiskLocationsTable';
import { InfrastructureStatusSection } from './components/InfrastructureStatusSection';
import { RoadConnectivitySection } from './components/RoadConnectivitySection';
import { RecentFieldReportsSection } from './components/RecentFieldReportsSection';
import { DistrictDetailView } from './components/DistrictDetailView';
import { AlertsManagementView } from './components/AlertsManagementView';
import { AnalyticsView } from './components/AnalyticsView';
import { FieldOperationsView } from './components/FieldOperationsView';
import { ReportHazardModal } from './components/ReportHazardModal';
import { AssignTeamModal } from './components/AssignTeamModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { InspectionDetailModal } from './components/InspectionDetailModal';
import { SensorDiagnosticModal, SensorTelemetryItem } from './components/SensorDiagnosticModal';
import { MetricDetailModal, MetricModalType } from './components/MetricDetailModal';
import { useTranslation } from './data/translations';
import { 
  AlertTriangle, 
  MapPin, 
  Plus, 
  ArrowRight, 
  ShieldAlert, 
  Radio, 
  FileSpreadsheet, 
  Download,
  Activity,
  Route
} from 'lucide-react';

export default function App() {
  // Navigation & View State
  const { t, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedDistrictZone, setSelectedDistrictZone] = useState<RiskZone | null>(null);

  // Core Data Feeds
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [roads, setRoads] = useState<RoadCondition[]>([]);
  const [priorities, setPriorities] = useState<ResponsePriority[]>([]);

  // Map Selected Zone & Centerpiece View Mode
  const [selectedMapZone, setSelectedMapZone] = useState<RiskZone | null>(null);
  const [isCenterpieceMode, setIsCenterpieceMode] = useState<boolean>(false);

  // Network & Sync State
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('online');
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<{ id: string; title: string; location: string; type: 'alert' | 'zone' | 'report' } | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [inspectionData, setInspectionData] = useState<{ type: 'alert' | 'zone' | 'report'; item: any } | null>(null);
  const [activeSensorDiagnostic, setActiveSensorDiagnostic] = useState<SensorTelemetryItem | null>(null);
  const [activeMetricModal, setActiveMetricModal] = useState<{ type: MetricModalType; zone?: RiskZone } | null>(null);

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  // Load initial data
  const refreshData = () => {
    setZones(ApiService.getRiskZones());
    setAlerts(ApiService.getLiveAlerts());
    setReports(ApiService.getFieldReports());
    setRoads(ApiService.getRoadConditions());
    setPriorities(ApiService.getPriorities());
    setNetworkStatus(ApiService.getNetworkStatus());
    setPendingOfflineCount(ApiService.getOfflineQueue().length);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handlers
  const handleShowToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToast({ message, type });
  };

  const handleKpiCardClick = (cardType: string) => {
    if (cardType === 'roads') {
      setActiveMetricModal({ type: 'roads' });
    } else if (cardType === 'critical' || cardType === 'high-risk') {
      setActiveTab('risk-map');
    } else if (cardType === 'alerts') {
      setActiveTab('alerts');
    } else if (cardType === 'monitored') {
      setActiveTab('analytics');
    }
  };

  const handleOpenAssignModal = (target: { id: string; title: string; location: string; type: 'alert' | 'zone' | 'report' }) => {
    setAssignTarget(target);
    setIsAssignTeamModalOpen(true);
  };

  const handleConfirmTeamAssignment = (teamName: string, notes: string) => {
    if (!assignTarget) return;

    if (assignTarget.type === 'alert') {
      ApiService.assignTeamToAlert(assignTarget.id, teamName);
    } else if (assignTarget.type === 'report') {
      ApiService.assignTeamToReport(assignTarget.id, teamName);
    } else {
      ApiService.assignTeamToPriority(assignTarget.id, teamName);
    }

    refreshData();
    handleShowToast(`${teamName} successfully dispatched to ${assignTarget.title}.`, 'success');
  };

  const handleResolveAlert = (alertId: string) => {
    ApiService.resolveAlert(alertId);
    refreshData();
    handleShowToast(`Alert ${alertId} has been marked as resolved.`, 'success');
  };

  const handleResolveReport = (reportId: string) => {
    ApiService.resolveFieldReport(reportId);
    refreshData();
    handleShowToast(`Field Report ${reportId} has been marked as resolved.`, 'success');
  };

  const handleSubmitFieldReport = (data: any) => {
    const result = ApiService.submitFieldReport(data);
    refreshData();
    if (result.savedLocally) {
      handleShowToast('Report saved to offline cache. Will auto-sync when online.', 'warning');
    } else {
      handleShowToast('Field report verified and posted to regional operations board.', 'success');
    }
  };

  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const syncedCount = ApiService.syncOfflineQueue();
      refreshData();
      setIsSyncing(false);
      handleShowToast(`Synchronized ${syncedCount} queued field reports to central database.`, 'success');
    }, 400);
  };

  const handleToggleNetwork = (status: NetworkStatus) => {
    ApiService.setNetworkStatus(status);
    setNetworkStatus(status);
    handleShowToast(`Connectivity set to: ${status.toUpperCase()}`, status === 'offline' ? 'warning' : 'info');
  };

  const handleOpenLocationInspector = (
    target: RiskZone | ResponsePriority | LiveAlert | FieldReport | string | { district?: string; location?: string; name?: string; zoneName?: string; [key: string]: any }
  ) => {
    let resolvedZone: RiskZone | undefined;

    if (typeof target === 'object' && target !== null) {
      if ('coordinates' in target && 'slopeAngle' in target && 'soilMoisture' in target) {
        resolvedZone = target as RiskZone;
      } else {
        const targetId = (target as any).zoneId || (target as any).id;
        const targetName = String((target as any).zoneName || (target as any).name || (target as any).location || '').toLowerCase();
        const targetDistrict = String((target as any).district || '').toLowerCase();

        resolvedZone = zones.find(z => {
          if (targetId && z.id.toLowerCase() === String(targetId).toLowerCase()) return true;
          if (targetName && (z.name.toLowerCase().includes(targetName) || targetName.includes(z.name.toLowerCase()))) return true;
          if (targetDistrict && (z.district.toLowerCase() === targetDistrict || targetDistrict.includes(z.district.toLowerCase()))) return true;
          return false;
        });
      }
    } else if (typeof target === 'string') {
      const q = target.toLowerCase().trim();
      resolvedZone = zones.find(z => 
        z.id.toLowerCase() === q ||
        z.name.toLowerCase().includes(q) ||
        q.includes(z.name.toLowerCase()) ||
        z.district.toLowerCase().includes(q) ||
        q.includes(z.district.toLowerCase())
      );
    }

    const finalZone = resolvedZone || zones[0];
    if (finalZone) {
      setSelectedMapZone(finalZone);
      setInspectionData({
        type: 'zone',
        item: finalZone
      });
    }
  };

  const handleExportData = (format: 'geojson' | 'csv') => {
    const dataStr = format === 'geojson' 
      ? JSON.stringify({ type: 'FeatureCollection', features: zones }, null, 2)
      : 'ID,Name,District,State,RiskLevel,Probability,Rainfall\n' + zones.map(z => `${z.id},"${z.name}",${z.district},${z.state},${z.riskLevel},${z.probability},${z.rainfall24h}`).join('\n');
    
    const blob = new Blob([dataStr], { type: format === 'geojson' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ner_landslide_telemetry_${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    handleShowToast(`Exported ${format.toUpperCase()} dataset successfully.`, 'success');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Offline Status Bar */}
      <OfflineBanner
        status={networkStatus}
        pendingSyncCount={pendingOfflineCount}
        onStatusChange={handleToggleNetwork}
        onSyncNow={handleForceSync}
        onForceSync={handleForceSync}
        isSyncing={isSyncing}
      />

      {/* Main Header */}
      <Header
        activeTab={selectedDistrictZone ? '' : activeTab}
        onTabChange={(tab) => {
          setSelectedDistrictZone(null);
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        onLanguageChange={(lang) => {
          setLanguage(lang);
          handleShowToast(`Language switched to ${lang}`, 'info');
        }}
        unreadNotifsCount={alerts.filter(a => a.status === 'Active').length}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogout={() => handleShowToast('Session authenticated via Govt NIC credentials.', 'info')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* District Detail View (When active) */}
        {selectedDistrictZone ? (
          <DistrictDetailView
            zone={selectedDistrictZone}
            onBack={() => setSelectedDistrictZone(null)}
            onExportReport={() => handleShowToast(`Generated official disaster report for ${selectedDistrictZone.district}.`, 'success')}
            onOpenSensorDiagnostic={(sensor) => setActiveSensorDiagnostic(sensor)}
            onShowToast={handleShowToast}
          />
        ) : (
          <>
            {/* TAB 1: DASHBOARD (MAIN COMMAND OVERVIEW) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Official Incident Command Strip */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          {t('regionalAlertLevel')}
                        </span>
                        <span className="text-xs font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          {t('alertLevelOrange')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {t('alertLevelOrangeDesc')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 shadow-xs transition-colors"
                    >
                      <Plus size={14} />
                      <span>{t('reportHazard')}</span>
                    </button>
                    <button
                      onClick={() => handleExportData('csv')}
                      className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
                    >
                      <Download size={13} />
                      <span>{t('exportTelemetry')}</span>
                    </button>
                  </div>
                </div>

                {/* Section 5: Five Summary KPI Cards */}
                <KpiCards onCardClick={handleKpiCardClick} />

                {/* Section 6 & 7: Main GIS Risk Map (Visual Centerpiece) + Live Alerts Panel */}
                {isCenterpieceMode ? (
                  <div className="space-y-5">
                    <div className="w-full">
                      <GISMap
                        zones={zones}
                        selectedZone={selectedMapZone}
                        onSelectZone={(zone) => setSelectedMapZone(zone)}
                        onViewDetailedAnalysis={(zone) => handleOpenLocationInspector(zone)}
                        onInspectZone={(zone) => handleOpenLocationInspector(zone)}
                        onOpenSensorDiagnostic={(sensor) => setActiveSensorDiagnostic(sensor)}
                        fullWidth={true}
                        isCenterpiece={true}
                        onToggleCenterpiece={() => setIsCenterpieceMode(false)}
                      />
                    </div>
                    <div className="w-full">
                      <LiveAlertsPanel
                        alerts={alerts}
                        onViewAllAlerts={() => setActiveTab('alerts')}
                        onSelectAlert={(alert) => setInspectionData({ type: 'alert', item: alert })}
                        onResolveAlert={handleResolveAlert}
                        onInspectLocation={(districtOrLocation, alert) => handleOpenLocationInspector(alert || districtOrLocation)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    <div className="lg:col-span-8">
                      <GISMap
                        zones={zones}
                        selectedZone={selectedMapZone}
                        onSelectZone={(zone) => setSelectedMapZone(zone)}
                        onViewDetailedAnalysis={(zone) => handleOpenLocationInspector(zone)}
                        onInspectZone={(zone) => handleOpenLocationInspector(zone)}
                        onOpenSensorDiagnostic={(sensor) => setActiveSensorDiagnostic(sensor)}
                        fullWidth={false}
                        isCenterpiece={false}
                        onToggleCenterpiece={() => setIsCenterpieceMode(true)}
                      />
                    </div>

                    <div className="lg:col-span-4 h-full flex flex-col">
                      <LiveAlertsPanel
                        alerts={alerts}
                        onViewAllAlerts={() => setActiveTab('alerts')}
                        onSelectAlert={(alert) => setInspectionData({ type: 'alert', item: alert })}
                        onResolveAlert={handleResolveAlert}
                        onInspectLocation={(districtOrLocation, alert) => handleOpenLocationInspector(alert || districtOrLocation)}
                      />
                    </div>
                  </div>
                )}

                {/* Section 8: Environmental Risk Indicators */}
                <EnvironmentalIndicators onOpenSensorDiagnostic={(sensor) => setActiveSensorDiagnostic(sensor)} />

                {/* Section 9 & 10: AI Landslide Prediction + Explainability */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2">
                    <AiPredictionCard 
                      onViewAiAnalysis={() => setActiveTab('analytics')}
                      selectedZone={selectedMapZone}
                      onClearFilter={() => setSelectedMapZone(null)}
                      onSelectZone={(zone) => setSelectedMapZone(zone)}
                      availableZones={zones}
                    />
                  </div>
                  <div>
                    <AiExplainabilityCard
                      onHighlightFactorOnMap={(factor) => {
                        handleShowToast(`Highlighting ${factor} indicator anomalies across active zones`, 'info');
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                    />
                  </div>
                </div>

                {/* Section 19: Emergency Response Priorities */}
                <EmergencyPrioritySection
                  priorities={priorities}
                  onAssignTeam={(priority) => {
                    handleOpenAssignModal({
                      id: priority.id,
                      title: priority.zoneName,
                      location: priority.district,
                      type: 'zone'
                    });
                  }}
                  onInspectZone={(priority) => handleOpenLocationInspector(priority)}
                />

                {/* Section 11: Highest Risk Locations Table */}
                <HighestRiskLocationsTable
                  zones={zones}
                  onSelectZone={(zone) => {
                    setSelectedMapZone(zone);
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  onInspectZone={(zone) => {
                    handleOpenLocationInspector(zone);
                  }}
                />

                {/* Section 12 & 13: Infrastructure & Road Connectivity */}
                <div className="space-y-4">
                  <InfrastructureStatusSection
                    onViewInfrastructureMap={() => setActiveTab('infrastructure')}
                  />
                  <RoadConnectivitySection
                    roads={roads}
                    onViewDetailedRoads={() => setActiveTab('infrastructure')}
                  />
                </div>

                {/* Section 14 & 15: Recent Field Reports */}
                <RecentFieldReportsSection
                  reports={reports}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                  onViewReportDetails={(report) => setInspectionData({ type: 'report', item: report })}
                  onAssignTeam={(report) => {
                    handleOpenAssignModal({
                      id: report.id,
                      title: `${report.hazardType} at ${report.location}`,
                      location: report.district,
                      type: 'report'
                    });
                  }}
                  onResolveReport={handleResolveReport}
                  onViewAllReports={() => setActiveTab('field-reports')}
                />
              </div>
            )}

            {/* TAB 2: RISK MAP FULL VIEW */}
            {activeTab === 'risk-map' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center border border-blue-200">
                        <MapPin size={18} />
                      </div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">
                        {t('liveLandslideRiskMap')}
                      </h1>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {t('mapSubtitle')}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                  >
                    ← {t('navDashboard')}
                  </button>
                </div>

                <GISMap
                  zones={zones}
                  selectedZone={selectedMapZone}
                  onSelectZone={(zone) => setSelectedMapZone(zone)}
                  onViewDetailedAnalysis={(zone) => handleOpenLocationInspector(zone)}
                  onInspectZone={(zone) => handleOpenLocationInspector(zone)}
                  onOpenSensorDiagnostic={(sensor) => setActiveSensorDiagnostic(sensor)}
                  fullWidth
                />

                <HighestRiskLocationsTable
                  zones={zones}
                  onSelectZone={(zone) => setSelectedMapZone(zone)}
                  onInspectZone={(zone) => handleOpenLocationInspector(zone)}
                />
              </div>
            )}

            {/* TAB 3: AI PREDICTIONS & ANALYTICS */}
            {(activeTab === 'ai-predictions' || activeTab === 'analytics') && (
              <AnalyticsView
                zones={zones}
                selectedZone={selectedMapZone}
                onClearFilter={() => setSelectedMapZone(null)}
                onNavigateDistrict={(zone) => {
                  setSelectedDistrictZone(zone);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectZone={(zone) => {
                  setSelectedMapZone(zone);
                }}
                onSwitchToMapWithState={(stateName, zone) => {
                  if (zone) setSelectedMapZone(zone);
                  setActiveTab('risk-map');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  handleShowToast(`Filtered map to ${stateName}`, 'info');
                }}
                onHighlightFactorOnMap={(factor) => {
                  setActiveTab('risk-map');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  handleShowToast(`Highlighting ${factor} indicator anomalies on map`, 'info');
                }}
              />
            )}

            {/* TAB 4: ALERTS */}
            {activeTab === 'alerts' && (
              <AlertsManagementView
                alerts={alerts}
                onSelectAlert={(alert) => setInspectionData({ type: 'alert', item: alert })}
                onAssignTeam={(alert) => {
                  handleOpenAssignModal({
                    id: alert.id,
                    title: alert.title,
                    location: alert.location,
                    type: 'alert'
                  });
                }}
                onResolveAlert={handleResolveAlert}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onInspectLocation={(districtOrLocation, alert) => handleOpenLocationInspector(alert || districtOrLocation)}
              />
            )}

            {/* TAB 5: FIELD REPORTS */}
            {activeTab === 'field-reports' && (
              <FieldOperationsView
                reports={reports}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onViewReportDetails={(report) => setInspectionData({ type: 'report', item: report })}
                onAssignTeam={(report) => {
                  handleOpenAssignModal({
                    id: report.id,
                    title: `${report.hazardType} (${report.location})`,
                    location: report.district,
                    type: 'report'
                  });
                }}
                onResolveReport={handleResolveReport}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onInspectLocation={(districtOrLocation, report) => handleOpenLocationInspector(report || districtOrLocation)}
              />
            )}

            {/* TAB 6: INFRASTRUCTURE & ROAD CONNECTIVITY */}
            {activeTab === 'infrastructure' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center border border-blue-200">
                        <Route size={18} />
                      </div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">
                        {t('infrastructureStatus')}
                      </h1>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Comprehensive monitoring of 126 critical national highways, state highways, strategic bridges and valley transit links.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                  >
                    ← {t('navDashboard')}
                  </button>
                </div>

                <InfrastructureStatusSection onViewInfrastructureMap={() => setActiveTab('risk-map')} />
                <RoadConnectivitySection roads={roads} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Main Footer */}
     <Footer 
        onNavigate={(tabKey) => {
          setActiveTab(tabKey);
        }} 
        onSelectState={(stateName) => {
          setSelectedState(stateName);
          setActiveTab('risk-map');
        }} 
      />

      {/* Floating Modals */}
      <ReportHazardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        networkStatus={networkStatus}
        onSubmitReport={handleSubmitFieldReport}
      />

      {assignTarget && (
        <AssignTeamModal
          isOpen={isAssignTeamModalOpen}
          onClose={() => {
            setIsAssignTeamModalOpen(false);
            setAssignTarget(null);
          }}
          targetTitle={assignTarget.title}
          targetLocation={assignTarget.location}
          onConfirmAssignment={handleConfirmTeamAssignment}
        />
      )}

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        language={language}
        onLanguageChange={(lang) => {
          setLanguage(lang);
          handleShowToast(`Language preference set to ${lang}`, 'info');
        }}
        networkStatus={networkStatus}
        onToggleNetworkStatus={handleToggleNetwork}
        pendingOfflineCount={pendingOfflineCount}
        onForceSync={handleForceSync}
        onExportData={handleExportData}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        alerts={alerts}
        onSelectAlert={(alert) => setInspectionData({ type: 'alert', item: alert })}
        onClearAll={() => handleShowToast('All notifications acknowledged.', 'info')}
      />

      <InspectionDetailModal
        isOpen={Boolean(inspectionData)}
        onClose={() => setInspectionData(null)}
        data={inspectionData}
        onAssignTeam={(item) => {
          setInspectionData(null);
          handleOpenAssignModal({
            id: item.id,
            title: item.title || item.name || item.hazardType,
            location: item.location || item.district,
            type: inspectionData?.type || 'alert'
          });
        }}
        onNavigateDistrict={(zone) => {
          setInspectionData(null);
          setSelectedDistrictZone(zone);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSensorDiagnostic={(sensor) => setActiveSensorDiagnostic(sensor)}
        onInspectLocationFromAlertOrReport={(districtOrLocation) => {
          handleOpenLocationInspector(districtOrLocation);
        }}
      />

      {/* Sensor Diagnostic & Telemetry Modal */}
      {activeSensorDiagnostic && (
        <SensorDiagnosticModal
          sensor={activeSensorDiagnostic}
          onClose={() => setActiveSensorDiagnostic(null)}
          onShowToast={handleShowToast}
        />
      )}

      {/* Metric Detail Modal for Summary Cards */}
      {activeMetricModal && (
        <MetricDetailModal
          isOpen={Boolean(activeMetricModal)}
          onClose={() => setActiveMetricModal(null)}
          type={activeMetricModal.type}
          zone={activeMetricModal.zone}
          onShowToast={handleShowToast}
        />
      )}

      {/* Global Toast Notification */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
