import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { removeNotification } from '../../store/slices/uiSlice';

const icons = {
  success: <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />,
};

const styles = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200',
};

const NotificationContainer = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((s) => s.ui.notifications);

  if (!notifications.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl border shadow-lg animate-in slide-in-from-right-4 ${styles[n.type] || styles.info}`}
        >
          {icons[n.type] || icons.info}
          <p className="text-sm text-gray-800 flex-1">{n.message}</p>
          <button
            onClick={() => dispatch(removeNotification(n.id))}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
