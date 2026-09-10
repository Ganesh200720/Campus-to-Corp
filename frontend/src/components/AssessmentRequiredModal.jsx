import { useNavigate } from 'react-router-dom'
import { ShieldAlert, X } from 'lucide-react'

/**
 * Shown when POST /opportunities/apply/ is blocked server-side with
 * { code: "ASSESSMENT_REQUIRED", assessment_id, assessment_title, company_name, student_assessment_status }.
 * "Complete Assessment" deep-links straight to that company's specific assessment —
 * never a generic assessment landing page.
 */
export default function AssessmentRequiredModal({ info, onCancel }) {
  const navigate = useNavigate()
  if (!info) return null

  const failedBefore = info.student_assessment_status === 'failed'

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[60]" onClick={onCancel}>
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <button onClick={onCancel} className="absolute mt-[-8px] ml-[calc(100%-56px)] text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={26} />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1.5">Assessment Required</h2>
        <p className="text-sm text-slate-500 mb-5">
          {failedBefore
            ? <>You didn't meet the passing score on <span className="font-semibold text-slate-700">{info.company_name}</span>'s
                {' '}"{info.assessment_title}" yet. Retake it (if attempts remain) before applying.</>
            : <>You need to complete the required assessment for <span className="font-semibold text-slate-700">{info.company_name}</span> before
                applying for this opportunity.</>}
        </p>
        <div className="flex flex-col gap-2">
          <button
            className="btn-primary"
            onClick={() => navigate(`/student/company-assessments/take/${info.assessment_id}`)}
          >
            Complete Assessment
          </button>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
