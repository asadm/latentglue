import Image from 'next/image'
// import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

// import { Slider } from "@/components/ui/slider"
// import Select from 'react-select'
import AsyncSelect, { useAsync } from 'react-select/async';
import { topWorkflows } from '@/lib/homepageWorkflows';
import { Inter } from 'next/font/google'
import { IoMdCopy, IoIosSave, IoMdPlay } from "react-icons/io";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { Button } from "@/components/ui/button"
var humanFormat = require("human-format");
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from 'react'
import { defaultSteps } from '@/lib/defaultSteps'
import { Label } from "@/components/ui/label"
import { getGlueByUUID } from '@/db/glue';
import { track } from '@/lib/analytics';

const inter = Inter({ subsets: ['latin'] })

const numWords = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', "twenty"];
const colors = ["#FBBF24", "#34D399", "#60A5FA", "#A78BFA", "#F472B6", "#FCD34D", "#6EE7B7", "#93C5FD", "#F9A8D4", "#FDE68A", "#A7F3D0", "#BFDBFE", "#C4B5FD", "#FECACA", "#FDE047", "#DBEAFE", "#E0E7FF", "#E5E7EB"];
const stringToColor = (str) => {
  return colors[numWords.indexOf(str) % colors.length || 0] + "99";
}
async function doModelSearch(query) {
  const res = await fetch("/api/search?query=" + query);
  const json = await res.json();
  const models = json.models;
  if (models) {
    return models.map(model => {
      return {
        value: model.username + "/" + model.name,
        label: model.username + "/" + model.name + " (" + humanFormat(model.prediction_count) + " predictions)",
      };
    });
  }
  return [];
}

function OutputRenderer({output}){
  if (output && typeof output === "string"){
    // check if url to image
    if (output.startsWith("http") 
      && (output.endsWith(".png") || output.endsWith(".jpg") || output.endsWith(".jpeg") || output.endsWith(".gif"))){
      return <img src={output} />
    }
    // check for video file
    else if (output.startsWith("http") 
    && (output.endsWith(".mp4") || output.endsWith(".mov") || output.endsWith(".avi") || output.endsWith(".webm"))){
      return <video src={output} controls />
    }
    return <p>{output}</p>
  }
  else if (output && Array.isArray(output)){
    return (
      <div className='flex gap-2'>
        {output.map((item) => {
          return <OutputRenderer output={item} />
        })}
      </div>
    )
  }
}

async function getModelInputs(modelName) {
  const res = await fetch("/api/getModelInputs?model=" + modelName);
  const json = await res.json();
  return json;
}

