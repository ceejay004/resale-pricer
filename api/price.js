
export default async function handler(request, response) {

  const { item } = request.query;

  if (!item) {
    response.status(400).json({ error: "No item provided" });
    return;
  }

  try {
    const url =
      "https://www.ebay.co.uk/sch/i.html?_nkw=" +
      encodeURIComponent(item) +
      "&LH_Sold=1&LH_Complete=1";

    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = await r.text();

    const matches = html.match(/£[0-9,.]+/g) || [];

    const prices = matches
      .map(p => parseFloat(p.replace("£","").replace(",","")))
      .filter(p => p > 2 && p < 2000);

    if (!prices.length) {
      response.json({ error: "No sold listings found" });
      return;
    }

    const avg = prices.reduce((a,b)=>a+b,0)/prices.length;

    response.json({
      average: avg.toFixed(2),
      quick: (avg*0.75).toFixed(2),
      normal: (avg*0.95).toFixed(2),
      max: (avg*1.2).toFixed(2),
      samples: prices.length
    });

  } catch (err) {
    response.status(500).json({ error: "Pricing engine failed" });
  }
}
