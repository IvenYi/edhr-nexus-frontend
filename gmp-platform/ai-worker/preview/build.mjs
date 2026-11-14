import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const here=fileURLToPath(new URL('.',import.meta.url));
export async function buildPreview(outfile) {
  await build({entryPoints:[resolve(here,'entry.tsx')],outfile,bundle:true,format:'iife',platform:'browser',jsx:'automatic',
    alias:{'@':resolve(here,'../../frontend/src'),react:resolve(here,'../../frontend/node_modules/react'),'react-dom':resolve(here,'../../frontend/node_modules/react-dom'),'@mui/icons-material':resolve(here,'../../frontend/node_modules/@mui/icons-material/esm')},nodePaths:[resolve(here,'../../frontend/node_modules')],
    define:{'process.env.NODE_ENV':'"production"','import.meta.env':'{}'},logLevel:'silent'});
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  if(!process.argv[2])throw new Error('Build output required');
  await buildPreview(resolve(process.argv[2]));
}
