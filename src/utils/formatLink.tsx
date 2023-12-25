export const strWithLinks = (str: string) => {
  const urlRegex =
    /((?:http|ftp|https):\/\/(?:[\w+?.\w+])+(?:[a-zA-Z0-9~!@#$%^&*()_\-=+\\/?.:;',]*)?(?:[-A-Za-z0-9+&@#/%=~_|]))/i;
  return str.split(urlRegex).map((a, index) => {
    if (a.match(/^https?:\/\//)) {
      return (
        <a
          key={index}
          target="_blank"
          rel="noopener noreferrer nofollow"
          href={a}
        >
          {a}
        </a>
      );
    }
    return a;
  });
};

export const collectLinksFromStr = (str: string) => {
  if (typeof str === "string") {
    const links: string[] = [];
    const urlRegex =
      /((?:http|ftp|https):\/\/[\w/\-?=%.]+\.(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}|(?:https?|ftp):\/\/[\w/\-?=%.]+\.(?:mp3|mp4|jpeg|jpg|png|webp|mov|ogg|gif))/g;
    str.split(urlRegex).map((a, index) => {
      if (a.match(/^https?:\/\//)) {
        links.push(a);
      }
      return a;
    });
    return links;
  }
  return [];
};

export const defineTypeLink = (link: string) => {
  if (typeof link === "string") {
    const u = link.split("?")[0];
    if (u.endsWith(".mov") || u.endsWith(".mp4")) {
      return {
        type: "MovieType",
        url: u,
      };
    } else if (u.includes("youtube.com/") || u.includes("youtu.be/")) {
      let id = "";
      if (u.includes("youtu.be/"))
        id = link
          ? link.split("youtu.be/")[1]?.split("?")[0]?.split("/")[0]
          : "";
      else if (u.includes("youtube.com/"))
        id = link ? link.split("?")[1]?.split("=")[1] : "";

      return {
        type: "YouTubeType",
        url: `https://www.youtube.com/embed/${id}?origin=https://nostr.band`,
      };
    } else if (u.endsWith(".mp3") || u.endsWith(".ogg")) {
      return {
        type: "AudioType",
        url: u,
      };
    } else if (
      u.endsWith(".webp") ||
      u.endsWith(".jpg") ||
      u.endsWith(".jpeg") ||
      u.endsWith(".gif") ||
      u.endsWith(".png")
    ) {
      return {
        type: "PictureType",
        url: u,
      };
    }
  }
};

export function extractNostrStrings(inputString: string) {
  const nostrPattern = /nostr:[a-zA-Z0-9]+/g;
  const matches = [];
  let match;

  while ((match = nostrPattern.exec(inputString)) !== null) {
    matches.push(match[0].slice("nostr:".length));
  }

  return matches;
}

export function replaceNostrLinks(
  inputText: string,
  replacementText: string,
  pattern: string,
): string {
  const nostrPattern = pattern;
  return inputText
    .toString()
    ?.replace(nostrPattern, `[${replacementText}](/${pattern.split(":")[1]})`);
}
