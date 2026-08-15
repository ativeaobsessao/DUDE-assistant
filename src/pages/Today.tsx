import React, { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { 
  getCurrentProfile, 
  getPatient, 
  getMealConfigs, 
  getMedicationPeriods, 
  getMedications,
  getMealLogs,
  getMedicationLogs,
  getPatientPhotoUrl,
  getMealPhotoUrl,
  getDailyClosure,
  createDailyClosure
} from '../services/api';
import { supabase } from '../services/supabase';
import { getLocalDateString, getCurrentLocalTime, formatFriendlyDate, getWeekdayName, formatTime } from '../utils/date';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { TimelineItem } from '../components/timeline/TimelineItem';
import { MealModal } from '../components/meals/MealModal';
import { UserProfile } from '../components/ui/UserProfile';
import { MedicationModal } from '../components/medications/MedicationModal';
import type { TimelineEvent, MealEventData, MedicationEventData } from '../types/timeline';

export function TodayScreen({ onTabChange }: { onTabChange?: (tab: 'today' | 'history' | 'routine') => void }) {
  const [loading, setLoading] = useState(true);
  const [dailyClosure, setDailyClosure] = useState<any>(null);
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [closingDay, setClosingDay] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [patientPhoto, setPatientPhoto] = useState<string | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  
  // Modals state
  const [selectedMealEvent, setSelectedMealEvent] = useState<MealEventData | null>(null);
  const [selectedMedEvent, setSelectedMedEvent] = useState<MedicationEventData | null>(null);

  const localDate = getLocalDateString();
  const friendlyDate = formatFriendlyDate(localDate);

  async function loadData() {
    setLoading(true);
    try {
      const prof = await getCurrentProfile();
      if (!prof) return;
      setProfile(prof);

      const pat = await getPatient(prof.family_id);
      if (!pat) return;
      setPatient(pat);

      if (pat.photo_url) {
        const url = await getPatientPhotoUrl(pat.id, pat.photo_url);
        setPatientPhoto(url);
      }

      await refreshTimeline(pat.id, localDate);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshTimeline(patientId: string, dateStr: string) {
    try {
      // Fetch configs and logs
      const [meals, medPeriods, allMeds, mealLogs, medLogs] = await Promise.all([
        getMealConfigs(patientId),
        getMedicationPeriods(patientId),
        getMedications(patientId),
        getMealLogs(patientId, dateStr),
        getMedicationLogs(patientId, dateStr)
      ]);

      const currentTime = getCurrentLocalTime();
      
      const closure = await getDailyClosure(patientId, localDate);
      setDailyClosure(closure);
      const currentWeekday = getWeekdayName(dateStr);

      const timeline: TimelineEvent[] = [];

      // 1. Process Meals
      for (const meal of meals) {
        const log = mealLogs.find(l => l.meal_config_id === meal.id);
        let status: 'waiting' | 'pending' | 'confirmed' = 'waiting';
        
        let photoSignedUrl = null;

        if (log) {
          status = 'confirmed';
          if (log.photo_url) {
            photoSignedUrl = await getMealPhotoUrl(log.photo_url);
          }
        } else if (meal.scheduled_time <= currentTime) {
          status = 'pending';
        }

        timeline.push({
          id: meal.id,
          type: 'meal',
          time: meal.scheduled_time,
          title: meal.name,
          status,
          mealConfig: meal,
          log,
          photoSignedUrl
        });
      }

      // 2. Process Medication Periods
      for (const period of medPeriods) {
        // Find meds for this period that should appear today
        const periodMeds = allMeds.filter(m => {
          if (m.medication_period_id !== period.id) return false;
          if (m.frequency === 'daily') return true;
          if (m.frequency === 'weekly') return m.weekday === currentWeekday;
          return false;
        });

        if (periodMeds.length === 0) continue; // Skip period if no meds today

        const periodLogs = medLogs.filter(l => periodMeds.some(m => m.id === l.medication_id));
        
        let status: 'waiting' | 'pending' | 'confirmed' | 'attention' = 'waiting';
        
        const hasNotAdministered = periodLogs.some(l => l.status === 'not_administered');
        const allAdministered = periodMeds.every(m => periodLogs.some(l => l.medication_id === m.id && l.status === 'administered'));
        const hasAnyLog = periodLogs.length > 0;

        if (hasNotAdministered) {
          status = 'attention';
        } else if (allAdministered) {
          status = 'confirmed';
        } else if (period.scheduled_time <= currentTime) {
          status = 'pending';
        }

        timeline.push({
          id: period.id,
          type: 'medication_period',
          time: period.scheduled_time,
          title: period.name,
          status,
          period,
          medications: periodMeds,
          logs: periodLogs
        });
      }

      // Sort timeline by time
      timeline.sort((a, b) => a.time.localeCompare(b.time));
      setEvents(timeline);
    } catch (error) {
      console.error("Error refreshing timeline:", error);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!patient) return;

    // Realtime setup
    const mealSub = supabase
      .channel('public:meal_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_logs' }, () => {
        refreshTimeline(patient.id, localDate);
      })
      .subscribe();

    const medSub = supabase
      .channel('public:medication_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medication_logs' }, () => {
        refreshTimeline(patient.id, localDate);
      })
      .subscribe();

    // Focus setup
    const handleFocus = () => {
      refreshTimeline(patient.id, localDate);
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      supabase.removeChannel(mealSub);
      supabase.removeChannel(medSub);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [patient?.id, localDate]);

  const handleMealRefresh = () => {
    if (patient) refreshTimeline(patient.id, localDate);
    setSelectedMealEvent(null);
  };

  const handleMedRefresh = () => {
    if (patient) refreshTimeline(patient.id, localDate);
    setSelectedMedEvent(null);
  };

  if (loading) {
    return (
      <MainLayout activeTab="today" onTabChange={onTabChange}>
        <div className="flex h-[80vh] items-center justify-center">
          <Spinner />
        </div>
      </MainLayout>
    );
  }

  if (!patient) {
    return (
      <MainLayout activeTab="today" onTabChange={onTabChange}>
        <div className="flex h-[80vh] items-center justify-center flex-col text-center px-6">
          <p className="text-gray-500">Paciente não encontrado ou rotina não configurada.</p>
        </div>
      </MainLayout>
    );
  }

  // Group events by time of day

  const isAllEventsCompleted = events.length > 0 && events.every(e => e.status === 'confirmed' || e.status === 'attention');
  
  const handleCloseDay = async () => {
    if (!patient || !profile) return;
    setClosingDay(true);
    try {
      const success = await createDailyClosure(profile.family_id, patient.id, localDate, profile.id);
      if (success) {
        setShowClosureModal(false);
        refreshTimeline(patient.id, localDate);
      } else {
        alert("Erro ao encerrar o dia.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClosingDay(false);
    }
  };

  const morning = events.filter(e => e.time < '12:00:00');

  const afternoon = events.filter(e => e.time >= '12:00:00' && e.time < '18:00:00');
  const night = events.filter(e => e.time >= '18:00:00');

  return (
    <MainLayout activeTab="today" onTabChange={onTabChange}>
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-30 border-b border-gray-100/50 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">DUDE</h1>
            <UserProfile />
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {patientPhoto ? (
                <img src={patientPhoto} alt={patient.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">👵</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{patient.name}</h2>
              <p className="text-sm text-gray-500">Hoje, {friendlyDate}</p>
            </div>
          </div>
        </div>


        {/* Timeline */}
        <div className="px-6 py-6 space-y-8">
          
          {morning.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Manhã</h3>
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-100">
                {morning.map(event => (
                  <TimelineItem 
                    key={event.id} 
                    event={event} 
                    onClick={() => event.type === 'meal' ? setSelectedMealEvent(event as MealEventData) : setSelectedMedEvent(event as MedicationEventData)} 
                  />
                ))}
              </div>
            </div>
          )}

          {afternoon.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Tarde</h3>
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-100">
                {afternoon.map(event => (
                  <TimelineItem 
                    key={event.id} 
                    event={event} 
                    onClick={() => event.type === 'meal' ? setSelectedMealEvent(event as MealEventData) : setSelectedMedEvent(event as MedicationEventData)} 
                  />
                ))}
              </div>
            </div>
          )}

          {night.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Noite</h3>
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-100">
                {night.map(event => (
                  <TimelineItem 
                    key={event.id} 
                    event={event} 
                    onClick={() => event.type === 'meal' ? setSelectedMealEvent(event as MealEventData) : setSelectedMedEvent(event as MedicationEventData)} 
                  />
                ))}
              </div>
            </div>
          )}
          
{/* Closure Area */}
        <div className="px-6 pb-6">
          {dailyClosure ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Dia encerrado</h3>
              <p className="text-sm text-gray-500 mt-1">
                Encerrado por {dailyClosure.closed_by_profile?.name || 'Familiar'} às {new Date(dailyClosure.closed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ) : isAllEventsCompleted ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col items-center text-center">
              <h3 className="font-semibold text-indigo-900 mb-1">Rotina do dia concluída</h3>
              <p className="text-sm text-indigo-700/80 mb-4">
                Todos os eventos programados para hoje foram registrados.
              </p>
              <button 
                onClick={() => setShowClosureModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors w-full sm:w-auto"
              >
                Encerrar Dia
              </button>
            </div>
          ) : null}
        </div>

        
          {events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum evento configurado para hoje.</p>
            </div>
          )}
        </div>
      </div>


      {showClosureModal && patient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Encerrar o dia?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Você está encerrando a rotina de {patient.name} de hoje. Depois disso, o dia aparecerá como concluído no Histórico.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowClosureModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCloseDay}
                disabled={closingDay}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 transition-colors"
              >
                {closingDay ? 'Encerrando...' : 'Encerrar dia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedMealEvent && patient && profile && (
        <MealModal 
          isOpen={!!selectedMealEvent}
          onClose={() => setSelectedMealEvent(null)}
          event={selectedMealEvent}
          patientId={patient.id}
          profileId={profile.id}
          eventDate={localDate}
          onSuccess={handleMealRefresh}
        />
      )}

      {selectedMedEvent && patient && profile && (
        <MedicationModal 
          isOpen={!!selectedMedEvent}
          onClose={() => setSelectedMedEvent(null)}
          event={selectedMedEvent}
          patientId={patient.id}
          profileId={profile.id}
          eventDate={localDate}
          onSuccess={handleMedRefresh}
        />
      )}

    </MainLayout>
  );
}
