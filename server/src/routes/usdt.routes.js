// src/routes/usdt.routes.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/usdt", async (req, res) => {
  try {
    let rate;

    // Try CoinGecko API first
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr",
        { timeout: 20000 } // 20s timeout
      );

      if (!response.ok) throw new Error("CoinGecko failed");

      const data = await response.json();
      rate = data?.tether?.inr;
    } catch (error) {
      console.error("CoinGecko error, trying Binance...", error.message);

      // If CoinGecko fails, try Binance
      const response2 = await fetch(
        "https://api.binance.com/api/v3/ticker/price?symbol=USDTUSDT"
      );

      if (!response2.ok) throw new Error("Binance failed");

      const data2 = await response2.json();
      rate = parseFloat(data2.price);
    }

    // If still no rate, fallback
    if (!rate) {
      rate = 83; // fallback mock
    }

    res.json({ rate });
  } catch (err) {
    console.error("Error fetching USDT rate:", err.message);
    res.json({ rate: 83 }); // final fallback
  }
});

export default router;
