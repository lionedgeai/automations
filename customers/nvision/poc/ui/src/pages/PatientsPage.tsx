import { useState, useEffect, useMemo } from 'react';
import { Patient } from '../types';
import { getPatients } from '../api/patients';
import PatientModal from '../components/PatientModal';

type SortField = 'first_name' | 'last_name' | 'email' | 'procedure_interest' | 'last_visit_date' | 'engagement_score';
type SortDirection = 'asc' | 'desc';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [procedureFilter, setProcedureFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('last_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.first_name.toLowerCase().includes(query) ||
        p.last_name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.phone.includes(query)
      );
    }

    // Procedure filter
    if (procedureFilter !== 'All') {
      filtered = filtered.filter(p => p.procedure_interest === procedureFilter);
    }

    // Channel filter
    if (channelFilter !== 'All') {
      filtered = filtered.filter(p => p.preferred_channel === channelFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // Handle dates
      if (sortField === 'last_visit_date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Handle strings
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [patients, searchQuery, procedureFilter, channelFilter, sortField, sortDirection]);

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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-slate-600">⇅</span>;
    }
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="card p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-slate-300">{error}</p>
          <button onClick={loadPatients} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-3xl font-bold text-white mb-4">Patients</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field flex-1 min-w-[300px]"
          />
          
          <select
            value={procedureFilter}
            onChange={(e) => setProcedureFilter(e.target.value)}
            className="input-field w-48"
          >
            <option>All</option>
            <option>LASIK</option>
            <option>Cataract</option>
            <option>Premium Lens</option>
          </select>
          
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="input-field w-48"
          >
            <option>All</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="both">Both</option>
          </select>
        </div>

        {/* Count */}
        <p className="text-sm text-slate-400 mt-4">
          Showing {filteredAndSortedPatients.length} of {patients.length} patients
        </p>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <table className="w-full">
          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800">
            <tr>
              <th
                onClick={() => handleSort('first_name')}
                className="text-left p-4 cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Name <SortIcon field="first_name" />
                </div>
              </th>
              <th
                onClick={() => handleSort('email')}
                className="text-left p-4 cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Email <SortIcon field="email" />
                </div>
              </th>
              <th className="text-left p-4">Phone</th>
              <th
                onClick={() => handleSort('procedure_interest')}
                className="text-left p-4 cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Procedure <SortIcon field="procedure_interest" />
                </div>
              </th>
              <th
                onClick={() => handleSort('last_visit_date')}
                className="text-left p-4 cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Last Visit <SortIcon field="last_visit_date" />
                </div>
              </th>
              <th
                onClick={() => handleSort('engagement_score')}
                className="text-left p-4 cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Engagement <SortIcon field="engagement_score" />
                </div>
              </th>
              <th className="text-left p-4">Channel</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPatients.map((patient) => (
              <tr
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <td className="p-4">
                  <div className="font-medium text-white">
                    {patient.first_name} {patient.last_name}
                  </div>
                </td>
                <td className="p-4 text-slate-300">{patient.email}</td>
                <td className="p-4 text-slate-300">{patient.phone}</td>
                <td className="p-4">{getProcedureBadge(patient.procedure_interest)}</td>
                <td className="p-4 text-slate-300">
                  {new Date(patient.last_visit_date).toLocaleDateString()}
                </td>
                <td className="p-4">{getEngagementBadge(patient.engagement_score)}</td>
                <td className="p-4">
                  <span className="text-slate-300 capitalize">{patient.preferred_channel}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No patients found matching your filters.</p>
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
