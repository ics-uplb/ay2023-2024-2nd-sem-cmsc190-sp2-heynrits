import {
  BiCheckCircle,
  BiErrorCircle,
  BiInfoCircle,
  BiXCircle,
} from "react-icons/bi";

export default function Alert({ type = "info", message = "", className = "" }) {
  const icons = {
    info: <BiInfoCircle size="1.25em" />,
    success: <BiCheckCircle size="1.25em" />,
    error: <BiXCircle size="1.25em" />,
    warning: <BiErrorCircle size="1.25em" />,
  };

  const types = {
    info: "alert-info",
    success: "alert-success",
    error: "alert-error",
    warning: "alert-warning",
  };

  return (
    <div className={`alert ${types[type]} ${className}`}>
      {icons[type]}
      <span className="text-sm">{message}</span>
    </div>
  );
}
