// import Image from 'next/image'
// import { cn } from "@/lib/utils"
// import { Slider } from "@/components/ui/slider"
// import Select from 'react-select'
import AsyncSelect, { useAsync } from 'react-select/async';
import { Inter } from 'next/font/google'
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

const inter = Inter({ subsets: ['latin'] })


async function doModelSearch(query){
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

async function getModelInputs(modelName){
  const res = await fetch("/api/getModelInputs?model=" + modelName);
  const json = await res.json();
  return json;
}

export default function Home() {
  const [steps, setSteps] = useState(defaultSteps);
  const [newStepModelName, setNewStepModelName] = useState("");
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >

      {steps.map((step, i) => {
        return (
          <div className="flex flex-col items-center justify-center w-full text-center mb-2">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{step.model}</CardTitle>
                <CardDescription><a target='_blank' href={`https://replicate.com/${step.model}`}>Replicate</a></CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(step.inputs).map((inputKey, i) => {
                  const input = step.inputs[inputKey];
                  // if (input.type === "integer" && input.minimum && input.maximum){
                  //   return (
                  //     <div className="grid w-full max-w-sm text-left gap-1.5 mb-3">
                  //       <Label htmlFor={inputKey}>{input.title}</Label>
                  //       <Slider
                  //         defaultValue={[input.default || input.minimum]}
                  //         max={input.maximum}
                  //         step={1}
                  //         min={input.minimum}
                  //       />
                  //     </div>
                  //   )
                  // }
                  if (input.type === 'number' || input.type === 'integer'){
                    return (
                      <div className="grid w-full max-w-sm text-left gap-1.5 mb-8">
                        <Label htmlFor={inputKey}>{input.title}</Label>
                        <Input type="number" id={inputKey} placeholder={input.description} />
                      </div>
                    )
                  }
                  return (
                    <div className="grid w-full max-w-sm text-left gap-1.5 mb-8">
                      <Label htmlFor={inputKey}>{input.title}</Label>
                      <Input type="text" id={inputKey} placeholder={input.description} />
                    </div>
                  )
                })}
              </CardContent>
              <CardFooter>
                <p className="text-right w-full" >
                  <Button variant="destructive" onClick={()=>{
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
<div className="flex flex-col items-center justify-center w-full text-center">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Add New Step</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="flex w-full max-w-sm items-center space-x-2">
              <AsyncSelect 
              onChange={(val)=>{
                setNewStepModelName(val.value);
              }}
                className='w-full text-left' 
                cacheOptions 
                defaultOptions={[
                  {value: "stability-ai/sdxl", label: "stability-ai/sdxl"}
                ]}
                loadOptions={doModelSearch} 
                placeholder="Search Replicate model..." />
                <Button type="submit" onClick={async ()=>{
                  const inputs = await getModelInputs(newStepModelName);
                  console.log(newStepModelName, inputs);
                  const newSteps = [...steps];
                  newSteps.push({
                    id: 'step-' + newStepModelName + Math.random().toString(36).substring(7),
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
      {/* <div className="mt-10 flex flex-col items-center justify-center w-full text-center">
        
      </div> */}

      {/* <div className="mb-32 mt-8 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Learn{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Templates{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Discover and deploy boilerplate example Next.js&nbsp;projects.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div> */}
    </main>
  )
}
