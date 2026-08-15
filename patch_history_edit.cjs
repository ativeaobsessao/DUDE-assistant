const fs = require('fs');
let code = fs.readFileSync('src/pages/History.tsx', 'utf8');

const importsToAdd = `import { MealModal } from '../components/meals/MealModal';
import { MedicationModal } from '../components/medications/MedicationModal';`;

code = code.replace(
  "import { ChevronDown, ChevronUp } from 'lucide-react';",
  "import { ChevronDown, ChevronUp } from 'lucide-react';\n" + importsToAdd
);

const historyDayGroupProps = `function HistoryDayGroup({ 
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
}) {`;

code = code.replace(
  `function HistoryDayGroup({ 
  dateStr, 
  events, 
  closure 
}: { 
  key?: React.Key, 
  dateStr: string, 
  events: TimelineEvent[],
  closure?: any 
}) {`,
  historyDayGroupProps
);

const onClickReplace = `              onClick={() => {
                if (event.type === 'meal') {
                  onEditMeal(event as MealEventData, dateStr);
                } else {
                  onEditMed(event as MedicationEventData, dateStr);
                }
              }}`;

code = code.replace(
  `              onClick={() => {
                // Ready for future editing
              }}`,
  onClickReplace
);

const stateToAdd = `  const [profile, setProfile] = useState<any>(null);
  const [selectedMealEvent, setSelectedMealEvent] = useState<{ event: MealEventData, dateStr: string } | null>(null);
  const [selectedMedEvent, setSelectedMedEvent] = useState<{ event: MedicationEventData, dateStr: string } | null>(null);`;

code = code.replace(
  "  const [closures, setClosures] = useState<Record<string, any>>({});",
  "  const [closures, setClosures] = useState<Record<string, any>>({});\n" + stateToAdd
);

code = code.replace(
  "      if (!prof) return;",
  "      if (!prof) return;\n      setProfile(prof);"
);

const renderModals = `        </div>
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
    </MainLayout>`;

code = code.replace(
  `        </div>
      </div>
    </MainLayout>`,
  renderModals
);

const renderGroups = `              <HistoryDayGroup 
                key={dateStr}
                dateStr={dateStr}
                events={groupedEvents[dateStr]}
                closure={closures[dateStr]}
                onEditMeal={(event, date) => setSelectedMealEvent({ event, dateStr: date })}
                onEditMed={(event, date) => setSelectedMedEvent({ event, dateStr: date })}
              />`;

code = code.replace(
  `              <HistoryDayGroup 
                key={dateStr}
                dateStr={dateStr}
                events={groupedEvents[dateStr]}
                closure={closures[dateStr]}
              />`,
  renderGroups
);

fs.writeFileSync('src/pages/History.tsx', code);
