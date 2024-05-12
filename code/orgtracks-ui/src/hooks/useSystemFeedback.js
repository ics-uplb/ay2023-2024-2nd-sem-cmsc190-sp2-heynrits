const { useState } = require("react");

const msgTemplate = {
  type: "info",
  message: "",
};

export const useSystemFeedback = () => {
  const [message, setMessage] = useState(msgTemplate);
  const [timeoutId, setTimeoutId] = useState(null);

  /**
   * Sets a message to be displayed for a specified duration.
   *
   * @param {string} message - The message to be displayed.
   * @param {number} [duration=3000] - The duration (in milliseconds) for which the message should be displayed.
   * @return {undefined} This function does not return a value.
   */
  const showMessage = (message, duration = 3000) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    setMessage(message);
    const id = setTimeout(() => {
      setMessage(msgTemplate);
    }, duration);

    setTimeoutId(id);
  };

  return {
    message,
    showMessage,
  };
};
