// File operations needed:  Store, Read, Remove, IfExists

export async function storeFileInOpfs(file: File, path: string): Promise<void> {
  const root = await navigator.storage.getDirectory();
  const handle = await root.getFileHandle(path, { create: true });
  const writable = await handle.createWritable();

  await writable.write(file);
  await writable.close();
}

export async function readFileFromOpfs(path: string): Promise<File> {
  const root = await navigator.storage.getDirectory();
  const handle = await root.getFileHandle(path);

  return handle.getFile();
}
