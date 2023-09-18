import { updateGlue } from "@/db/glue";
import { setRun } from "@/db/run";
// import { increment } from 'firebase/firestore';
var admin = require('firebase-admin');

export default async function handler(req, res) {
  const runData = req.body;
  const runId = await setRun(runData);
  if (runData.workflowId){
    await updateGlue(runData.workflowId, {
      runs: admin.firestore.FieldValue.increment(1)
    });
  }
  res.status(200).json({
    id: runId,
  });
}