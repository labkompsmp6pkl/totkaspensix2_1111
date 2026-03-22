
/**
 * Utility to log errors to the remote server
 */
export const logErrorToRemote = async (error: any, context: string = 'General') => {
  try {
    const errorData = {
      timestamp: new Date().toISOString(),
      context,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Prepare the payload as a string for the .txt file on the server
    const logMessage = `[${errorData.timestamp}] [${errorData.context}]
URL: ${errorData.url}
UserAgent: ${errorData.userAgent}
Message: ${errorData.message}
Stack: ${errorData.stack || 'N/A'}
--------------------------------------------------\n`;

    // Send to the local API endpoint
    await fetch('/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'log_error',
        log: logMessage
      }),
      mode: 'cors' 
    });
  } catch (e) {
    console.error('Failed to send log to remote server:', e);
  }
};

/**
 * Utility to log events (UI, User, etc.) to the remote server
 */
export const logEventToRemote = async (event: string, details: any = {}) => {
  try {
    const eventData = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const logMessage = `[${eventData.timestamp}] [EVENT: ${eventData.event}]
URL: ${eventData.url}
UserAgent: ${eventData.userAgent}
Details: ${JSON.stringify(eventData.details)}
--------------------------------------------------\n`;

    await fetch('/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'log_error',
        log: logMessage
      }),
      mode: 'cors' 
    });
  } catch (e) {
    // Silent fail for events
  }
};

/**
 * Global error handlers
 */
export const initGlobalErrorLogging = () => {
  window.onerror = (message, source, lineno, colno, error) => {
    logErrorToRemote(error || message, `Global Error: ${source}:${lineno}:${colno}`);
  };

  window.onunhandledrejection = (event) => {
    logErrorToRemote(event.reason, 'Unhandled Promise Rejection');
  };
};
