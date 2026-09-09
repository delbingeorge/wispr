const ACCEPT = "video/*,image/*,audio/*";

export function pickMediaFiles(onFiles: (files: FileList) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ACCEPT;
  input.multiple = true;

  input.onchange = () => {
    if (input.files && input.files.length > 0) onFiles(input.files);
  };

  input.click();
}
