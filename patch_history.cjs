const fs = require('fs');
let code = fs.readFileSync('src/pages/History.tsx', 'utf8');

code = code.replace(
  "import { getHistoricalMealLogs, getHistoricalMedicationLogs, getHistoricalDailyClosures, createDailyClosure, getPatient, getCurrentProfile } from '../services/api';",
  "import { getHistoricalMealLogs, getHistoricalMedicationLogs, getHistoricalDailyClosures, createDailyClosure, getPatient, getCurrentProfile } from '../services/api';\nimport { DayEditModal } from '../components/history/DayEditModal';"
);

// Add onOpenDayEdit to HistoryDayGroup
code = code.replace(
  "  isClosingDay,\n}: {\n  day: DayData;",
  "  isClosingDay,\n  onOpenDayEdit,\n}: {\n  day: DayData;\n  onOpenDayEdit: () => void;"
);

// Add the button right after Status banner in HistoryDayGroup
const statusBannerReplacement = `          {/* Edit button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDayEdit();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            Editar registros deste dia
          </button>

          {/* Meals section */}`;
code = code.replace("          {/* Meals section */}", statusBannerReplacement);

// Add state to HistoryScreen
code = code.replace(
  "  const [closingDateStr, setClosingDateStr] = useState<string | null>(null);",
  "  const [closingDateStr, setClosingDateStr] = useState<string | null>(null);\n  const [editDay, setEditDay] = useState<{ dateStr: string; friendlyDate: string } | null>(null);"
);

// Pass onOpenDayEdit from HistoryScreen to HistoryDayGroup
code = code.replace(
  "                onCloseDay={handleCloseDay}\n                isClosingDay={closingDateStr === day.dateStr}\n              />",
  "                onCloseDay={handleCloseDay}\n                isClosingDay={closingDateStr === day.dateStr}\n                onOpenDayEdit={() => setEditDay({ dateStr: day.dateStr, friendlyDate: formatFriendlyDate(day.dateStr) })}\n              />"
);

// Render DayEditModal at the end of HistoryScreen
const modalRender = `      {/* Day Edit Modal */}
      {editDay && patient && profile && (
        <DayEditModal
          isOpen={!!editDay}
          onClose={() => setEditDay(null)}
          dateStr={editDay.dateStr}
          friendlyDate={editDay.friendlyDate}
          patientId={patient.id}
          profileId={profile.id}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </MainLayout>
  );
}`;
code = code.replace("    </MainLayout>\n  );\n}", modalRender);

fs.writeFileSync('src/pages/History.tsx', code);
