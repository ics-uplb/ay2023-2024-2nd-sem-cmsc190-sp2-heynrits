import { Modal, ModalAction, ModalBody, ModalTitle } from "./Modal";

export default function ConfirmationDialog({
  open,
  setOpen,
  title,
  message,
  onConfirm,
  btnColor = "btn-primary",
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  return (
    <Modal open={open} setOpen={setOpen}>
      <ModalTitle>{title}</ModalTitle>
      <ModalBody>
        <p className="text-sm text-gray-500 leading-6">{message}</p>
      </ModalBody>
      <ModalAction>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          {cancelText}
        </button>
        <button className={`btn ${btnColor} btn-sm`} onClick={onConfirm}>
          {confirmText}
        </button>
      </ModalAction>
    </Modal>
  );
}
