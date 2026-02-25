import { useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaPhone, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  acceptNotification,
  rejectNotification,
  type Notification,
} from "../../api/notificationsApi";

interface Props {
  notification: Notification;
  type: "incoming" | "outgoing";
  onUpdated?: () => void;
}

export default function NotificationCard({
  notification,
  type,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);

  const isPending = notification.status === "pending";
  const isMatched = notification.status === "matched";

  /* =========================
     Actions
  ========================= */

  const handleAccept = async () => {
    try {
      setLoading(true);
      await acceptNotification(notification.id);
      toast.success("Match accepted");
      onUpdated?.();
    } catch {
      toast.error("Failed to accept");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      await rejectNotification(notification.id);
      toast.success("Match rejected");
      onUpdated?.();
    } catch {
      toast.error("Failed to reject");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Contact Actions
  ========================= */

  const handleCall = () => {
    if (!notification.from_user_phone) {
      toast.warning("Phone number not available");
      return;
    }
    window.location.href = `tel:${notification.from_user_phone}`;
  };

  const handleSMS = () => {
    if (!notification.from_user_phone) {
      toast.warning("Phone number not available");
      return;
    }
    window.location.href = `sms:${notification.from_user_phone}`;
  };

  const handleWhatsApp = () => {
    if (!notification.from_user_phone) {
      toast.warning("Phone number not available");
      return;
    }

    const cleanPhone = notification.from_user_phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hi ${notification.from_user_firstname}, regarding project "${notification.project_title}"`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  return (
    <div className="bg-white shadow rounded-xl p-5 border-l-4 border-blue-500">
      <h3 className="font-bold text-lg">
        {notification.project_title}
      </h3>

      <p className="text-sm text-gray-600 mb-2">
        {notification.project_description}
      </p>

      <p className="text-sm">
        👤 {notification.from_user_firstname} {notification.from_user_lastname}
      </p>

      <div className="flex items-center gap-3 mt-3">
        <span
          className={`px-2 py-1 text-xs rounded ${
            notification.status === "matched"
              ? "bg-green-200 text-green-800"
              : notification.status === "declined"
              ? "bg-red-200 text-red-800"
              : "bg-yellow-200 text-yellow-800"
          }`}
        >
          {notification.status.toUpperCase()}
        </span>
      </div>

      {/* =========================
         Pending Actions
      ========================= */}
      {type === "incoming" && isPending && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <FaCheckCircle /> Accept
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <FaTimesCircle /> Reject
          </button>
        </div>
      )}

      {/* =========================
         Contact Buttons (Matched Only)
      ========================= */}
      {isMatched && (
        <div className="flex gap-3 mt-4 flex-wrap">
          <button
            onClick={handleCall}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <FaPhone /> Call
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <FaWhatsapp /> WhatsApp
          </button>

          <button
            onClick={handleSMS}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            💬 SMS
          </button>
        </div>
      )}
    </div>
  );
}