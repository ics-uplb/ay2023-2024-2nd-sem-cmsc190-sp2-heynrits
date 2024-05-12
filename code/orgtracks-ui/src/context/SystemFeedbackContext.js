import { createContext } from "react";

export const SystemFeedbackContext = createContext({
    message: null,
    showMessage: (message, duration = 3000) => {},
});