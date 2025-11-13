import "./style.css";
import { App } from "./App";

const canvasElement = document.querySelector<HTMLCanvasElement>("canvas");

if (canvasElement) {
  const app = new App(canvasElement);
}
