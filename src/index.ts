import { RenderingSystem } from "./RenderingSystem";

const canvasElement = document.querySelector<HTMLCanvasElement>("#canvas");

if (canvasElement) {
  const renderingSystem = new RenderingSystem(canvasElement);
}
