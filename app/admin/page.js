"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function Admin() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setOrders(data);
    });

    return () => unsub();
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">📊 訂單後台</h1>

      {orders.map((o) => (
        <div key={o.id} className="bg-white p-4 rounded shadow mb-4">
          <p className="font-bold">訂單</p>

          {o.items?.map((i, idx) => (
            <p key={idx}>
              {i.name} - ${i.price}
            </p>
          ))}

          <p className="mt-2">總計：${o.total}</p>

          <select
            value={o.status}
            onChange={(e) =>
              updateStatus(o.id, e.target.value)
            }
            className="mt-2 border p-1"
          >
            <option>待處理</option>
            <option>製作中</option>
            <option>已完成</option>
          </select>
        </div>
      ))}

    </div>
  );
}
