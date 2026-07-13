import fs from "fs";
import path from "path";

describe("production deployment contract", () => {
  it("uses an isolated Compose project", () => {
    const script = fs.readFileSync(path.resolve(__dirname, "../restart.sh"), "utf8");

    expect(script).toContain('PROJECT_NAME="${COMPOSE_PROJECT_NAME:-plantnet}"');
    expect(script).not.toMatch(/COMPOSE_PROJECT_NAME=gratheon/);
  });
});
