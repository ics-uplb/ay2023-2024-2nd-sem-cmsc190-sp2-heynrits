export default function Toast({ type = "info", message = "" }) {
  return (
    <div className="toast toast-end z-[999]">
      <div className={`alert bg-violet-50 text-indigo-950 shadow-md`}>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}
