import React from 'react';
import { Coffee, Pill } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatTime } from '../../utils/date';
import { Badge } from '../ui/Badge';
import type { TimelineEvent } from '../../types/timeline';

export interface TimelineItemProps {
  event: TimelineEvent;
  onClick: () => void;
  key?: React.Key;
}

export function TimelineItem({ event, onClick }: TimelineItemProps) {
  
  const isMeal = event.type === 'meal';
  const Icon = isMeal ? Coffee : Pill;

  let badgeLabel = 'Aguardando';
  if (event.status === 'pending') badgeLabel = 'Pendente';
  if (event.status === 'confirmed') badgeLabel = 'Confirmado';
  if (event.status === 'attention') badgeLabel = 'Atenção';

  // For medications, let's refine the label if it's confirmed or attention
  let subLabel = '';
  if (event.type === 'medication_period') {
    const total = event.medications.length;
    const administered = event.logs.filter(l => l.status === 'administered').length;
    if (event.status === 'attention') {
      badgeLabel = 'Não administrado';
      subLabel = 'Verifique os detalhes';
    } else if (event.status === 'confirmed') {
      badgeLabel = `${administered} de ${total} confirmados`;
    } else if (event.status === 'pending') {
      badgeLabel = 'Pendente';
      subLabel = `${total} medicamentos`;
    } else {
       subLabel = `${total} medicamentos`;
    }
  } else if (event.type === 'meal') {
    if (event.status === 'confirmed' && event.log) {
      if (event.log.consumption_status === 'normal') subLabel = 'Comeu normalmente';
      if (event.log.consumption_status === 'partial') subLabel = 'Comeu parcialmente';
      if (event.log.consumption_status === 'none') {
        badgeLabel = 'Não comeu';
        subLabel = 'Registrado';
      }
    }
  }

  return (
    <div className="relative flex items-center justify-between group is-active">
      {/* Icon node */}
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-50 bg-white shadow-sm shrink-0 z-10",
        {
          'text-gray-400': event.status === 'waiting',
          'text-yellow-500': event.status === 'pending',
          'text-green-500': event.status === 'confirmed',
          'text-red-500': event.status === 'attention' || (event.type === 'meal' && event.log?.consumption_status === 'none'),
        }
      )}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Card */}
      <button 
        onClick={onClick}
        className={cn(
          "w-[calc(100%-3rem)] p-4 rounded-2xl border text-left transition-all active:scale-[0.98]",
          {
            'bg-white border-gray-100 hover:border-gray-200 shadow-sm': event.status === 'waiting',
            'bg-yellow-50/50 border-yellow-100 hover:border-yellow-200': event.status === 'pending',
            'bg-green-50/30 border-green-100 hover:border-green-200': event.status === 'confirmed',
            'bg-red-50/30 border-red-100 hover:border-red-200': event.status === 'attention',
          }
        )}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
              {formatTime(event.time)}
            </span>
            <h4 className="font-semibold text-gray-900">{event.title}</h4>
          </div>
          <Badge variant={
            event.status === 'confirmed' ? 'confirmed' : 
            event.status === 'pending' ? 'pending' : 
            event.status === 'attention' ? 'attention' : 
            (event.type === 'meal' && event.log?.consumption_status === 'none' ? 'attention' : 'waiting')
          }>
            {badgeLabel}
          </Badge>
        </div>
        
        {subLabel && (
          <p className="text-sm text-gray-600 mt-1">{subLabel}</p>
        )}
        
        {event.type === 'meal' && event.log?.description && (
          <p className="text-sm text-gray-500 mt-2 truncate">"{event.log.description}"</p>
        )}
      </button>
    </div>
  );
}
