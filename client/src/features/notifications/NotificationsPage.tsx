import { useEffect, useState, useCallback } from "react";
import {
  getMyNotifications,
  getMyCreatedNotifications,
  type Notification,
} from "../../api/notificationsApi";
import NotificationCard from "./NotificationCard";
import Header from "../../ui/Header";
import { toast } from "react-toastify";

export default function NotificationsPage() {
  const [incoming, setIncoming] = useState<Notification[]>([]);
  const [outgoing, setOutgoing] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">(
    "incoming"
  );
  const [loading, setLoading] = useState(true);

  /* ============================
     Fetch Data
  ============================ */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [incomingData, outgoingData] = await Promise.all([
        getMyNotifications(),
        getMyCreatedNotifications(),
      ]);

      setIncoming(incomingData.data);
      setOutgoing(outgoingData.data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const list = activeTab === "incoming" ? incoming : outgoing;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">📬 Notifications</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "incoming"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Incoming Requests
          </button>

          <button
            onClick={() => setActiveTab("outgoing")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "outgoing"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            My Sent Requests
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-6">
            <p>Loading...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && list.length === 0 && (
          <div className="bg-white p-6 rounded-xl text-center shadow">
            No requests found
          </div>
        )}

        {/* Feed */}
        {!loading && list.length > 0 && (
          <div className="space-y-4">
            {list.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                type={activeTab}
                onUpdated={fetchData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}