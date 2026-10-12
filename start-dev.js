const { spawn } = require("child_process");
const path = require("path");

const isWin = process.platform === "win32";

console.log("\x1b[35m%s\x1b[0m", "=================================================");
console.log("\x1b[35m%s\x1b[0m", "   🚀 LocalPickup Full-Stack Platform Active");
console.log("\x1b[35m%s\x1b[0m", "   Frontend: http://localhost:5173");
console.log("\x1b[35m%s\x1b[0m", "   Backend:  http://localhost:5000");
console.log("\x1b[35m%s\x1b[0m", "   Database: SQLite (backend/data/localpickup.db)");
console.log("\x1b[35m%s\x1b[0m", "=================================================");

function startProcess(name, dir, script, color) {
  const child = isWin
    ? spawn("cmd.exe", ["/c", "npm", "run", script], {
        cwd: path.join(__dirname, dir),
        stdio: "pipe",
      })
    : spawn("npm", ["run", script], {
        cwd: path.join(__dirname, dir),
        stdio: "pipe",
      });

  child.stdout.on("data", (data) => {
    process.stdout.write(`${color}[${name}]\x1b[0m ${data.toString()}`);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(`\x1b[31m[${name} Error]\x1b[0m ${data.toString()}`);
  });

  return child;
}

const backend = startProcess("Backend", "backend", "dev", "\x1b[34m");
const frontend = startProcess("Frontend", "frontend", "dev", "\x1b[32m");

function cleanup() {
  console.log("\nStopping all services...");
  backend.kill();
  frontend.kill();
  process.exit();
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
