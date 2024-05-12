import { createRef, useCallback, useEffect, useRef } from "react";

export function Modal({ open, setOpen, children }) {
  const ref = useRef();

  const handleClickOutside = useCallback(
    (event) => {
      if ((ref.current && ref.current !== event.target) || !open) {
        return;
      }

      setOpen(false);
    },
    [open]
  );

  const handleEscPress = useCallback(
    (event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
      }
    },
    [open]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscPress);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscPress);
    };
  }, [ref, setOpen, open]);

  return (
    <div className={`modal ${open && "modal-open"}`} ref={ref}>
      <div className="modal-box">{children}</div>
    </div>
  );
}

export function ModalTitle({ children }) {
  return <h3 className="font-bold text-lg">{children}</h3>;
}

export function ModalBody({ children }) {
  return <div className="py-4">{children}</div>;
}

export function ModalAction({ children }) {
  return (
    <div className="modal-action">
      <div method="dialog" className="flex gap-4">
        {children}
      </div>
    </div>
  );
}
