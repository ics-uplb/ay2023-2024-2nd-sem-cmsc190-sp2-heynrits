import { useEffect } from "react";

// https://stackoverflow.com/a/75692694
// context: 'signin' | 'signup'
const GoogleButton = ({ context }) => {
  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const callbacks = {
    signin: "onLogin",
    signup: "onRegister",
  };

  const texts = {
    signin: "signin_with",
    signup: "continue_with",
  };

  return (
    <>
      <div
        id="g_id_onload"
        data-client_id="249001997446-ehdafguh6ig6sqf1uprojheeafsogufq.apps.googleusercontent.com"
        data-context={context}
        data-ux_mode="popup"
        data-callback={callbacks[context]}
        data-auto_prompt="false"
      />
      <div
        className="g_id_signin flex justify-center"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text={texts[context]}
        data-size="large"
        data-locale="en"
        data-logo_alignment="left"
      />
    </>
  );
};

export default GoogleButton;
