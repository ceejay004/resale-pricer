export default async function handler(req, res) {

  const item = req.query.item;
  if (!item) return res.status(400).json({ error: "No item" });

  const url =
    "https://www.ebay.co.uk/sch/i.html?_nkw=" +
    encodeURIComponent(item) +
    "&LH_Sold=1&LH_Complete=1";

  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const html = await r.text();

  const prices = [...html.matchAll(/£([0-9]+\.[0-9]+)/g)]
    .map(m => parseFloat(m[1]))
    .filter(p => p > 2 && p < 2000);

  if (!prices.length) return res.json({ error: "No sold data found" });

  const avg = prices.reduce((a,b)=>a+b,0)/prices.length;

  res.json({
    average: avg.toFixed(2),
    quick: (avg*0.75).toFixed(2),
    normal: (avg*0.95).toFixed(2),
    max: (avg*1.2).toFixed(2),
    samples: prices.length
  });
}