export default function Home({workflow, workflowId}) {

  useEffect(() => {
    track("Pageview");
  }, []);
  const [steps, setSteps] = useState(workflow.steps);
  const [intervalId, setIntervalId] = useState(null);
  const [stepRunData, setStepRunData] = useState([]);
  const [newStepModelName, setNewStepModelName] = useState("");
  const [stepCollapsed, setStepCollapsed] = useState(steps.map(() => false));
  return (
    <>
    <div style={{minHeight: workflowId?"200px":"500px"}} className="hero text-black align-middle mt-40 text-center">
        {/* <img src="/images/stock/photo-1635805737707-575885ab0820.jpg" className="max-w-sm rounded-lg shadow-2xl" /> */}
          <h1 className="text-5xl font-bold"><a href="/">🍯 Latent<i className="">Glue</i></a></h1>
          <p className="py-6 text-lg">Glue models together to make pipelines and workflows.</p>
          <p className="py-6 text-lg"><a href="https://github.com/asadm/latentglue" target='_blank'>GitHub <BsBoxArrowUpRight className='inline align-top mt-1' size={18} /></a></p>
          {/* {show top thumbnails} */}
          <div className="flex flex-row flex-wrap justify-center gap-4">
            {!workflowId && topWorkflows.map((workflow) => {
              return (
                <a href={`/?id=${workflow.id}`}>
                <div
  class="block max-w-[18rem] rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700">
  <div class="relative overflow-hidden bg-cover bg-no-repeat">
    <img
      class="rounded-t-lg"
      src={workflow.image}
      alt="" />
  </div>
  <div class="p-6">
    <p class="text-base text-neutral-600 dark:text-neutral-200">
      {workflow.title}
    </p>
  </div>
</div>
</a>
              )})}
              </div>
      </div>
    <main
      className={`md:container mx-auto flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
        
      {steps.map((step, i) => {
        console.log("stepRunData", step.id, stepRunData[i]);
        const currentStepData = stepRunData[i];
        return (
          <div className="flex flex-col items-center justify-center w-full text-center mb-4">
            <Card className="w-full">
              <CardHeader className="cursor-pointer" onClick={()=> {
                const newCollapsed = [...stepCollapsed];
                newCollapsed[i] = !newCollapsed[i];
                setStepCollapsed(newCollapsed);
              }}>
                <CardTitle>
                  { (currentStepData && currentStepData.status === "inprogress") && (
                    <div className="absolute">
                      <div className="lds-ripple"><div></div><div></div></div>
                    </div>
                  )}
                  {step.model} <a target='_blank' href={`https://replicate.com/${step.model}`}><BsBoxArrowUpRight size={16} className="inline align-top mt-1 ml-1" /></a></CardTitle>
                <CardDescription>
                  <code className='p-1' style={{background: stringToColor(step.id)}}>{step.id}</code> <a style={{ cursor: "pointer" }} onClick={() => {
                    navigator.clipboard.writeText(step.id);
                  }}><IoMdCopy className="inline" /></a>
                  {/* | <a target='_blank' href={`https://replicate.com/${step.model}`}>Open Replicate</a> */}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={'flex divide-x ' + (stepCollapsed[i] ? 'hidden' : '')}>
                  <div className='w-1/2 p-4 text-left overflow-y-auto'>
                    {Object.keys(step.inputs).sort(e=>e==="prompt"?-1:0).map((inputKey, inputIndex) => {
                      const input = step.inputs[inputKey];
                      const InputEl = inputKey === "prompt" ? Textarea : Input;
                      return (
                        <div className="grid w-full max-w-sm text-left gap-1.5 mb-8">
                          <Label htmlFor={inputKey}>{input.title}</Label>
                          <InputEl
                            type={(input.type === 'number' || input.type === 'integer') ? "number" : "text"}
                            id={inputKey}
                            onChange={(e) => {
                              const newSteps = [...steps];
                              console.log(newSteps);
                              newSteps[i].inputs[inputKey].default = e.target.value;
                              setSteps(newSteps);

                            }}
                            placeholder={input.description}
                            value={input.default} />
                        </div>
                      )
                    })}
                  </div>
                  <div className='w-1/2 p-4 text-left overflow-y-auto'>
                    <h2 className='text-lg'>Output</h2>
                    {currentStepData && currentStepData.status === "inprogress" && (
                      <i>Running...</i>
                    )}
                    {currentStepData && currentStepData.status === "completed" && currentStepData.output && (
                      <OutputRenderer output={currentStepData.output} />
                    )}
                    {currentStepData && currentStepData.status === "failed" && currentStepData.error && (
                      <div className='bg-red-100 p-2 rounded'>
                        <p className='text-red-500'>{currentStepData.error}</p>
                        </div>
                    )}
                  </div>
                </div>
              </CardContent>
              { !stepCollapsed[i] && (
                <CardFooter>
                <p className="text-right w-full" >
                  <Button variant="destructive" onClick={() => {
                    const newSteps = [...steps];
                    newSteps.splice(i, 1);
                    setSteps(newSteps);
                  }} >Delete</Button>
                </p>
              </CardFooter>
              )}
            </Card>
          </div>
        )
      })}
      <div className="flex flex-col items-center justify-center w-full text-center mt-3">
        <Card className="w-full border-dashed">
          <CardHeader>
            <CardTitle>Add Step</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <AsyncSelect
                onChange={(val) => {
                  setNewStepModelName(val.value);
                }}
                className='w-full text-left'
                cacheOptions
                // defaultOptions={[
                //   { value: "stability-ai/sdxl", label: "stability-ai/sdxl" }
                // ]}
                loadOptions={doModelSearch}
                placeholder="Search Replicate model..." />
              <Button type="submit" onClick={async () => {
                const {inputs, version} = await getModelInputs(newStepModelName);
                console.log(newStepModelName, inputs);
                const newSteps = [...steps];
                const dump = {
                  // id: 'step-' + newStepModelName + Math.random().toString(36).substring(7),
                  // dependsOn: [steps[steps.length - 1].id],
                  id: numWords[steps.length],
                  type: "replicate",
                  model: newStepModelName,
                  version,
                  inputs,
                };
                if (newSteps.length > 0) dump.dependsOn = [newSteps[newSteps.length - 1].id];
                newSteps.push(dump);
                track("Add Step", {
                  model: newStepModelName,
                  totalSteps: newSteps.length
                });
                setSteps(newSteps);
              }}>Add</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-row gap-3 items-center justify-center w-full text-center mt-3">
        <Button variant="outline" onClick={async () => {
          console.log(steps);
          console.log(workflow);
          const result = await fetch("/api/run", {
            method: "POST",
            body: JSON.stringify({
              workflowId,
              steps
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const json = await result.json();
          track("Run Workflow", {workflowId: workflowId || "new", runId: json.id});
          let interval = setInterval(async () => {
            const status = await fetch("/api/status?id=" + json.id);
            const statusJson = await status.json();
            console.log("status", statusJson);
            const runData = statusJson.data;
            if (runData.status === "completed") {
              clearInterval(interval);
              setIntervalId(undefined);
            }
            if (runData.status === "failed") {
              clearInterval(interval);
              setIntervalId(undefined);
            }
            setStepRunData(runData.steps);
          }, 2000);
          setIntervalId(interval);
        }}>
          {!intervalId ? <IoMdPlay className='mr-1' />: (<div className="lds-ripple"><div></div><div></div></div>)} Run
          </Button>
        <Button onClick={async () => {
          console.log(steps);
          track("Save Workflow");
          const result = await fetch("/api/save", {
            method: "POST",
            body: JSON.stringify({
              steps
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const json = await result.json();
          console.log(json);
          window.location.href = "/?id=" + json.id;
        }}><IoIosSave className='mr-1' /> Save</Button>
      </div>
    </main>
    </>
  )
}

export async function getServerSideProps(context){
  // const topWorkflows = await getTopModels(10);
  if (context.query.id){
    const stepsData = await getGlueByUUID(context.query.id);
    return {
      props: {
        workflow: stepsData.data,
        workflowId: context.query.id
      }
    };
  }
  else{
    return {
      props: {
        // topWorkflows,
        workflow: defaultSteps
      }
    }
  }
}
