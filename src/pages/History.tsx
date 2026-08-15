import React, { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { 
  getCurrentProfile, 
  getPatient, 
  getHistoricalMealLogs,
  getHistoricalMedicationLogs,
  getMealPhotoUrl,
  getHistoricalDailyClosures
} from '../services/api';
import { getLocalDateString } from '../utils/date';
import { Spinner } from '../components/ui/Spinner';
import { UserProfile } from '../components/ui/UserProfile';
import { TimelineItem } from '../components/timeline/TimelineItem';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MealModal } from '../components/meals/MealModal';
import { MedicationModal } from '../components/medications/MedicationModal';
import type { TimelineEvent, MealEventData, MedicationEventData } from '../types/timeline';

function HistoryDayGroup({ 
  dateStr, 
  events, 
  closure,
  onEditMeal,
  onEditMed
}: { 
  key?: React.Key, 
  dateStr: string, 
  events: TimelineEvent[],
  closure?: any,
  onEditMeal: (event: MealEventData, dateStr: string) => void,
  onEditMed: (event: MedicationEventData, dateStr: string) => void
}) {
  const [expanded, setExpanded] = useState(false);
  
  // Safe date parsing to avoid timezone shifts
  const d = new Date(dateStr + 'T00:00:00');
  let friendly = new Intl.DateTimeFormat('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(d);
  friendly = friendly.charAt(0).toUpperCase() + friendly.slice(1);


  return (
    <div className="mb-4">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-col p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
      >
        <div className="w-full flex items-center justify-between mb-1">
          <span className="font-semibold text-gray-900 uppercase text-xs tracking-wider">
            {friendly}
            {closure && <span className="ml-2 text-green-600">✓</span>}
            {!closure && <span className="ml-2 text-gray-400">○</span>}
          </span>
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
        
        {closure ? (
          <div className="text-left">
            <span className="text-[11px] text-gray-500">
              Encerrado por {closure.closed_by_profile?.name || 'Familiar'} às {new Date(closure.closed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ) : (
          <div className="text-left">
            <span className="text-[11px] text-gray-500">Dia em aberto</span>
          </div>
        )}
      </button>
      
      {expanded && (
        <div className="mt-4 space-y-4 px-2">
          {closure ? (
            <div className="flex items-center space-x-2 text-xs font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>DIA ENCERRADO</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-lg mb-4">
              <span className="text-lg leading-none">○</span>
              <span>DIA EM ABERTO</span>
            </div>
          )}
          
          <div className="h-px w-full bg-gray-100 my-2"></div>

          {events.map((event, idx) => (

            <TimelineItem 
              key={`${event.id}-${idx}`} 
              event={event} 
              onClick={() => {
                if (event.type === 'meal') {
                  onEditMeal(event as MealEventData, dateStr);
                } else {
                  onEditMed(event as MedicationEventData, dateStr);
                }
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HistoryScreen({ onTabChange }: { onTabChange?: (tab: 'today' | 'history' | 'routine') => void }) {
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [groupedEvents, setGroupedEvents] = useState<Record<string, TimelineEvent[]>>({});
  const [closures, setClosures] = useState<Record<string, any>>({});
  const [profile, setProfile] = useState<any>(null);
  const [selectedMealEvent, setSelectedMealEvent] = useState<{ event: MealEventData, dateStr: string } | null>(null);
  const [selectedMedEvent, setSelectedMedEvent] = useState<{ event: MedicationEventData, dateStr: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const prof = await getCurrentProfile();
      if (!prof) return;
      setProfile(prof);

      const pat = await getPatient(prof.family_id);
      if (!pat) return;
      setPatient(pat);

      const localDate = getLocalDateString();
      
      const [mealLogs, medLogs, closuresData] = await Promise.all([
        getHistoricalMealLogs(pat.id, localDate),
        getHistoricalMedicationLogs(pat.id, localDate),
        getHistoricalDailyClosures(pat.id, localDate)
      ]);
      
      const closuresMap: Record<string, any> = {};
      for (const c of closuresData) {
        closuresMap[c.date] = c;
      }
      setClosures(closuresMap);



      const groups: Record<string, TimelineEvent[]> = {};

      for (const log of mealLogs) {
        const dateStr = log.event_date;
        if (!groups[dateStr]) groups[dateStr] = [];

        let photoSignedUrl = null;
        if (log.photo_url) {
          photoSignedUrl = await getMealPhotoUrl(log.photo_url);
        }

        const mealConfig = log.meal_config || { name: 'Refeição', scheduled_time: log.meal_time || '00:00:00' };

        groups[dateStr].push({
          id: log.meal_config_id || log.id,
          type: 'meal',
          time: log.meal_time || mealConfig.scheduled_time || '00:00:00',
          title: mealConfig.name,
          status: 'confirmed',
          mealConfig,
          log,
          photoSignedUrl
        });
      }

      const medLogsByDateAndPeriod: Record<string, Record<string, any[]>> = {};
      
      for (const log of medLogs) {
        const dateStr = log.event_date;
        const periodId = log.medication?.medication_period_id || 'unknown_period';
        
        if (!medLogsByDateAndPeriod[dateStr]) medLogsByDateAndPeriod[dateStr] = {};
        if (!medLogsByDateAndPeriod[dateStr][periodId]) medLogsByDateAndPeriod[dateStr][periodId] = [];
        
        medLogsByDateAndPeriod[dateStr][periodId].push(log);
      }

      for (const dateStr of Object.keys(medLogsByDateAndPeriod)) {
        if (!groups[dateStr]) groups[dateStr] = [];
        
        for (const periodId of Object.keys(medLogsByDateAndPeriod[dateStr])) {
          const logs = medLogsByDateAndPeriod[dateStr][periodId];
          const period = logs[0].medication?.period || { id: periodId, time: '00:00:00' };
          const medications = logs.map(l => l.medication).filter(Boolean);
          const fallbackTime = logs[0].created_at ? logs[0].created_at.substring(11, 16) + ':00' : '00:00:00';
          
          groups[dateStr].push({
            id: periodId,
            type: 'medication_period',
            time: period.time || fallbackTime,
            title: 'Medicamentos',
            status: 'confirmed',
            period,
            medications,
            logs
          });
        }
      }

      for (const dateStr of Object.keys(groups)) {
        groups[dateStr].sort((a, b) => a.time.localeCompare(b.time));
      }

      setGroupedEvents(groups);
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <MainLayout activeTab="history" onTabChange={onTabChange}>
        <div className="flex h-[80vh] items-center justify-center">
          <Spinner />
        </div>
      </MainLayout>
    );
  }

  if (!patient) {
    return (
      <MainLayout activeTab="history" onTabChange={onTabChange}>
        <div className="flex h-[80vh] items-center justify-center flex-col text-center px-6">
          <p className="text-gray-500">Paciente não encontrado.</p>
        </div>
      </MainLayout>
    );
  }

  const sortedDates = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a));

  return (
    <MainLayout activeTab="history" onTabChange={onTabChange}>
      <div className="max-w-md mx-auto w-full">
        <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-30 border-b border-gray-100/50 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Histórico</h1>
            <UserProfile />
          </div>
          <p className="text-sm text-gray-500">
            Registros anteriores de {patient.name}
          </p>
        </div>

        <div className="p-6">
          {sortedDates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum registro histórico encontrado.</p>
            </div>
          ) : (
            sortedDates.map(dateStr => (
              <HistoryDayGroup 
                key={dateStr}
                dateStr={dateStr}
                events={groupedEvents[dateStr]}
                closure={closures[dateStr]}
                onEditMeal={(event, date) => setSelectedMealEvent({ event, dateStr: date })}
                onEditMed={(event, date) => setSelectedMedEvent({ event, dateStr: date })}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Modals */}
      {selectedMealEvent && patient && profile && (
        <MealModal 
          isOpen={!!selectedMealEvent}
          onClose={() => setSelectedMealEvent(null)}
          event={selectedMealEvent.event}
          patientId={patient.id}
          profileId={profile.id}
          eventDate={selectedMealEvent.dateStr}
          onSuccess={() => { loadData(); setSelectedMealEvent(null); }}
        />
      )}
      {selectedMedEvent && patient && profile && (
        <MedicationModal 
          isOpen={!!selectedMedEvent}
          onClose={() => setSelectedMedEvent(null)}
          event={selectedMedEvent.event}
          patientId={patient.id}
          profileId={profile.id}
          eventDate={selectedMedEvent.dateStr}
          onSuccess={() => { loadData(); setSelectedMedEvent(null); }}
        />
      )}
    </MainLayout>
  );
}
