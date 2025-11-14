import { Entity } from "./EntityManager";
import { RenderingSystem } from "./Renderer";

export class DummyEntity extends Entity {
  width: number = 2;
  height: number = 2;

  data: undefined;

  constructor() {
    super();
    this.computeBoundingRect();
  }

  render(renderer: RenderingSystem): void {
    const ctx = renderer.ctx;

    ctx.fillStyle = "red";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  serialize(): string {
    throw new Error("Method not implemented.");
  }
}
