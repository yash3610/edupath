import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const buttonClasses = {
  confirmButton: "rounded-xl px-4 py-2 text-sm font-bold",
  cancelButton: "rounded-xl px-4 py-2 text-sm font-bold",
  popup: "rounded-2xl",
};

export async function confirmAction({
  title,
  text,
  confirmButtonText = "Yes, continue",
  cancelButtonText = "Cancel",
  icon = "warning",
  danger = false,
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
    confirmButtonColor: danger ? "#dc2626" : "#16a34a",
    cancelButtonColor: "#64748b",
    customClass: buttonClasses,
  });

  return result.isConfirmed;
}

export async function promptText({
  title,
  text,
  inputLabel,
  placeholder,
  defaultValue = "",
  confirmButtonText = "Submit",
  cancelButtonText = "Cancel",
  icon = "question",
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    icon,
    input: "textarea",
    inputLabel,
    inputPlaceholder: placeholder,
    inputValue: defaultValue,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    confirmButtonColor: "#111827",
    cancelButtonColor: "#64748b",
    customClass: buttonClasses,
  });

  return { confirmed: result.isConfirmed, value: String(result.value || "").trim() };
}
