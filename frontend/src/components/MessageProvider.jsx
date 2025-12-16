import React, { createContext, useContext, useCallback, useState } from 'react';

const MessageContext = createContext(null);

export function MessageProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const showMessage = useCallback(({ type = 'info', text }) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, text }]);
    // auto dismiss
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const handleConfirm = (val) => {
    if (confirmState?.resolve) confirmState.resolve(val);
    setConfirmState(null);
  };

  return (
    <MessageContext.Provider value={{ showMessage, showConfirm }}>
      {children}

      {/* Toasts container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded shadow-lg max-w-xs break-words ${
              t.type === 'success' ? 'bg-green-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="bg-white p-6 rounded shadow-lg z-10 w-full max-w-md">
            <p className="mb-4">{confirmState.message}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => handleConfirm(false)} className="px-3 py-1 rounded bg-gray-200">Cancel</button>
              <button onClick={() => handleConfirm(true)} className="px-3 py-1 rounded bg-red-600 text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error('useMessage must be used within MessageProvider');
  return ctx;
}
