"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const menu = [
  { name: "控肉飯", price: 80 },
  { name: "雞腿飯", price: 100 },
  { name: "雞肉飯", price: 60 },
  { name: "肉燥飯", price: 50 },
  { name: "刈包", price: 50 },
  { name: "豬腸湯", price: 50 },
  { name: "豬血豬腸湯", price: 60 },
  { name: "貢丸湯", price: 40 },
  { name: "魚丸湯", price: 40 },
  { name: "魚皮湯", price: 60 },
];

export default function Page() {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const total = cart.reduce((sum, i) => sum + i.price, 0);

  const sendOrder = async () => {
    const order = {
      items: cart,
      total,
      status: "待處理",
      createdAt: new Date(),
    };

    // 存 Firebase
    await addDoc(collection(db, "orders"), order);

    // LINE送單
    const text = `
我要點餐
----------------
${cart.map(i => `${i.name} $${i.price}`).join("\n")}
----------------
總計：$${total}

時間：
姓名：
電話：
`;

    const url =
      "https://line.me/R/oaMessage/@125nklyn/?" +
      encodeURIComponent(text);

    window.open(url);
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        灶軒控肉飯｜線上點餐
      </h1>

      {/* 菜單 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {menu.map((item) => (
          <div key={item.name} className="border p-4 rounded shadow">
            <h3 className="font-bold">{item.name}</h3>
            <p>${item.price}</p>

            <button
              onClick={() => addToCart(item)}
              className="mt-2 bg-orange-500 text-white px-3 py-1 rounded"
            >
              + 加入
            </button>
          </div>
        ))}
      </div>

      {/* 購物車 */}
      <div className="mt-8 border p-4 rounded bg-gray-50">
        <h2 className="font-bold mb-2">🛒 購物車</h2>

        {cart.length === 0 && <p>尚未選擇餐點</p>}

        {cart.map((i, idx) => (
          <p key={idx}>{i.name} - ${i.price}</p>
        ))}

        <p className="mt-2 font-bold">總計：${total}</p>

        <button
          onClick={sendOrder}
          className="mt-4 w-full bg-green-500 text-white py-3 rounded"
        >
          💬 LINE送出訂單（免排隊🔥）
        </button>
      </div>

    </div>
  );
}
