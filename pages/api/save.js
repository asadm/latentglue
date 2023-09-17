import { setGlue, getGlueByUUID } from "@/db/glue";
export default async function handler(req, res) {
  const steps = req.body.steps;
  const name = "Untitled";
  const id = await setGlue({
    name,
    steps,
  });

  res.status(200).json({
    id,
  });
}