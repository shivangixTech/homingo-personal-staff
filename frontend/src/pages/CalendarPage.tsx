import { useState, useEffect } from 'react';
import {
  Clock,
  Video,
  MapPin,
  Users,
  AlertTriangle,
  Sparkles,
  Plus,
  Navigation,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { CalendarEvent } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';

export const CalendarPage: React.FC = () => {
  const { toast } = useToast();
  const { profile } = useUser();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('02:00 PM – 02:45 PM');
  const [newEventType, setNewEventType] = useState<'meeting' | 'focus' | 'personal' | 'travel'>('personal');
  const [newEventNotes, setNewEventNotes] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await apiService.getCalendarEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load calendar events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;

    try {
      const created = await apiService.scheduleCalendarEvent({
        title: newEventTitle,
        startTime: '2026-11-24T19:00:00Z',
        endTime: '2026-11-24T19:45:00Z',
        timeFormatted: newEventTime,
        location: 'Personal Calendar',
        attendees: [{ name: profile.name, email: profile.email }],
        category: newEventType,
        conflict: false,
        prepNotes: newEventNotes || 'Scheduled autonomously via Personal Chief of Staff.',
      });

      setEvents((prev) => [...prev, created]);
      setIsModalOpen(false);
      setNewEventTitle('');
      setNewEventNotes('');
      toast({
        title: 'Event Scheduled & Synchronized',
        description: `Added "${created.title}" with automatic travel buffers.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to schedule event', err);
      toast({ title: 'Failed to schedule event', type: 'critical' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Personal Schedule & Protected Buffers
            </h2>
            <Badge variant="indigo" size="sm">
              Today: Tuesday, Nov 24
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Homingo protects travel intervals between your home, clinic, and appointments to prevent delays and rush.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Appointment
          </Button>
        </div>
      </div>

      {/* AI Smart Buffer Notice Banner */}
      <div className="rounded-2xl border p-4 transition-all bg-gradient-to-r from-emerald-50/70 via-white to-indigo-50/50 border-emerald-200 dark:from-emerald-950/30 dark:via-slate-900 dark:to-indigo-950/30 dark:border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 mt-0.5">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Transit Buffer Guard: Meeting with Supplier, 25 Nov at 11:00 AM
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Homingo checked the shop day: delivery at the shop follows the same day at 4:00 PM, and the call with the accountant is on 26 Nov at 10:00 AM. No clashes.
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm" dot>
            Buffer Protected
          </Badge>
        </div>
      </div>

      {/* Timeline of Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Today's Timeline
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {events.length} Scheduled Blocks
          </span>
        </div>

        <div className="space-y-3">
          {events.map((evt) => {
            const isTravel = evt.category === 'travel';
            return (
              <Card
                key={evt.id}
                className={`p-4 sm:p-5 transition-all ${
                  isTravel
                    ? 'border-indigo-300 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-500/40'
                    : evt.conflict
                    ? 'border-rose-400 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-500/40'
                    : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl border shrink-0 w-28 text-center bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-white">
                      <Clock className="w-4 h-4 text-indigo-500 mb-1" />
                      <span className="text-xs font-mono font-bold leading-tight">
                        {evt.timeFormatted.split('–')[0]?.trim()}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {evt.timeFormatted.split('–')[1]?.trim()}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {evt.title}
                        </h4>
                        <Badge
                          variant={
                            evt.category === 'focus'
                              ? 'indigo'
                              : evt.category === 'travel'
                              ? 'info'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {evt.category}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {evt.location}
                        </span>
                        {evt.attendees.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {evt.attendees.map((a) => a.name).join(', ')}
                          </span>
                        )}
                      </div>

                      {/* AI Briefing Memo */}
                      {evt.prepNotes && (
                        <div className="mt-2 p-2.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2 bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-300">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-indigo-200">
                              Homingo Brief:
                            </span>{' '}
                            {evt.prepNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {evt.meetUrl && (
                      <a href={evt.meetUrl} target="_blank" rel="noreferrer">
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Video className="w-3.5 h-3.5" />}
                        >
                          Join Call
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast({
                          title: 'Buffer intact',
                          description: 'No schedule adjustments required.',
                          type: 'info',
                        })
                      }
                    >
                      Reschedule
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Personal Event"
        description="Homingo will automatically verify your schedule and reserve necessary travel buffers."
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Event / Appointment Title
            </label>
            <input
              type="text"
              required
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="e.g. Meeting with supplier, Delivery at the shop, Call with accountant"
              className="w-full rounded-xl border px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 border-slate-300 dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Time Window
              </label>
              <input
                type="text"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                placeholder="02:00 PM – 02:45 PM"
                className="w-full rounded-xl border px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 border-slate-300 dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Category
              </label>
              <select
                value={newEventType}
                onChange={(e) => setNewEventType(e.target.value as any)}
                className="w-full rounded-xl border px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 border-slate-300 dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="personal">Personal / Wellness</option>
                <option value="meeting">Meeting / Sync</option>
                <option value="focus">Deep Focus Block</option>
                <option value="travel">Transit & Commute</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Preparation / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={newEventNotes}
              onChange={(e) => setNewEventNotes(e.target.value)}
              placeholder="Any details for Homingo to monitor before this event..."
              className="w-full rounded-xl border px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 border-slate-300 dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm & Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
