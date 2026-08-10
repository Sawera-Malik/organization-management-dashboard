interface DeleteConfirmModalProps {
  projectName: string
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteConfirmModal({
  projectName,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-center space-y-4">

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 01-1 1v3M4 7h16"
            />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">
            Delete Project
          </h3>

          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Are you sure you want to permanently delete project{" "}
            <span className="font-semibold text-slate-200">
              "{projectName}"
            </span>
            ? This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-700/60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/10 transition hover:bg-red-500"
          >
            Delete Project
          </button>
        </div>

      </div>
    </div>
  )
}