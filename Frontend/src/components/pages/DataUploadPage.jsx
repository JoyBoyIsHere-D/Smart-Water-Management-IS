import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';

export default function DataUploadPage() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([
    { id: 1, name: 'sensor_data_jan.csv', size: '2.4 MB', status: 'completed', date: '2026-01-20' },
    { id: 2, name: 'water_quality_report.xlsx', size: '1.8 MB', status: 'completed', date: '2026-01-19' },
    { id: 3, name: 'anomaly_log.json', size: '856 KB', status: 'completed', date: '2026-01-18' },
  ]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const fileObjects = newFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: formatFileSize(file.size),
      status: 'uploading',
      progress: 0,
    }));
    
    setFiles([...files, ...fileObjects]);
    
    // Simulate upload for each file
    fileObjects.forEach((fileObj) => {
      simulateUpload(fileObj.id);
    });
  };

  const simulateUpload = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f
        ));
      } else {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f
        ));
      }
    }, 500);
  };

  const removeFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'csv':
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'json':
        return '📋';
      default:
        return '📄';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
          <Upload className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Data Upload</h1>
          <p className="text-slate-400">Upload sensor data files for analysis</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
          isDragging
            ? 'border-cyan-500 bg-cyan-500/10'
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
        }`}
      >
        <input
          type="file"
          multiple
          accept=".csv,.json,.xlsx,.xls"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
            <Upload className="w-10 h-10 text-cyan-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-white mb-1">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-slate-400">
              Supports CSV, JSON, and Excel files (max 50MB)
            </p>
          </div>
        </div>
      </div>

      {/* Current Uploads */}
      {files.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Current Uploads</h3>
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{getFileIcon(file.name)}</span>
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-sm text-slate-400">{file.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {file.status === 'uploading' ? (
                    <>
                      <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </>
                  ) : file.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload History */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upload History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-400 text-sm font-medium pb-3">File Name</th>
                <th className="text-left text-slate-400 text-sm font-medium pb-3">Size</th>
                <th className="text-left text-slate-400 text-sm font-medium pb-3">Date</th>
                <th className="text-left text-slate-400 text-sm font-medium pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {uploadHistory.map((file) => (
                <tr key={file.id} className="border-b border-slate-700/30 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <span className="text-white">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-400">{file.size}</td>
                  <td className="py-3 text-slate-400">{file.date}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/20">
                      {file.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
