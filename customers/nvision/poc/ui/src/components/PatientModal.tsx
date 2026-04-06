import { Patient } from '../types';

interface PatientModalProps {
  patient: Patient;
  onClose: () => void;
}

export default function PatientModal({ patient, onClose }: PatientModalProps) {
  const getEngagementColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {patient.first_name} {patient.last_name}
            </h2>
            <p className="text-sm text-slate-400 mt-1">ID: {patient.salesforce_id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Patient Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="text-slate-100 font-medium">{patient.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Phone</p>
                <p className="text-slate-100 font-medium">{patient.phone}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Gender / Age</p>
                <p className="text-slate-100 font-medium">
                  {patient.gender || '—'}
                  {patient.date_of_birth ? `, ${Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / 31557600000)}y` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">City</p>
                <p className="text-slate-100 font-medium">{patient.city ? `${patient.city}, ${patient.state}` : '—'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Procedure Interest</p>
                <p className="text-slate-100 font-medium">{patient.procedure_interest}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Insurance</p>
                <p className="text-slate-100 font-medium">{patient.insurance_provider || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Engagement Score</p>
                <p className={`text-lg font-bold ${getEngagementColor(patient.engagement_score)}`}>
                  {patient.engagement_score}/100
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Preferred Channel</p>
                <p className="text-slate-100 font-medium capitalize">{patient.preferred_channel}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Lead Source</p>
                <p className="text-slate-100 font-medium">{patient.lead_source || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Appointment Status</p>
                <p className="text-slate-100 font-medium capitalize">{(patient.appointment_status || 'none').replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Last Contacted</p>
                <p className="text-slate-100 font-medium">
                  {patient.last_contacted ? new Date(patient.last_contacted).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Lifetime Value</p>
                <p className="text-slate-100 font-medium">
                  {patient.lifetime_value != null ? `$${Number(patient.lifetime_value).toLocaleString()}` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Consultation Notes */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Consultation Notes</h3>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-300 leading-relaxed">{patient.consultation_notes}</p>
            </div>
          </div>

          {/* Call Recording Summary */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Call Recording Summary
              <span className="ml-2 text-xs font-normal text-slate-400">(AI-Generated)</span>
            </h3>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-300 leading-relaxed">{patient.call_recording_summary}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 p-6">
          <button onClick={onClose} className="btn-primary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
