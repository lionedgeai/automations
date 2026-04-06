import { useState, useEffect, useMemo } from 'react';
import { Patient } from '../types';
import { getPatients, aiFilterPatients } from '../api/patients';
import PatientModal from '../components/PatientModal';

type SortField = 'first_name' | 'last_name' | 'email' | 'procedure_interest' | 'last_visit_date' | 'engagement_score' | 'city' | 'lifetime_value';
type SortDirection = 'asc' | 'desc';

const EXAMPLE_QUERIES = [
  'Female LASIK patients in Los Angeles with high engagement',
  'Cataract patients over 65 with Medicare',
  'High value patients with procedure scheduled',
  'Patients from referrals under 40',
  'Premium Lens patients in San Francisco',
  'Male patients with follow-up scheduled',
];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // AI Search
  const [aiQuery, setAiQuery] = useState('');
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('engagement_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPatients();
      setPatients(data);
      setAllPatients(data);
      setIsFiltered(false);
      setAiExplanation('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleAISearch = async () => {
    if (!aiQuery.trim()) {
      // Reset to all patients
      setPatients(allPatients);
      setIsFiltered(false);
      setAiExplanation('');
      return;
    }

    setAiSearching(true);
    setError(null);
    try {
      const result = await aiFilterPatients(aiQuery.trim());
      setPatients(result.patients);
      setAiExplanation(result.explanation);
      setIsFiltered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI filter failed');
    } finally {
      setAiSearching(false);
    }
  };

  const handleClearFilter = () => {
    setAiQuery('');
    setPatients(allPatients);
    setIsFiltered(false);
    setAiExplanation('');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'last_visit_date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (sortField === 'lifetime_value') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }
      if (typeof aVal === 'string') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [patients, sortField, sortDirection]);

  const getAge = (dob: string) => {
    if (!dob) return '—';
    return Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000);
  };

  const getEngagementBadge = (score: number) => {
    if (score >= 70) return <span className="badge badge-green">{score}</span>;
    if (score >= 40) return <span className="badge badge-yellow">{score}</span>;
    return <span className="badge badge-red">{score}</span>;
  };

  const getProcedureBadge = (procedure: string) => {
    const colors: Record<string, string> = {
      'LASIK': 'badge-blue',
      'Cataract': 'badge-amber',
      'Premium Lens': 'badge-purple'
    };
    return <span className={`badge ${colors[procedure] || 'badge-blue'}`}>{procedure}</span>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'procedure_scheduled': 'badge-green',
      'follow_up_scheduled': 'badge-blue',
      'consultation_done': 'badge-amber',
      'waiting_authorization': 'badge-yellow',
      'no_show': 'badge-red',
      'none': '',
    };
    return (
      <span className={`badge ${colors[status] || ''}`}>
        {(status || 'none').replace(/_/g, ' ')}
      </span>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-slate-600">⇅</span>;
    return <span className="text-primary">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-3xl font-bold text-white mb-4">Patients</h1>
        
        {/* AI Search Bar */}
        <div className="relative">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Ask AI to filter patients... e.g. 'Female LASIK patients in LA with high engagement'"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
              {aiSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              onClick={handleAISearch}
              disabled={aiSearching}
              className="px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-slate-700 text-white rounded-xl font-medium transition-colors text-sm whitespace-nowrap"
            >
              {aiSearching ? '🔍 Searching...' : '🔍 AI Search'}
            </button>
            {isFiltered && (
              <button
                onClick={handleClearFilter}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-colors text-sm"
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Example queries */}
          {!isFiltered && !aiQuery && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-slate-500">Try:</span>
              {EXAMPLE_QUERIES.slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => { setAiQuery(q); }}
                  className="text-xs px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-full text-slate-400 hover:text-primary-light hover:border-primary/30 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results bar */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-400">
              {isFiltered ? (
                <>
                  <span className="text-primary-light font-medium">{patients.length}</span> of {allPatients.length} patients match
                </>
              ) : (
                <>Showing all <span className="text-white font-medium">{patients.length}</span> patients</>
              )}
            </p>
            {aiExplanation && (
              <span className="text-xs px-3 py-1 bg-primary/10 text-primary-light border border-primary/20 rounded-full">
                🤖 {aiExplanation}
              </span>
            )}
          </div>
          {error && (
            <span className="text-xs text-red-400">{error}</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <table className="w-full">
          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800">
            <tr>
              <th onClick={() => handleSort('first_name')} className="text-left p-3 cursor-pointer hover:bg-slate-800 transition-colors text-sm">
                <div className="flex items-center gap-1">Name <SortIcon field="first_name" /></div>
              </th>
              <th className="text-left p-3 text-sm">Age</th>
              <th className="text-left p-3 text-sm">Gender</th>
              <th onClick={() => handleSort('city')} className="text-left p-3 cursor-pointer hover:bg-slate-800 transition-colors text-sm">
                <div className="flex items-center gap-1">City <SortIcon field="city" /></div>
              </th>
              <th onClick={() => handleSort('procedure_interest')} className="text-left p-3 cursor-pointer hover:bg-slate-800 transition-colors text-sm">
                <div className="flex items-center gap-1">Procedure <SortIcon field="procedure_interest" /></div>
              </th>
              <th onClick={() => handleSort('engagement_score')} className="text-left p-3 cursor-pointer hover:bg-slate-800 transition-colors text-sm">
                <div className="flex items-center gap-1">Engage <SortIcon field="engagement_score" /></div>
              </th>
              <th className="text-left p-3 text-sm">Insurance</th>
              <th className="text-left p-3 text-sm">Status</th>
              <th onClick={() => handleSort('lifetime_value')} className="text-left p-3 cursor-pointer hover:bg-slate-800 transition-colors text-sm">
                <div className="flex items-center gap-1">LTV <SortIcon field="lifetime_value" /></div>
              </th>
              <th className="text-left p-3 text-sm">Source</th>
            </tr>
          </thead>
          <tbody>
            {sortedPatients.map((patient) => (
              <tr
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <td className="p-3">
                  <div className="font-medium text-white text-sm">
                    {patient.first_name} {patient.last_name}
                  </div>
                  <div className="text-xs text-slate-500">{patient.email}</div>
                </td>
                <td className="p-3 text-slate-300 text-sm">{getAge(patient.date_of_birth)}</td>
                <td className="p-3 text-slate-300 text-sm">{patient.gender || '—'}</td>
                <td className="p-3 text-slate-300 text-sm">{patient.city || '—'}</td>
                <td className="p-3">{getProcedureBadge(patient.procedure_interest)}</td>
                <td className="p-3">{getEngagementBadge(patient.engagement_score)}</td>
                <td className="p-3 text-slate-300 text-xs">{patient.insurance_provider || '—'}</td>
                <td className="p-3">{getStatusBadge(patient.appointment_status)}</td>
                <td className="p-3 text-slate-300 text-sm">
                  {patient.lifetime_value ? `$${Number(patient.lifetime_value).toLocaleString()}` : '—'}
                </td>
                <td className="p-3 text-slate-400 text-xs">{patient.lead_source || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-2">No patients found</p>
            {isFiltered && (
              <button onClick={handleClearFilter} className="text-primary-light hover:underline text-sm">
                Clear filter and show all patients
              </button>
            )}
          </div>
        )}
      </div>

      {/* Patient Modal */}
      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}
