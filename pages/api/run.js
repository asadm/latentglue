import { setRun } from "@/db/run";

export default async function handler(req, res) {
  const workflow = req.body;
  const runId = await setRun(workflow);
  res.status(200).json({
    id: runId,
  });
}