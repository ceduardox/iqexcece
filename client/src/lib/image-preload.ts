export function preloadImages(urls: string[], timeoutMs = 4500): Promise<void> {
  const unique = Array.from(
    new Set(
      urls
        .map((url) => url.trim())
        .filter((url) => url.length > 0 && !url.startsWith("data:") && !url.startsWith("blob:")),
    ),
  );

  if (!unique.length) return Promise.resolve();

  return new Promise((resolve) => {
    let done = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      resolve();
    };

    const timer = window.setTimeout(finish, timeoutMs);
    const markDone = () => {
      done += 1;
      if (done >= unique.length) finish();
    };

    unique.forEach((url) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = markDone;
      img.onerror = markDone;
      img.src = url;
    });
  });
}

function extractBackgroundUrls(value: string): string[] {
  const urls: string[] = [];
  const pattern = /url\((['"]?)(.*?)\1\)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value)) !== null) {
    if (match[2]) urls.push(match[2]);
  }

  return urls;
}

export function collectPageImageUrls(root: ParentNode = document): string[] {
  const urls: string[] = [];

  root.querySelectorAll("img").forEach((img) => {
    const image = img as HTMLImageElement;
    const src = image.currentSrc || image.src;
    if (src && !image.complete) urls.push(src);
  });

  root.querySelectorAll<HTMLElement>("*").forEach((element) => {
    const backgroundImage = window.getComputedStyle(element).backgroundImage;
    if (backgroundImage && backgroundImage !== "none") {
      urls.push(...extractBackgroundUrls(backgroundImage));
    }
  });

  return urls;
}

export async function waitForRenderedImages(timeoutMs = 4500): Promise<void> {
  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  await preloadImages(collectPageImageUrls(), timeoutMs);
}
