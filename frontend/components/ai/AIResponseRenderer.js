'use client';

import React from 'react';
import { AIMarkdownRenderer } from './AIMarkdownRenderer';
import { AIAppointmentCard } from './AIAppointmentCard';
import { AIQueueCard } from './AIQueueCard';
import { AIProfessionalCard } from './AIProfessionalCard';
import { AIStatsCard } from './AIStatsCard';
import { AIAvailabilityCard } from './AIAvailabilityCard';
import { AIServiceCard } from './AIServiceCard';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIResponseRenderer({ message = '', sections = [], rawText = '', onActionClick }) {
  // If neither structured message nor sections exist, fallback to rawText
  const displayMessage = message || rawText;
  const hasSections = Array.isArray(sections) && sections.length > 0;

  return (
    <div className="space-y-3">
      {/* 1. Main summary message rendered in Markdown */}
      {displayMessage && (
        <AIMarkdownRenderer content={displayMessage} />
      )}

      {/* 2. Structured Sections Grid */}
      {hasSections && (
        <div className="space-y-3 pt-1">
          {sections.map((section, idx) => {
            if (!section) return null;

            switch (section.type) {
              case 'appointments':
                return (
                  <div key={idx} className="space-y-2">
                    {section.title && (
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                        <span>{section.title}</span>
                      </h4>
                    )}
                    <div className="grid grid-cols-1 gap-2">
                      {Array.isArray(section.items) &&
                        section.items.map((item, itemIdx) => (
                          <AIAppointmentCard key={itemIdx} item={item} onActionClick={onActionClick} />
                        ))}
                    </div>
                  </div>
                );

              case 'appointment':
                return (
                  <div key={idx} className="space-y-2">
                    {section.title && (
                      <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1">
                        {section.title}
                      </h4>
                    )}
                    <AIAppointmentCard item={section.item || section.data} onActionClick={onActionClick} />
                  </div>
                );

              case 'queue':
                return (
                  <AIQueueCard
                    key={idx}
                    data={section.data || section}
                    title={section.title}
                    onActionClick={onActionClick}
                  />
                );

              case 'professionals':
                return (
                  <div key={idx} className="space-y-2">
                    {section.title && (
                      <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1">
                        {section.title}
                      </h4>
                    )}
                    <div className="grid grid-cols-1 gap-2">
                      {Array.isArray(section.items) &&
                        section.items.map((pro, proIdx) => (
                          <AIProfessionalCard key={proIdx} item={pro} onActionClick={onActionClick} />
                        ))}
                    </div>
                  </div>
                );

              case 'statistics':
                return (
                  <AIStatsCard
                    key={idx}
                    data={section.data || section}
                    title={section.title}
                  />
                );

              case 'availability':
                return (
                  <AIAvailabilityCard
                    key={idx}
                    items={section.items}
                    title={section.title}
                    onActionClick={onActionClick}
                  />
                );

              case 'services':
                return (
                  <AIServiceCard
                    key={idx}
                    items={section.items}
                    title={section.title}
                    onActionClick={onActionClick}
                  />
                );

              case 'warning':
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      {section.title && <strong className="font-bold block mb-0.5">{section.title}</strong>}
                      <p className="leading-relaxed">{section.content || section.message}</p>
                    </div>
                  </div>
                );

              case 'error':
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      {section.title && <strong className="font-bold block mb-0.5">{section.title}</strong>}
                      <p className="leading-relaxed">{section.content || section.message}</p>
                    </div>
                  </div>
                );

              case 'list':
                return (
                  <div key={idx} className="space-y-1.5">
                    {section.title && (
                      <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1">
                        {section.title}
                      </h4>
                    )}
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                      {Array.isArray(section.items) &&
                        section.items.map((li, liIdx) => <li key={liIdx}>{li}</li>)}
                    </ul>
                  </div>
                );

              case 'text':
              default:
                return (
                  <div key={idx}>
                    {section.title && (
                      <h4 className="text-xs font-bold text-slate-800 mb-1">{section.title}</h4>
                    )}
                    <AIMarkdownRenderer content={section.content || section.text || ''} />
                  </div>
                );
            }
          })}
        </div>
      )}
    </div>
  );
}
