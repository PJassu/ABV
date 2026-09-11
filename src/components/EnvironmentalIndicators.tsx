import React, { useState } from 'react';
import { 
  CloudRain, 
  Droplets, 
  Mountain, 
  CloudLightning, 
  TrendingUp, 
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { SensorDiagnosticModal, SensorTelemetryItem } from './SensorDiagnosticModal';
import { getEnvironmentalIndicatorTelemetry } from '../utils/sensorTelemetryData';
import { useTranslation } from '../data/translations';

interface EnvironmentalIndicatorsProps {
  onOpenSensorDiagnostic?: (sensor: SensorTelemetryItem) => void;
}

export const EnvironmentalIndicators: React.FC<EnvironmentalIndicatorsProps> = ({
  onOpenSensorDiagnostic
}) => {
  const { t } = useTranslation();
  const [selectedSensor, setSelectedSensor] = useState<SensorTelemetryItem | null>(null);

  const handleCardClick = (type: 'rainfall' | 'soil_moisture' | 'slope' | 'forecast') => {
    const sensorData = getEnvironmentalIndicatorTelemetry(type);
    if (onOpenSensorDiagnostic) {
      onOpenSensorDiagnostic(sensorData);
    } else {
      setSelectedSensor(sensorData);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('environmentalRiskIndicators')}</span>
            <span className="text-[10px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
              <Activity size={12} className="text-blue-700" />
              <span>{t('clickToDiagnose')}</span>
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {t('environmentalTelemetryDesc')}
          </p>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          {t('syncMinAgo')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: RAINFALL */}
        <div 
          role="button"
          tabIndex={0}
          onClick={() => handleCardClick('rainfall')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick('rainfall'); }}
          className="group bg-white rounded-xl border border-slate-200 p-4.5 shadow-xs hover:border-blue-500 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-900 transition-colors">
                {t('rainfall24h')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                <CloudRain size={18} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                186
              </span>
              <span className="text-sm font-bold text-slate-500">mm</span>
              <span className="ml-auto inline-flex items-center gap-0.5 text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                <TrendingUp size={12} /> ↑ 34%
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>{t('rainfallThresholdExceeded')}</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-900 group-hover:text-blue-700">
            <span>{t('viewLiveTelemetryDiagnostics')}</span>
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* CARD 2: SOIL MOISTURE */}
        <div 
          role="button"
          tabIndex={0}
          onClick={() => handleCardClick('soil_moisture')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick('soil_moisture'); }}
          className="group bg-white rounded-xl border border-slate-200 p-4.5 shadow-xs hover:border-blue-500 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-900 transition-colors">
                {t('soilMoisture')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                <Droplets size={18} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-red-600 tracking-tight">
                91%
              </span>
              <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {t('criticalSaturation')}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>{t('porePressureHigh')}</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-900 group-hover:text-blue-700">
            <span>{t('viewLiveTelemetryDiagnostics')}</span>
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* CARD 3: SLOPE STABILITY */}
        <div 
          role="button"
          tabIndex={0}
          onClick={() => handleCardClick('slope')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick('slope'); }}
          className="group bg-white rounded-xl border border-slate-200 p-4.5 shadow-xs hover:border-blue-500 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-900 transition-colors">
                {t('slopeStability')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                <Mountain size={18} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                38°
              </span>
              <span className="text-xs text-slate-500 font-medium">{t('meanIncline')}</span>
              <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                {t('unstable')}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>{t('shearStrainRate')}</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-900 group-hover:text-blue-700">
            <span>{t('viewLiveTelemetryDiagnostics')}</span>
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* CARD 4: WEATHER FORECAST */}
        <div 
          role="button"
          tabIndex={0}
          onClick={() => handleCardClick('forecast')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick('forecast'); }}
          className="group bg-white rounded-xl border border-slate-200 p-4.5 shadow-xs hover:border-blue-500 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-900 transition-colors">
                {t('weatherForecast')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                <CloudLightning size={18} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {t('heavyRain')}
              </span>
              <span className="ml-auto text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {t('next6Hours')}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>{t('imdWarningOrange')}</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-900 group-hover:text-blue-700">
            <span>{t('viewLiveTelemetryDiagnostics')}</span>
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>

      {/* Internal Modal fallback if not handled at parent */}
      {selectedSensor && (
        <SensorDiagnosticModal
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
        />
      )}
    </div>
  );
};
