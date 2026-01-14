import { Upload, RefreshCw, CheckCircle } from 'lucide-react';

export default function DataUpload({ isUploading, onFileUpload }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Upload Sensor Data</h3>
      <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-cyan-500 hover:bg-slate-800/30 transition-all group">
        <input
          type="file"
          accept=".csv,.json,.xlsx"
          onChange={onFileUpload}
          className="hidden"
        />
        {isUploading ? (
          <div className="flex flex-col items-center">
            <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
            <p className="mt-3 text-slate-400">Processing data...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <p className="mt-3 text-slate-400 group-hover:text-slate-300">Drop files or click to upload</p>
            <p className="text-xs text-slate-500 mt-1">CSV, JSON, XLSX supported</p>
          </div>
        )}
      </label>
      <div className="mt-4 p-3 bg-slate-700/30 rounded-xl">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-slate-300">Last upload: sensor_data_jan14.csv</span>
        </div>
      </div>
    </div>
  );
}
