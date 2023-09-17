
export default async function handler(req, res) {
  const result = await fetch("https://replicate.com/api/models/search?query=" + req.query.query, {
    "referrer": "https://replicate.com/explore?query=" + req.query.query,
    "referrerPolicy": "same-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "omit"
  });
  const json = await result.json(); 
  console.log(json);
  res.status(200).json(json);  
}