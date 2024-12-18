import { ActionFunctionArgs } from "@remix-run/node";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import memfs from "memfs";
import * as path from "path";
import cached from "~/shared/utils/cached";

const cachedLoader = () =>
  cached(
    "public-agents",
    async () => {
      // Create in-memory storage
      const fs = memfs.fs; // Using memfs for in-memory filesystem

      const repo = "https://github.com/amirrezasalimi/friday-agents";
      const publicAgentsDirPath = "/public-agents"; // The directory you're interested in
      const agents: { name: string; version: string }[] = [];

      // Clone repository to memory
      await git.clone({
        fs,
        http,
        dir: "/",
        url: repo,
        ref: "main",
        singleBranch: true,
      });

      // Check if public-agents exists directly in the root
      const publicAgentsExists = fs.existsSync(publicAgentsDirPath);

      if (!publicAgentsExists) {
        console.error(
          `The directory ${publicAgentsDirPath} does not exist in the repository.`
        );
        throw new Error(
          `The directory ${publicAgentsDirPath} does not exist in the repository.`
        );
      }

      // Read all directories inside public-agents
      const dirs = fs.readdirSync(publicAgentsDirPath);

      // For each directory inside public-agents, check if it contains a package.json
      for (const dir of dirs) {
        const dirPath = path.join(publicAgentsDirPath, dir.toString());
        console.log(`dirPath:`, dirPath);

        // Ensure it's a directory and not a file
        if (fs.statSync(dirPath).isDirectory()) {
          const packageJsonPath = path.join(dirPath, "package.json");

          // Check if package.json exists in the directory
          if (fs.existsSync(packageJsonPath)) {
            // Read the package.json and convert the buffer to string
            const packageJsonBuffer = fs.readFileSync(packageJsonPath);
            const packageJson = JSON.parse(packageJsonBuffer.toString()); // Convert Buffer to string here

            agents.push({
              name: packageJson.name,
              version: packageJson.version,
              ...(packageJson?.info ?? {}),
            });
          }
        }
      }
      return agents;
    },
    60 * 1000
  );

export async function loader() {
  try {
    const data = await cachedLoader();
    console.log("Data:", data);
    return Response.json(data);
  } catch (error) {
    console.error("Error cloning repository:", error);
    return Response.json(
      {
        error: "Failed to clone repository",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
