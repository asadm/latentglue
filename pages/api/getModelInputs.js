import {JSDOM} from 'jsdom';

export default async function handler(req, res) {
  // get model from query
  const model = req.query.model || "stability-ai/sdxl";
  const url = `https://replicate.com/${model}/api`;
  console.log(url);
  const json = await getAllScriptTags(url);
  if (json.length === 0) {
    res.status(404).json({error: "No model found"});
  }
  try{
    const correctJSON = JSON.parse(json[1].content);
    res.status(200).json(correctJSON.version.openapi_schema.components.schemas.Input.properties);
  } catch (e) {
    console.log(e);
    res.status(404).json({error: "No model found"});
  }
}

async function getAllScriptTags(url) {
  try {
    // Fetch HTML content from the URL using jsdom
    const dom = await JSDOM.fromURL(url);
    const document = dom.window.document;

    // Select all script elements in the document
    const scriptTags = document.querySelectorAll('script[type="application/json"]');

    // Extract the script content or attributes as needed
    const scriptData = Array.from(scriptTags).map(script => {
      return {
        content: script.textContent, // Get script content
        attributes: Array.from(script.attributes).map(attr => ({
          name: attr.name,
          value: attr.value,
        })), // Get script attributes
      };
    });

    return scriptData;
  } catch (error) {
    throw new Error('Error:', error);
  }
}

async function htmlToJson(url) {
  try {
    // Fetch HTML content from the URL using jsdom
    const dom = await JSDOM.fromURL(url);
    const document = dom.window.document;

    console.log("text", document.querySelector('script').innerHTML);
    const scripts = document.querySelectorAll('script');
    console.log(scripts);
    // Convert the DOM tree to JSON
    // const json = elementToJson(document.body.querySelectorAll('script'));

    return {};
  } catch (error) {
    console.log('Error:', error);
    throw new Error('Error:', error);
  }
}

function elementToJson(element) {
  console.log(element);
  const json = {};

  // Store element's tag name
  json.tag = element.tagName.toLowerCase();

  // Store element's attributes
  json.attributes = {};
  for (const attribute of element.attributes) {
    json.attributes[attribute.name] = attribute.value;
  }

  // Store inner text
  json.innerText = element.innerText;

  // Recursively convert child elements to JSON
  json.children = Array.from(element.children).map(child => elementToJson(child));

  return json;
}