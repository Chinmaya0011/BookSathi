'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  Filter,
  UserCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { appointmentService } from '@/services/appointment.service';
import { dedupeQuery } from '@/lib/queryCache';
import { formatDisplayDate, formatINR } from '@/lib/utils';
import ClientDetailDrawer from '@/components/dashboard/ClientDetailDrawer';
import ManualBookingModal from '@/components/dashboard/ManualBookingModal';
import { appointmentTypeService } from '@/services/appointmentType.service';

export default function ClientsDirectoryPage() {
  const { profile, user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Manual booking modal state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [manualForm, setManualForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    appointmentTypeId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    reason: '',
    fee: 500,
    duration: 30,
  });
  const [creatingManual, setCreatingManual] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await dedupeQuery(
        'professional:appointments:all',
        async () => {
          const data = await appointmentService.getProfessionalAppointments();
          return data?.data || data || [];
        },
        { ttl: 60000 }
      );
      setAppointments(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('Failed to load clients:', e);
      toast.error('Failed to load clients directory');
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesLazily = async () => {
    try {
      const data = await appointmentTypeService.getAppointmentTypes();
      const fetched = data?.data || [];
      setServices(fetched);
      if (fetched.length > 0 && !manualForm.appointmentTypeId) {
        setManualForm((prev) => ({
          ...prev,
          appointmentTypeId: fetched[0]._id,
          fee: fetched[0].fee,
          duration: fetched[0].duration,
        }));
      }
    } catch (e) {}
  };

  // Group appointments into distinct client directory records
  const clientsList = useMemo(() => {
    const map = new Map();

    appointments.forEach((appt) => {
      const phoneKey = appt.customerPhone ? appt.customerPhone.trim() : appt.customerName;
      if (!phoneKey) return;

      if (!map.has(phoneKey)) {
        map.set(phoneKey, {
          id: appt._id,
          name: appt.customerName || 'Patient',
          phone: appt.customerPhone || '',
          email: appt.customerEmail || '',
          gender: appt.gender,
          age: appt.age,
          totalVisits: 1,
          lastVisit: appt.date,
          lifetimeSpent: Number(appt.fee) || 0,
          appointments: [appt],
        });
      } else {
        const existing = map.get(phoneKey);
        existing.totalVisits += 1;
        existing.lifetimeSpent += Number(appt.fee) || 0;
        existing.appointments.push(appt);
        if (new Date(appt.date) > new Date(existing.lastVisit)) {
          existing.lastVisit = appt.date;
        }
      }
    });

    return Array.from(map.values());
  }, [appointments]);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientsList;
    return clientsList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [clientsList, search]);

  const handleOpenClientDrawer = (client) => {
    setSelectedClient(client);
    setDrawerOpen(true);
  };

  const handleBookAgain = (client) => {
    fetchServicesLazily();
    setManualForm({
      customerName: client.name,
      customerPhone: client.phone,
      customerEmail: client.email || '',
      appointmentTypeId: services[0]?._id || '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      reason: '',
      fee: services[0]?.fee || 500,
      duration: services[0]?.duration || 30,
    });
    setManualModalOpen(true);
  };

  const handleCreateManualBooking = async (e) => {
    e.preventDefault();
    if (!manualForm.customerName.trim() || !manualForm.customerPhone.trim()) {
      toast.warning('Please enter client name and phone number');
      return;
    }
    setCreatingManual(true);
    try {
      await appointmentService.createManualBooking(manualForm);
      setManualModalOpen(false);
      toast.success('Appointment scheduled successfully!');
      loadClients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setCreatingManual(false);
    }
  };

  return (
    <div className="space-y-4 font-sans animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Clients Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your patient records, consultation history, and follow-ups
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              fetchServicesLazily();
              setManualModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Client</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, mobile number, or email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
          {filteredClients.length} client{filteredClients.length === 1 ? '' : 's'} found
        </span>
      </div>

      {/* Clients List Card Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 w-28 bg-slate-100 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No clients found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search
              ? `No clients matched "${search}". Try searching with another name or number.`
              : 'As customers book appointments through your link or walk-in, their client profiles will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredClients.map((client) => {
            const cleanPhone = client.phone ? client.phone.replace(/[^0-9]/g, '') : '';
            const whatsappUrl = cleanPhone
              ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                  `Hello ${client.name}, Dr./Pro ${profile?.name || ''} here.`
                )}`
              : null;

            return (
              <div
                key={client.phone || client.name}
                onClick={() => handleOpenClientDrawer(client)}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {client.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {client.phone || 'No phone'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    {client.totalVisits} visit{client.totalVisits === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Last: {client.lastVisit ? formatDisplayDate(client.lastVisit) : 'Recent'}
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {client.phone && (
                      <a
                        href={`tel:${client.phone}`}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Call Client"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenClientDrawer(client)}
                      className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                      title="Open Profile"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client Detail Slide-Over Drawer */}
      <ClientDetailDrawer
        client={selectedClient}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onBookAgain={handleBookAgain}
        profile={profile}
      />

      {/* Manual Booking Modal */}
      <ManualBookingModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        manualForm={manualForm}
        setManualForm={setManualForm}
        services={services}
        onServiceChange={(typeId) => {
          const found = services.find((s) => s._id === typeId);
          if (found) {
            setManualForm((prev) => ({
              ...prev,
              appointmentTypeId: typeId,
              fee: found.fee,
              duration: found.duration,
            }));
          }
        }}
        onSubmit={handleCreateManualBooking}
        creatingManual={creatingManual}
        profile={profile}
      />
    </div>
  );
}
