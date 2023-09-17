// import Image from 'next/image'
// import { cn } from "@/lib/utils"
// import { Slider } from "@/components/ui/slider"
// import Select from 'react-select'
import AsyncSelect, { useAsync } from 'react-select/async';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"



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
import { useState } from 'react'
import { defaultSteps } from '@/lib/defaultSteps'
import { Label } from "@/components/ui/label"
import { getGlueByUUID } from '@/db/glue';

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

async function getModelInputs(modelName) {
  const res = await fetch("/api/getModelInputs?model=" + modelName);
  const json = await res.json();
  return json;
}

export default function Home({workflow}) {
  const [steps, setSteps] = useState(workflow.steps);
  const [newStepModelName, setNewStepModelName] = useState("");
  return (
    <main
      className={`md:container mx-auto flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
      {steps.map((step, i) => {
        return (
          <div className="flex flex-col items-center justify-center w-full text-center mb-2">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{step.model} <a target='_blank' href={`https://replicate.com/${step.model}`}><BsBoxArrowUpRight size={16} className="inline align-top mt-1 ml-1" /></a></CardTitle>
                <CardDescription>
                  <code className='p-1' style={{background: stringToColor(step.id)}}>{step.id}</code> <a style={{ cursor: "pointer" }} onClick={() => {
                    navigator.clipboard.writeText(step.id);
                  }}><IoMdCopy className="inline" /></a>
                  {/* | <a target='_blank' href={`https://replicate.com/${step.model}`}>Open Replicate</a> */}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex divide-x'>
                  <div className='w-1/2 p-4 text-left overflow-y-auto'>
                    {Object.keys(step.inputs).map((inputKey, inputIndex) => {
                      const input = step.inputs[inputKey];
                      return (
                        <div className="grid w-full max-w-sm text-left gap-1.5 mb-8">
                          <Label htmlFor={inputKey}>{input.title}</Label>
                          <Input
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
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-right w-full" >
                  <Button variant="destructive" onClick={() => {
                    const newSteps = [...steps];
                    newSteps.splice(i, 1);
                    setSteps(newSteps);
                  }} >Delete</Button>
                </p>
              </CardFooter>
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
                const inputs = await getModelInputs(newStepModelName);
                console.log(newStepModelName, inputs);
                const newSteps = [...steps];
                newSteps.push({
                  // id: 'step-' + newStepModelName + Math.random().toString(36).substring(7),
                  id: numWords[steps.length],
                  type: "replicate",
                  model: newStepModelName,
                  inputs,
                });
                setSteps(newSteps);
              }}>Add</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-row gap-3 items-center justify-center w-full text-center mt-3">
        <Button variant="outline" onClick={() => {}}><IoMdPlay className='mr-1' /> Run</Button>
        <Button onClick={async () => {
          console.log(steps);
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
  )
}

export async function getServerSideProps(context){
  if (context.query.id){
    const stepsData = await getGlueByUUID(context.query.id);
    return {
      props: {
        workflow: stepsData.data
      }
    };
  }
  else{
    return {
      props: {
        workflow: defaultSteps
      }
    }
  }
}