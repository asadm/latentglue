

export const defaultSteps = [{
  id: 'sdxl-step',
  type: "replicate",
  model: "stability-ai/sdxl",
  inputs: {
    "mask": {
      "type": "string",
      "title": "Mask",
      "format": "uri",
      "x-order": 3,
      "description": "Input mask for inpaint mode. Black areas will be preserved, white areas will be inpainted."
    },
    "seed": {
      "type": "integer",
      "title": "Seed",
      "x-order": 11,
      "description": "Random seed. Leave blank to randomize the seed"
    },
    "image": {
      "type": "string",
      "title": "Image",
      "format": "uri",
      "x-order": 2,
      "description": "Input image for img2img or inpaint mode"
    },
    "width": {
      "type": "integer",
      "title": "Width",
      "default": 1024,
      "x-order": 4,
      "description": "Width of output image"
    },
    "height": {
      "type": "integer",
      "title": "Height",
      "default": 1024,
      "x-order": 5,
      "description": "Height of output image"
    },
    "prompt": {
      "type": "string",
      "title": "Prompt",
      "default": "An astronaut riding a rainbow unicorn",
      "x-order": 0,
      "description": "Input prompt"
    },
    "refine": {
      "enum": [
        "no_refiner",
        "expert_ensemble_refiner",
        "base_image_refiner"
      ],
      "type": "string",
      "title": "refine",
      "description": "Which refine style to use",
      "default": "no_refiner",
      "x-order": 12
    },
    "scheduler": {
      "enum": [
        "DDIM",
        "DPMSolverMultistep",
        "HeunDiscrete",
        "KarrasDPM",
        "K_EULER_ANCESTRAL",
        "K_EULER",
        "PNDM"
      ],
      "type": "string",
      "title": "scheduler",
      "description": "scheduler",
      "default": "K_EULER",
      "x-order": 7
    },
    "lora_scale": {
      "type": "number",
      "title": "Lora Scale",
      "default": 0.6,
      "maximum": 1,
      "minimum": 0,
      "x-order": 16,
      "description": "LoRA additive scale. Only applicable on trained models."
    },
    "num_outputs": {
      "type": "integer",
      "title": "Num Outputs",
      "default": 1,
      "maximum": 4,
      "minimum": 1,
      "x-order": 6,
      "description": "Number of images to output."
    },
    "refine_steps": {
      "type": "integer",
      "title": "Refine Steps",
      "x-order": 14,
      "description": "For base_image_refiner, the number of steps to refine, defaults to num_inference_steps"
    },
    "guidance_scale": {
      "type": "number",
      "title": "Guidance Scale",
      "default": 7.5,
      "maximum": 50,
      "minimum": 1,
      "x-order": 9,
      "description": "Scale for classifier-free guidance"
    },
    "apply_watermark": {
      "type": "boolean",
      "title": "Apply Watermark",
      "default": true,
      "x-order": 15,
      "description": "Applies a watermark to enable determining if an image is generated in downstream applications. If you have other provisions for generating or deploying images safely, you can use this to disable watermarking."
    },
    "high_noise_frac": {
      "type": "number",
      "title": "High Noise Frac",
      "default": 0.8,
      "maximum": 1,
      "minimum": 0,
      "x-order": 13,
      "description": "For expert_ensemble_refiner, the fraction of noise to use"
    },
    "negative_prompt": {
      "type": "string",
      "title": "Negative Prompt",
      "default": "",
      "x-order": 1,
      "description": "Input Negative Prompt"
    },
    "prompt_strength": {
      "type": "number",
      "title": "Prompt Strength",
      "default": 0.8,
      "maximum": 1,
      "minimum": 0,
      "x-order": 10,
      "description": "Prompt strength when using img2img / inpaint. 1.0 corresponds to full destruction of information in image"
    },
    "num_inference_steps": {
      "type": "integer",
      "title": "Num Inference Steps",
      "default": 50,
      "maximum": 500,
      "minimum": 1,
      "x-order": 8,
      "description": "Number of denoising steps"
    }
  }
}];