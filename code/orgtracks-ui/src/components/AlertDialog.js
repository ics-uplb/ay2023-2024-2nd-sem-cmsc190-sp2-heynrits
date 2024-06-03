import { Modal, ModalAction, ModalBody, ModalTitle } from "./Modal";

export default function AlertDialog({ title, message, open, setOpen }) {
  return (
    <Modal open={open} setOpen={setOpen}>
      <ModalTitle>{title}</ModalTitle>
      <ModalBody>
        <p className="text-sm text-gray-500 leading-6">{message}</p>
      </ModalBody>
      <ModalAction>
        <button className={`btn btn-primary px-8`} onClick={() => setOpen(false)}>
          OK
        </button>
      </ModalAction>
    </Modal>
  );
};
