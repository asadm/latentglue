import { getRunByUUID, updateRun } from "@/db/run";
const vm = require('node:vm');

function getNextSteps(workflow){
  // Find what step to execute next (also cater ones with no dependencies)
  const nextSteps = workflow.steps.filter(
    step => ((step.status === 'waiting' || !step.status)
    && (
        !step.dependsOn 
        || !step.dependsOn.length===0 
        || step.dependsOn.every(dep => workflow.steps.find(s => s.id === dep).status === 'completed')
      )
  ));

  console.log("nextSteps", nextSteps);
  return nextSteps;
}


async function submitToReplicate(
  version,
  input
) {

  
  console.log("submitToReplicate", version, input);
  // return {id: "123", status: "pending"}
  const API_HOST = 'https://api.replicate.com';
  let body = {
    version,
    input: input
  };
  const response = await fetch(`${API_HOST}/v1/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (response.status !== 201) {
    let error = await response.json();
    console.log(error);
    return {error: error.detail, status: "failed"};
    // throw new Error(error);
    
  }
  const data = await response.json();
  console.log('replicate', data);
  return data;
}

export async function getStatusFromReplicate(predictionId) {
  const API_HOST = 'https://api.replicate.com';
  const response = await fetch(`${API_HOST}/v1/predictions/${predictionId}`, {
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  if (response.status !== 200) {
    let error = await response.json();
    console.log('error', error, predictionId);
    // res.end(JSON.stringify({ detail: error.detail }));
    return null;
  }

  const prediction = await response.json();
  return prediction;
}


export default async function handler(req, res) {
  const runId = req.query.id;
  const run = await getRunByUUID(runId);
  if (!run) {
    res.status(404).json({error: "No run found"});
  }
  run.data.steps = await Promise.all(run.data.steps.map(async (step) => {
    if (step.status === "inprogress"){
      const prediction = await getStatusFromReplicate(step.replicate_id);
      if (prediction.status === "succeeded") step.status = "completed";
      else if (prediction.status === "failed" || prediction.status === "canceled") step.status = "failed";
      else step.status = "inprogress";
      if (prediction.output) step.output = prediction.output;
      if (prediction.error) step.error = prediction.error;
    }
    return step;
  }));
  
  let nextSteps = getNextSteps(run.data);
  nextSteps = await Promise.all(nextSteps.map(async (step) => {
    // Execute the step
    const finalInputs = {};
    for (const [key, value] of Object.entries(step.inputs)) {
      if (value.default){
        const parsed = resolveExpressions(value.default, run.data.steps);
        if (parsed.error) {
          step.status = "failed";
          step.error = parsed.error;
          return step;
        }
        finalInputs[key] = parsed.value;
      }
    }
    const json = await submitToReplicate(step.version, finalInputs);
    
    // Update the step
    if (json.status === "succeeded") step.status = "completed";
    else if (json.status === "failed" || json.status === "canceled") step.status = "failed";
    else step.status = "inprogress";
    if (json.output) step.output = json.output;
    if (json.error) step.error = json.error;
    if (json.id) step.replicate_id = json.id;
    return step;
  }));

  // update run status
  const anyStepIsFailed = run.data.steps.find(step => step.status === "failed");
  if (anyStepIsFailed) run.data.status = "failed";
  const anyStepIsInProgress = run.data.steps.find(step => step.status === "inprogress");
  if (anyStepIsInProgress) run.data.status = "inprogress";
  const allStepsAreCompleted = run.data.steps.every(step => step.status === "completed");
  if (allStepsAreCompleted) run.data.status = "completed";

  // save updated steps
  await updateRun(runId, run.data);

  // get latest run
  const updatedRun = await getRunByUUID(runId);
  res.status(200).json(updatedRun);
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function resolveExpressions(value, allSteps){
  // replace {} values with the output of the step
  console.log("resolveExpressions", value);
  if (typeof value !== "string") return {value, error: undefined};
  value = replaceAll(value, "{", "${");
  let context = {result: undefined, error: undefined};

  allSteps.forEach(step => {
    context[step.id] = {
      output: step.output
    }
  });

  console.log ("context", context);
  vm.createContext(context); // Contextify the object.
  const code = 'try{result = `' + value + '`;}catch(e){console.log(error); error = e.message;}';
  console.log("code", code);
  try{
  vm.runInContext(code, context);
  }
  catch(e){
    console.log("caught", e);
    return {value: undefined, error: e.message};
  }
  console.log("contextOUT", context);
  return {value: context.result, error: context.error};
}