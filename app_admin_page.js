"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, completed, cancelled

  // 實時監聽訂單
  useEffect(() => {
    const q = query(collection(db, "orders"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }))
        .sort((a, b) => b.createdAt - a.createdAt); // 最新的在上面

      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 篩選訂單
  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  // 更新訂單狀態
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("更新失敗:", error);
      alert("更新失敗");
    }
  };

  // 刪除訂單
  const deleteOrder = async (orderId) => {
    if (confirm("確定要刪除此訂單嗎？")) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
      } catch (error) {
        console.error("刪除失敗:", error);
        alert("刪除失敗");
      }
    }
  };

  // 複製訂單詳情到剪貼板
  const copyToClipboard = (order) => {
    const text = `
訂單編號：${order.id}
姓名：${order.customerName}
電話：${order.customerPhone}
取餐時間：${order.pickupTime}
狀態：${order.status}

餐點明細：
${order.items.map((i) => `${i.name} × ${i.quantity || 1} = $${i.price * (i.quantity || 1)}`).join("\n")}

總計：$${order.total}
訂單時間：${order.createdAt.toLocaleString("zh-TW")}
    `;
    navigator.clipboard.writeText(text);
    alert("已複製到剪貼板");
  };

  if (loading) return <div className="p-6 text-center">載入中...</div>;

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "待處理").length,
    completed: orders.filter((o) => o.status === "已完成").length,
    cancelled: orders.filter((o) => o.status === "已取消").length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 訂單管理系統</h1>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500">
          <p className="text-gray-600">總訂單數</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded border-l-4 border-yellow-500">
          <p className="text-gray-600">待處理</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-green-100 p-4 rounded border-l-4 border-green-500">
          <p className="text-gray-600">已完成</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-red-100 p-4 rounded border-l-4 border-red-500">
          <p className="text-gray-600">已取消</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* 篩選按鈕 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "待處理", "已完成", "已取消"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status === "all" ? "all" : status)}
            className={`px-4 py-2 rounded font-semibold ${
              filter === (status === "all" ? "all" : status)
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {status === "all" ? "全部訂單" : status}
          </button>
        ))}
      </div>

      {/* 訂單列表 */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500 py-8">暫無訂單</p>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* 左側：訂單基本資訊 */}
                <div>
                  <p className="text-sm text-gray-500">訂單編號</p>
                  <p className="font-mono text-sm font-bold break-all">
                    {order.id}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">顧客資訊</p>
                  <p>👤 {order.customerName}</p>
                  <p>📞 {order.customerPhone}</p>
                  <p>⏰ {order.pickupTime}</p>
                </div>

                {/* 中間：訂單詳情 */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">餐點明細</p>
                  <div className="text-sm space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.name} × {item.quantity || 1}
                        </span>
                        <span className="font-semibold">
                          ${item.price * (item.quantity || 1)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t font-bold text-lg">
                    合計：${order.total}
                  </div>
                </div>

                {/* 右側：訂單操作 */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">狀態</p>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order.id, e.target.value)
                    }
                    className={`w-full p-2 rounded font-bold mb-3 ${
                      order.status === "待處理"
                        ? "bg-yellow-200"
                        : order.status === "已完成"
                          ? "bg-green-200"
                          : "bg-red-200"
                    }`}
                  >
                    <option value="待處理">待處理</option>
                    <option value="已完成">已完成</option>
                    <option value="已取消">已取消</option>
                  </select>

                  <p className="text-xs text-gray-500">
                    訂單時間：
                    {order.createdAt.toLocaleString("zh-TW")}
                  </p>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => copyToClipboard(order)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-sm"
                    >
                      📋 複製
                    </button>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 text-sm"
                    >
                      🗑️ 刪除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}